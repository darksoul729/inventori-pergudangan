<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Mail\PetayuSystemMail;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $invoices = Invoice::with(['customer', 'creator'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('invoice_number', 'like', "%{$search}%")
                        ->orWhere('payment_status', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('created_at')
            ->get();

        $hasCustomers = Customer::where('tenant_id', (int) (auth()->user()?->tenant_id ?? 0))->exists();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => ['search' => $search],
            'has_customers' => $hasCustomers,
        ]);
    }

    public function create()
    {
        $tenantId = (int) (auth()->user()?->tenant_id ?? 0);

        $customers = Customer::query()
            ->where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'email']);

        $products = Product::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'selling_price']);

        $autoNumber = $this->generateInvoiceNumber($tenantId);

        $hasCustomers = $customers->isNotEmpty();
        $hasProducts  = $products->isNotEmpty();

        return Inertia::render('Invoices/Create', [
            'customers'     => $customers,
            'products'      => $products,
            'autoNumber'    => $autoNumber,
            'has_customers' => $hasCustomers,
            'has_products'  => $hasProducts,
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $validated = $request->validate([
            'invoice_number' => 'nullable|string|unique:invoices,invoice_number',
            'customer_id' => [
                'required',
                Rule::exists('customers', 'id')->where(fn ($q) => $q->where('tenant_id', $tenantId)),
            ],
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'notes' => 'nullable|string',
            'send_email' => 'nullable|boolean',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $invoice = DB::transaction(function () use ($validated, $request) {
            $total = collect($validated['items'])->sum(fn ($item) => (int) $item['quantity'] * (float) $item['unit_price']);

            $invoice = Invoice::create([
                'invoice_number' => $validated['invoice_number'] ?? $this->generateInvoiceNumber((int) ($request->user()?->tenant_id ?? 0)),
                'customer_id' => $validated['customer_id'],
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'total_amount' => $total,
                'payment_status' => 'belum_dibayar',
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()?->id,
            ]);

            foreach ($validated['items'] as $item) {
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $quantity * $unitPrice,
                ]);
            }

            return $invoice;
        });

        $sendEmail = (bool) ($validated['send_email'] ?? false);
        if ($sendEmail) {
            $invoice->loadMissing(['customer', 'items', 'creator']);
            $customerEmail = trim((string) ($invoice->customer?->email ?? ''));
            $warehouse = $this->resolveInvoiceWarehouse($invoice);
            if ($customerEmail !== '') {
                $document = $this->buildInvoiceDocument($invoice);
                $pdfBinary = Pdf::loadView('wms_documents.document_pdf', [
                    'document' => $document,
                    'generatedAt' => now(),
                ])->setPaper('a4', 'portrait')->output();

                $this->sendMailWithRetry($customerEmail, new PetayuSystemMail(
                    subjectLine: 'Invoice ' . $invoice->invoice_number . ' dari ' . config('app.name', 'Petayu WMS'),
                    heading: 'Invoice untuk ' . ($invoice->customer?->name ?? 'Pelanggan'),
                    lines: [
                        'Terlampir invoice terbaru untuk transaksi Anda.',
                        'Mohon lakukan pembayaran sebelum tanggal jatuh tempo.',
                    ],
                    ctaLabel: null,
                    ctaUrl: null,
                    meta: [
                        'Nomor Invoice' => $invoice->invoice_number,
                        'Pelanggan' => $invoice->customer?->name ?? '-',
                        'Gudang Asal' => $warehouse?->name ?? 'Gudang Operasional',
                        'Lokasi Gudang' => $warehouse?->location ?: 'Belum diatur',
                        'Total Tagihan' => 'Rp ' . number_format((float) $invoice->total_amount, 0, ',', '.'),
                        'Jatuh Tempo' => $invoice->due_date ? $invoice->due_date->format('d M Y') : '-',
                    ],
                    attachmentsData: [[
                        'name' => 'Invoice_' . $invoice->invoice_number . '.pdf',
                        'mime' => 'application/pdf',
                        'data' => base64_encode($pdfBinary),
                        'is_base64' => true,
                    ]],
                    showSecurityWarning: false,
                ));

                return redirect()->route('invoices.index')->with('success', 'Tagihan berhasil dibuat dan dikirim ke email pelanggan.');
            }

            return redirect()->route('invoices.index')->with('success', 'Tagihan berhasil dibuat. Email pelanggan kosong, jadi invoice tidak dikirim.');
        }

        return redirect()->route('invoices.index')->with('success', 'Tagihan berhasil dibuat.');
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['customer', 'items', 'creator']);
        $tenant = \App\Models\Tenant::query()->find((int) ($invoice->tenant_id ?? 0));

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
            'invoiceNotificationSettings' => [
                'notify_partial' => (bool) ($tenant?->invoice_email_on_partial ?? true),
                'notify_paid' => (bool) ($tenant?->invoice_email_on_paid ?? true),
            ],
        ]);
    }

    public function downloadPdf(Invoice $invoice)
    {
        $invoice->loadMissing(['customer', 'items', 'creator']);
        $document = $this->buildInvoiceDocument($invoice);

        $pdf = Pdf::loadView('wms_documents.document_pdf', [
            'document' => $document,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('Invoice_'.$invoice->invoice_number.'.pdf');
    }

    private function buildInvoiceDocument(Invoice $invoice): array
    {
        $warehouse = $this->resolveInvoiceWarehouse($invoice);
        $warehouseName = $warehouse?->name ?? 'Gudang Operasional';
        $warehouseLocation = $warehouse?->location ?: 'Belum diatur';

        return [
            'title' => 'INVOICE',
            'number' => $invoice->invoice_number,
            'subtitle' => 'Dokumen tagihan pelanggan dari ' . $warehouseName,
            'status' => match ($invoice->payment_status) {
                'lunas' => 'Lunas',
                'sebagian' => 'Sebagian',
                default => 'Belum Dibayar',
            },
            'issuer' => [
                'name' => $warehouseName,
                'location' => $warehouseLocation,
            ],
            'stats' => [
                ['label' => 'Pelanggan', 'value' => $invoice->customer?->name ?? '-'],
                ['label' => 'Gudang Asal', 'value' => $warehouseName],
                ['label' => 'Tanggal', 'value' => optional($invoice->invoice_date)->format('d M Y')],
                ['label' => 'Jatuh Tempo', 'value' => $invoice->due_date ? $invoice->due_date->format('d M Y') : '-'],
                ['label' => 'Total', 'value' => 'Rp ' . number_format((float) $invoice->total_amount, 0, ',', '.')],
            ],
            'details' => [
                ['label' => 'Nomor Tagihan', 'value' => $invoice->invoice_number],
                ['label' => 'Nama Pelanggan', 'value' => $invoice->customer?->name ?? '-'],
                ['label' => 'Lokasi Gudang', 'value' => $warehouseLocation],
                ['label' => 'Catatan', 'value' => $invoice->notes],
                ['label' => 'Dibuat Oleh', 'value' => $invoice->creator?->name ?? '-'],
            ],
            'columns' => [
                ['label' => 'Deskripsi', 'key' => 'description'],
                ['label' => 'Qty', 'key' => 'quantity', 'align' => 'right'],
                ['label' => 'Harga', 'key' => 'unit_price', 'align' => 'right'],
                ['label' => 'Subtotal', 'key' => 'subtotal', 'align' => 'right'],
            ],
            'rows' => $invoice->items->map(fn ($item) => [
                'description' => $item->description,
                'quantity' => (string) $item->quantity,
                'unit_price' => 'Rp ' . number_format((float) $item->unit_price, 0, ',', '.'),
                'subtotal' => 'Rp ' . number_format((float) $item->subtotal, 0, ',', '.'),
            ])->all(),
        ];
    }

    public function updateStatus(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:belum_dibayar,sebagian,lunas',
            'notify_lunas' => 'sometimes|boolean',
            'notify_sebagian' => 'sometimes|boolean',
        ]);

        $oldStatus = (string) $invoice->payment_status;
        $invoice->update([
            'payment_status' => $validated['payment_status'],
        ]);

        $newStatus = (string) $validated['payment_status'];
        $tenant = \App\Models\Tenant::query()->find((int) ($invoice->tenant_id ?? 0));
        $notifyLunas = array_key_exists('notify_lunas', $validated)
            ? (bool) $validated['notify_lunas']
            : (bool) ($tenant?->invoice_email_on_paid ?? true);
        $notifySebagian = array_key_exists('notify_sebagian', $validated)
            ? (bool) $validated['notify_sebagian']
            : (bool) ($tenant?->invoice_email_on_partial ?? true);
        $shouldSendStatusEmail = ($newStatus === 'lunas' && $notifyLunas) || ($newStatus === 'sebagian' && $notifySebagian);
        if ($newStatus !== $oldStatus && $shouldSendStatusEmail) {
            $invoice->loadMissing(['customer', 'items', 'creator']);
            $customerEmail = trim((string) ($invoice->customer?->email ?? ''));
            if ($customerEmail !== '') {
                $warehouse = $this->resolveInvoiceWarehouse($invoice);
                $statusLabel = match ($newStatus) {
                    'lunas' => 'Lunas',
                    'sebagian' => 'Dibayar Sebagian',
                    default => 'Belum Dibayar',
                };

                $document = $this->buildInvoiceDocument($invoice);
                $pdfBinary = Pdf::loadView('wms_documents.document_pdf', [
                    'document' => $document,
                    'generatedAt' => now(),
                ])->setPaper('a4', 'portrait')->output();

                $this->sendMailWithRetry($customerEmail, new PetayuSystemMail(
                    subjectLine: 'Update Pembayaran Invoice ' . $invoice->invoice_number,
                    heading: 'Status Pembayaran Diperbarui',
                    lines: [
                        'Status pembayaran invoice Anda telah diperbarui.',
                        'Silakan lihat status terbaru pada lampiran invoice.',
                    ],
                    ctaLabel: null,
                    ctaUrl: null,
                    meta: [
                        'Nomor Invoice' => $invoice->invoice_number,
                        'Status Baru' => $statusLabel,
                        'Pelanggan' => $invoice->customer?->name ?? '-',
                        'Gudang Asal' => $warehouse?->name ?? 'Gudang Operasional',
                        'Lokasi Gudang' => $warehouse?->location ?: 'Belum diatur',
                        'Total Tagihan' => 'Rp ' . number_format((float) $invoice->total_amount, 0, ',', '.'),
                    ],
                    attachmentsData: [[
                        'name' => 'Invoice_' . $invoice->invoice_number . '.pdf',
                        'mime' => 'application/pdf',
                        'data' => base64_encode($pdfBinary),
                        'is_base64' => true,
                    ]],
                    showSecurityWarning: false,
                ));
            }
        }

        return back()->with('success', 'Status pembayaran berhasil diperbarui.');
    }

    private function resolveInvoiceWarehouse(Invoice $invoice): ?Warehouse
    {
        $tenantId = (int) ($invoice->tenant_id ?? 0);

        return Warehouse::query()
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->orderBy('id')
            ->first();
    }

    private function sendMailWithRetry(string|array $recipient, PetayuSystemMail $mail): void
    {
        $attempts = 0;
        $maxAttempts = 3;
        $lastException = null;

        while ($attempts < $maxAttempts) {
            $attempts++;
            try {
                Mail::to($recipient)->send($mail);
                return;
            } catch (\Throwable $e) {
                $lastException = $e;
                usleep($attempts * 200000);
            }
        }

        Log::warning('Invoice email failed after retries', [
            'recipient' => $recipient,
            'attempts' => $attempts,
            'message' => $lastException?->getMessage(),
        ]);
    }

    private function generateInvoiceNumber(int $tenantId): string
    {
        $tenant = \App\Models\Tenant::query()->find($tenantId);
        $tenantCode = strtoupper(trim((string) ($tenant?->code ?? 'TEN')));
        $tenantCode = preg_replace('/[^A-Z0-9]/', '', $tenantCode) ?: 'TEN';
        return 'INV-' . $tenantCode . '-' . now()->format('Ym') . '-' . strtoupper(Str::random(4));
    }
}
