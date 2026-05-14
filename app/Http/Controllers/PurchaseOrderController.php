<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Mail\PetayuSystemMail;
use App\Models\PurchaseOrderEmailLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\Product;
use App\Models\ProductStock;
use App\Traits\HandlesStockSync;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PurchaseOrderController extends Controller
{
    use HandlesStockSync;

    private function resolveOperationalWarehouse(Request $request): Warehouse
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        abort_unless($tenantId > 0, 403, 'Akun belum terhubung ke tenant.');

        return Warehouse::where('tenant_id', $tenantId)
            ->orderBy('id')
            ->firstOrFail(['id', 'name', 'location']);
    }

    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'warehouse', 'creator', 'items'])
            ->orderBy('created_at', 'desc');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', fn ($s) => $s->where('name', 'like', "%{$search}%"));
            });
        }

        $paginated = $query->paginate($request->query('per_page', 15))->withQueryString();

        $paginated->getCollection()->transform(function ($po) {
            $po->total_amount = $po->items->sum('subtotal');
            return $po;
        });

        // Stats from all POs (unfiltered)
        $allPOs = PurchaseOrder::with('items')->get();
        $stats = [
            'total' => $allPOs->count(),
            'pending' => $allPOs->where('status', 'pending')->count(),
            'approved' => $allPOs->where('status', 'approved')->count(),
            'received' => $allPOs->where('status', 'received')->count(),
            'totalAmount' => $allPOs->sum(fn ($po) => $po->items->sum('subtotal')),
        ];

        return Inertia::render('PurchaseOrders/Index', [
            'purchaseOrders' => $paginated,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search', 'per_page']),
        ]);
    }

    public function create(Request $request)
    {
        $suppliers = Supplier::where('status', 'active')->get(['id', 'name', 'code']);
        $operationalWarehouse = $this->resolveOperationalWarehouse($request);
        $products = Product::all(['id', 'sku', 'name', 'unit_id', 'image']);
        $hasSuppliers = $suppliers->isNotEmpty();

        // Auto generate string PO
        $tenantCode = strtoupper((string) ($request->user()?->tenant?->code ?? 'TEN'));
        $tenantCode = preg_replace('/[^A-Z0-9]/', '', $tenantCode) ?: 'TEN';
        $autoPoNumber = 'PO-' . $tenantCode . '-' . now()->format('Ym') . '-' . strtoupper(Str::random(4));

        return Inertia::render('PurchaseOrders/Create', [
            'suppliers' => $suppliers,
            'products' => $products,
            'autoPoNumber' => $autoPoNumber,
            'operationalWarehouse' => $operationalWarehouse,
            'has_suppliers' => $hasSuppliers,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create-purchaseOrder');
        $operationalWarehouse = $this->resolveOperationalWarehouse($request);

        $validated = $request->validate([
            'po_number' => 'required|string|unique:purchase_orders,po_number',
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date|after_or_equal:order_date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.batch_number' => 'nullable|string|max:100',
            'items.*.expired_date' => 'nullable|date',
        ]);

        $validated['warehouse_id'] = $validated['warehouse_id'] ?? $operationalWarehouse->id;

        if ((int) $validated['warehouse_id'] !== (int) $operationalWarehouse->id) {
            throw ValidationException::withMessages([
                'warehouse_id' => 'Gudang tidak valid untuk tenant Anda.',
            ]);
        }

        $po = DB::transaction(function () use ($validated, $request) {
            $po = PurchaseOrder::create([
                'po_number' => $validated['po_number'],
                'supplier_id' => $validated['supplier_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'],
                'status' => 'pending',
                'notes' => $validated['notes'],
                'created_by' => $request->user()->id,
            ]);

            foreach ($validated['items'] as $itemData) {
                $subtotal = $itemData['quantity'] * $itemData['unit_price'];
                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $subtotal,
                    'batch_number' => $itemData['batch_number'] ?? null,
                    'expired_date' => $itemData['expired_date'] ?? null,
                ]);
            }
            return $po;
        });

        $po->loadMissing([
            'supplier:id,name,code,contact_person,email,phone,address,city',
            'warehouse:id,name,location',
            'creator:id,name,email',
            'items.product:id,sku,name',
        ]);

        $sentEmail = $this->sendPurchaseOrderEmailOnce($request, $po);
        $message = $sentEmail
            ? 'Purchase Order berhasil dibuat dan otomatis dikirim ke email pemasok.'
            : 'Purchase Order berhasil dibuat. Email pemasok kosong, jadi PO belum dikirim.';

        return redirect()->route('purchase-orders.index')->with('success', $message);
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load([
            'supplier',
            'warehouse',
            'creator',
            'approver',
            'items.product',
            'goodsReceipts.items',
            'emailLogs.sender:id,name',
        ]);
        $purchaseOrder->total_amount = $purchaseOrder->items->sum('subtotal');

        return Inertia::render('PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function downloadPdf(PurchaseOrder $purchaseOrder)
    {
        $document = $this->documentPayload($purchaseOrder);

        $pdf = Pdf::loadView('wms_documents.document_pdf', [
            'document' => $document,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('Purchase_Order_'.$purchaseOrder->po_number.'.pdf');
    }

    public function updateStatus(Request $request, PurchaseOrder $purchaseOrder)
    {
        Gate::authorize('update-purchaseOrder');
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,received,cancelled',
            'received_items' => 'nullable|array',
            'received_items.*.purchase_order_item_id' => 'required_with:received_items|exists:purchase_order_items,id',
            'received_items.*.quantity_received' => 'required_with:received_items|integer|min:1',
            'received_items.*.batch_number' => 'nullable|string|max:100',
            'received_items.*.expired_date' => 'nullable|date',
            'auto_putaway' => 'nullable|boolean',
        ]);

        if (in_array($validated['status'], ['approved', 'rejected', 'cancelled'], true)) {
            abort_unless($this->isManager($request) || $this->isSupervisor($request), 403, 'Hanya Supervisor atau Manager yang dapat menyetujui, menolak, atau membatalkan PO.');
        }

        if ($validated['status'] === 'received') {
            abort_unless(
                $this->isManager($request) || $this->isSupervisor($request) || $this->isStaff($request),
                403, 'Hanya Staff, Supervisor, atau Manager yang dapat mengkonfirmasi penerimaan barang.'
            );
        }

        DB::transaction(function () use ($validated, $request, $purchaseOrder) {
            $purchaseOrder->loadMissing(['items', 'goodsReceipts']);
            $previousStatus = $purchaseOrder->status;
            $updateData = ['status' => $validated['status']];

            if ($validated['status'] === 'received' && !in_array($previousStatus, ['approved', 'received'], true)) {
                throw ValidationException::withMessages([
                    'status' => 'PO harus disetujui Manager Gudang sebelum bisa dikonfirmasi diterima.',
                ]);
            }
            
            if ($validated['status'] === 'approved') {
                $updateData['approved_by'] = $request->user()->id;
            }

            $purchaseOrder->update($updateData);

            // If marked as received, create a Goods Receipt record
            if ($validated['status'] === 'received' && $previousStatus !== 'received' && $purchaseOrder->goodsReceipts->isEmpty()) {
                $autoPutaway = array_key_exists('auto_putaway', $validated)
                    ? filter_var($validated['auto_putaway'], FILTER_VALIDATE_BOOLEAN)
                    : true;

                $receivedItemsMap = collect($validated['received_items'] ?? [])
                    ->keyBy(fn ($item) => (int) $item['purchase_order_item_id']);
                $purchaseOrderItemIds = $purchaseOrder->items->pluck('id')->map(fn ($id) => (int) $id)->all();
                $invalidItemIds = $receivedItemsMap->keys()
                    ->filter(fn ($itemId) => !in_array((int) $itemId, $purchaseOrderItemIds, true));
                if ($invalidItemIds->isNotEmpty()) {
                    throw ValidationException::withMessages([
                        'received_items' => 'Ada item penerimaan yang tidak sesuai dengan PO ini.',
                    ]);
                }

                $receipt = \App\Models\GoodsReceipt::create([
                    'receipt_number' => 'GR-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                    'purchase_order_id' => $purchaseOrder->id,
                    'supplier_id' => $purchaseOrder->supplier_id,
                    'warehouse_id' => $purchaseOrder->warehouse_id,
                    'receipt_date' => now()->format('Y-m-d'),
                    'status' => 'received',
                    'notes' => $autoPutaway
                        ? 'Penerimaan dengan auto put-away aktif.'
                        : 'Penerimaan tanpa auto put-away. Stok masuk sebagai floating/unplaced.',
                    'created_by' => $request->user()->id,
                ]);

                // Copy items from PO to GR and put received stock into warehouse racks.
                foreach ($purchaseOrder->items as $item) {
                    $receivedItem = $receivedItemsMap->get((int) $item->id, []);
                    $quantityReceived = (int) ($receivedItem['quantity_received'] ?? $item->quantity);

                    if ($quantityReceived < 1 || $quantityReceived > (int) $item->quantity) {
                        throw ValidationException::withMessages([
                            'received_items' => "Qty terima untuk item {$item->product_id} harus antara 1 sampai {$item->quantity}.",
                        ]);
                    }

                    $batchNumber = $receivedItem['batch_number']
                        ?? $item->batch_number
                        ?? ('B-' . now()->format('Ymd') . '-' . $item->product_id);
                    $expiredDate = $receivedItem['expired_date'] ?? $item->expired_date ?? null;

                    \App\Models\GoodsReceiptItem::create([
                        'goods_receipt_id' => $receipt->id,
                        'product_id' => $item->product_id,
                        'quantity_received' => $quantityReceived,
                        'unit_price' => $item->unit_price,
                        'subtotal' => $quantityReceived * (float) $item->unit_price,
                        'batch_number' => $batchNumber,
                        'expired_date' => $expiredDate,
                    ]);

                    $this->putAwayReceivedItem(
                        request: $request,
                        warehouseId: (int) $purchaseOrder->warehouse_id,
                        productId: (int) $item->product_id,
                        quantity: $quantityReceived,
                        receiptId: (int) $receipt->id,
                        batchNumber: $batchNumber,
                        expiredDate: $expiredDate,
                        autoPutaway: $autoPutaway,
                    );
                }

                // Trigger automatic performance calculation for this supplier for the current month
                \Illuminate\Support\Facades\Artisan::call('supplier:calculate-performance', [
                    '--month' => now()->month,
                    '--year' => now()->year,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Status Purchase Order berhasil diperbarui menjadi ' . $validated['status'] . '.');
    }

    private function sendPurchaseOrderEmailOnce(Request $request, PurchaseOrder $purchaseOrder): bool
    {
        $recipientEmail = trim((string) ($purchaseOrder->supplier?->email ?? ''));
        if ($recipientEmail === '') {
            return false;
        }

        $subject = 'Purchase Order ' . $purchaseOrder->po_number . ' dari ' . ($purchaseOrder->warehouse?->name ?? 'Gudang Operasional');
        $document = $this->documentPayload($purchaseOrder);
        $pdfFileName = 'Purchase_Order_' . $purchaseOrder->po_number . '.pdf';
        $pdfBinary = Pdf::loadView('wms_documents.document_pdf', [
            'document' => $document,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait')->output();

        $topItems = $purchaseOrder->items
            ->take(5)
            ->map(function (PurchaseOrderItem $item) {
                $name = trim((string) ($item->product?->name ?? 'Produk'));
                return '- ' . $name . ' x' . number_format((float) $item->quantity, 0, ',', '.');
            })
            ->all();

        $creatorName = trim((string) ($purchaseOrder->creator?->name ?? 'Tim Gudang'));
        $creatorEmail = trim((string) ($request->user()?->email ?? ''));
        $warehouseName = trim((string) ($purchaseOrder->warehouse?->name ?? 'Gudang Operasional'));
        $ctaLabel = null;
        $ctaUrl = null;
        if ($creatorEmail !== '') {
            $subjectMail = rawurlencode('Konfirmasi PO ' . $purchaseOrder->po_number);
            $bodyMail = rawurlencode(
                "Halo {$creatorName},\n\nKami dari pemasok ingin konfirmasi PO {$purchaseOrder->po_number} ({$warehouseName}).\n\nTerima kasih."
            );
            $ctaLabel = 'Hubungi PIC Gudang';
            $ctaUrl = "mailto:{$creatorEmail}?subject={$subjectMail}&body={$bodyMail}";
        }

        $lines = array_merge([
            'Berikut kami lampirkan dokumen Purchase Order resmi untuk kebutuhan pengadaan barang.',
            'Mohon konfirmasi ketersediaan dan estimasi pengiriman barang.',
            'Ringkasan item utama:',
        ], $topItems, [
            'Detail lengkap spesifikasi, qty, harga, dan catatan ada di lampiran PDF.',
        ]);

        try {
            $this->sendMailWithRetry($recipientEmail, new PetayuSystemMail(
            subjectLine: $subject,
            heading: 'Purchase Order Baru',
            lines: $lines,
            ctaLabel: $ctaLabel,
            ctaUrl: $ctaUrl,
            meta: [
                'Nomor PO' => $purchaseOrder->po_number,
                'Nama Pemasok' => $purchaseOrder->supplier?->name ?? '-',
                'Gudang Pengirim' => $purchaseOrder->warehouse?->name ?? 'Gudang Operasional',
                'Lokasi Gudang' => $purchaseOrder->warehouse?->location ?: 'Belum diatur',
                'Tanggal PO' => optional($purchaseOrder->order_date)->format('d M Y') ?? '-',
                'Target Datang' => optional($purchaseOrder->expected_date)->format('d M Y') ?? '-',
                'Total PO' => 'Rp ' . number_format((float) $purchaseOrder->items->sum('subtotal'), 0, ',', '.'),
            ],
            attachmentsData: [[
                'name' => $pdfFileName,
                'mime' => 'application/pdf',
                'data' => base64_encode($pdfBinary),
                'is_base64' => true,
            ]],
            showSecurityWarning: false,
            templateStyle: 'clean',
        ));
        } catch (\Throwable $e) {
            Log::warning('PO email skipped after retry failure', [
                'purchase_order_id' => $purchaseOrder->id,
                'recipient' => $recipientEmail,
                'message' => $e->getMessage(),
            ]);
            return false;
        }

        PurchaseOrderEmailLog::create([
            'tenant_id' => (int) ($purchaseOrder->tenant_id ?? $request->user()?->tenant_id ?? 0),
            'purchase_order_id' => (int) $purchaseOrder->id,
            'supplier_id' => (int) $purchaseOrder->supplier_id,
            'sent_by' => (int) ($request->user()?->id ?? 0),
            'recipient_email' => $recipientEmail,
            'subject' => $subject,
            'attachment_name' => $pdfFileName,
            'sent_at' => now(),
        ]);

        return true;
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

        Log::warning('PO email failed after retries', [
            'recipient' => $recipient,
            'attempts' => $attempts,
            'message' => $lastException?->getMessage(),
        ]);

        throw $lastException ?? new \RuntimeException('Unknown mail delivery error.');
    }

    private function isManager(Request $request): bool
    {
        $roleName = strtolower((string) ($request->user()?->role?->name ?? ''));

        return str_contains($roleName, 'manager')
            || str_contains($roleName, 'manajer')
            || str_contains($roleName, 'admin gudang');
    }

    private function isSupervisor(Request $request): bool
    {
        $roleName = strtolower((string) ($request->user()?->role?->name ?? ''));
        return str_contains($roleName, 'supervisor') || str_contains($roleName, 'spv');
    }

    private function isStaff(Request $request): bool
    {
        $roleName = strtolower((string) ($request->user()?->role?->name ?? ''));
        return str_contains($roleName, 'staff') || str_contains($roleName, 'staf');
    }

    private function putAwayReceivedItem(
        Request $request,
        int $warehouseId,
        int $productId,
        int $quantity,
        int $receiptId,
        ?string $batchNumber = null,
        ?string $expiredDate = null,
        bool $autoPutaway = true
    ): void
    {
        $stockBefore = (int) (ProductStock::where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->value('current_stock') ?? 0);

        if ($autoPutaway) {
            $rack = $this->findAvailableRack($warehouseId, $productId, $quantity);
        } else {
            $rack = null;
        }

        if ($rack) {
            // Auto put-away: place stock on available rack
            $rackStock = RackStock::query()->firstOrNew([
                'rack_id' => $rack->id,
                'product_id' => $productId,
            ]);

            $rackStock->quantity = (int) $rackStock->quantity + $quantity;
            $rackStock->reserved_quantity = (int) ($rackStock->reserved_quantity ?? 0);
            if ($batchNumber && !$rackStock->batch_number) {
                $rackStock->batch_number = $batchNumber;
            }
            if ($expiredDate && !$rackStock->expired_date) {
                $rackStock->expired_date = $expiredDate;
            }
            $rackStock->last_updated_at = now();
            $rackStock->save();

            $this->syncProductStock($warehouseId, $productId);

            $this->recordMovement(
                request: $request,
                productId: $productId,
                warehouseId: $warehouseId,
                type: 'in',
                referenceType: 'goods_receipt',
                referenceId: $receiptId,
                quantity: $quantity,
                stockBefore: $stockBefore,
                stockAfter: $stockBefore + $quantity,
                notes: 'Goods receipt putaway to '.$rack->code,
            );
        } else {
            // No rack available: store as floating stock (unplaced)
            $productStock = ProductStock::firstOrNew([
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
            ]);
            $productStock->current_stock = (int) ($productStock->current_stock ?? 0) + $quantity;
            $productStock->rack_stock = (int) ($productStock->rack_stock ?? 0);
            $productStock->reserved_stock = (int) ($productStock->reserved_stock ?? 0);
            $productStock->last_updated_at = now();
            $productStock->save();

            $this->recordMovement(
                request: $request,
                productId: $productId,
                warehouseId: $warehouseId,
                type: 'in',
                referenceType: 'goods_receipt',
                referenceId: $receiptId,
                quantity: $quantity,
                stockBefore: $stockBefore,
                stockAfter: $stockBefore + $quantity,
                notes: $autoPutaway
                    ? 'Goods receipt — floating stock (no rack available), needs put-away'
                    : 'Goods receipt — floating stock (manual put-away selected)',
            );
        }
    }

    private function findAvailableRack(int $warehouseId, int $productId, int $quantity): ?Rack
    {
        return Rack::query()
            ->where('status', 'active')
            ->whereHas('zone', fn ($query) => $query->where('warehouse_id', $warehouseId))
            ->with(['zone.warehouse', 'rackStocks'])
            ->orderBy('id')
            ->get()
            ->first(function (Rack $rack) use ($productId, $quantity) {
                $currentOtherQuantity = $rack->rackStocks
                    ->where('product_id', '!=', $productId)
                    ->sum('quantity');

                $currentProductQuantity = $rack->rackStocks
                    ->where('product_id', $productId)
                    ->sum('quantity');

                return ($currentOtherQuantity + $currentProductQuantity + $quantity) <= $rack->capacity;
            });
    }

    private function documentPayload(PurchaseOrder $purchaseOrder): array
    {
        $purchaseOrder->loadMissing([
            'supplier:id,name,code,contact_person,email,phone',
            'warehouse:id,name,location',
            'creator:id,name',
            'approver:id,name',
            'items.product:id,sku,name',
        ]);

        $totalQty = (int) $purchaseOrder->items->sum('quantity');
        $grandTotal = (float) $purchaseOrder->items->sum('subtotal');

        return [
            'title' => 'Purchase Order',
            'subtitle' => 'Dokumen pemesanan barang ke pemasok',
            'number' => $purchaseOrder->po_number,
            'status' => $this->statusLabel($purchaseOrder->status),
            'stats' => [
                ['label' => 'Tanggal PO', 'value' => optional($purchaseOrder->order_date)->format('d M Y') ?? '-'],
                ['label' => 'Total Item', 'value' => number_format($purchaseOrder->items->count(), 0, ',', '.')],
                ['label' => 'Total Qty', 'value' => number_format($totalQty, 0, ',', '.')],
                ['label' => 'Grand Total', 'value' => 'Rp '.number_format($grandTotal, 0, ',', '.')],
            ],
            'details' => [
                ['label' => 'Pemasok', 'value' => $purchaseOrder->supplier?->name],
                ['label' => 'Kode Pemasok', 'value' => $purchaseOrder->supplier?->code],
                ['label' => 'Email Pemasok', 'value' => $purchaseOrder->supplier?->email],
                ['label' => 'Gudang Tujuan', 'value' => $purchaseOrder->warehouse?->name],
                ['label' => 'Lokasi Gudang', 'value' => $purchaseOrder->warehouse?->location],
                ['label' => 'Dibuat Oleh', 'value' => $purchaseOrder->creator?->name],
                ['label' => 'Disetujui Oleh', 'value' => $purchaseOrder->approver?->name],
                ['label' => 'Catatan', 'value' => $purchaseOrder->notes],
            ],
            'columns' => [
                ['key' => 'product', 'label' => 'Produk'],
                ['key' => 'sku', 'label' => 'SKU'],
                ['key' => 'quantity', 'label' => 'Qty', 'align' => 'right'],
                ['key' => 'unit_price', 'label' => 'Harga Satuan', 'align' => 'right'],
                ['key' => 'subtotal', 'label' => 'Subtotal', 'align' => 'right'],
                ['key' => 'batch', 'label' => 'Batch'],
                ['key' => 'expired_date', 'label' => 'Expired'],
            ],
            'rows' => $purchaseOrder->items->map(fn (PurchaseOrderItem $item) => [
                'product' => $item->product?->name,
                'sku' => $item->product?->sku,
                'quantity' => number_format((float) $item->quantity, 0, ',', '.'),
                'unit_price' => 'Rp '.number_format((float) $item->unit_price, 0, ',', '.'),
                'subtotal' => 'Rp '.number_format((float) $item->subtotal, 0, ',', '.'),
                'batch' => $item->batch_number ?: '-',
                'expired_date' => optional($item->expired_date)->format('d M Y') ?? '-',
            ])->all(),
        ];
    }

    private function statusLabel(?string $status): string
    {
        return match (strtolower((string) $status)) {
            'pending' => 'Menunggu',
            'approved' => 'Disetujui',
            'received' => 'Diterima',
            'rejected' => 'Ditolak',
            'cancelled' => 'Dibatalkan',
            default => ucfirst((string) $status),
        };
    }
}
