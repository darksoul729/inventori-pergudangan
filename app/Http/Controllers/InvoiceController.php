<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        $customers = Customer::orderBy('name')->get(['id', 'name', 'code']);
        $autoNumber = 'INV-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

        return Inertia::render('Invoices/Create', [
            'customers' => $customers,
            'autoNumber' => $autoNumber,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_number' => 'required|string|unique:invoices,invoice_number',
            'customer_id' => 'required|exists:customers,id',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $total = collect($validated['items'])->sum(fn ($item) => (int) $item['quantity'] * (float) $item['unit_price']);

            $invoice = Invoice::create([
                'invoice_number' => $validated['invoice_number'],
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
        });

        return redirect()->route('invoices.index')->with('success', 'Tagihan berhasil dibuat.');
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['customer', 'items', 'creator']);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    public function downloadPdf(Invoice $invoice)
    {
        $invoice->loadMissing(['customer', 'items', 'creator']);

        $document = [
            'title' => 'INVOICE',
            'number' => $invoice->invoice_number,
            'subtitle' => 'Dokumen tagihan pelanggan',
            'status' => match ($invoice->payment_status) {
                'lunas' => 'Lunas',
                'sebagian' => 'Sebagian',
                default => 'Belum Dibayar',
            },
            'stats' => [
                ['label' => 'Pelanggan', 'value' => $invoice->customer?->name ?? '-'],
                ['label' => 'Tanggal', 'value' => optional($invoice->invoice_date)->format('d M Y')],
                ['label' => 'Jatuh Tempo', 'value' => $invoice->due_date ? $invoice->due_date->format('d M Y') : '-'],
                ['label' => 'Total', 'value' => 'Rp ' . number_format((float) $invoice->total_amount, 0, ',', '.')],
            ],
            'details' => [
                ['label' => 'Nomor Tagihan', 'value' => $invoice->invoice_number],
                ['label' => 'Nama Pelanggan', 'value' => $invoice->customer?->name ?? '-'],
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

        $pdf = Pdf::loadView('wms_documents.document_pdf', [
            'document' => $document,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('Invoice_'.$invoice->invoice_number.'.pdf');
    }

    public function updateStatus(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:belum_dibayar,sebagian,lunas',
        ]);

        $invoice->update([
            'payment_status' => $validated['payment_status'],
        ]);

        return back()->with('success', 'Status pembayaran berhasil diperbarui.');
    }
}
