<?php

namespace App\Http\Controllers;

use App\Models\GoodsReceipt;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Inertia\Response;

class GoodsReceiptController extends Controller
{
    public function show(GoodsReceipt $goodsReceipt): Response
    {
        $goodsReceipt->load([
            'purchaseOrder:id,po_number,order_date,expected_date,status',
            'supplier:id,name,code,contact_person,email',
            'warehouse:id,name,location',
            'items.product:id,sku,name',
            'creator:id,name,email',
        ]);

        return Inertia::render('GoodsReceiptDetail', [
            'receipt' => [
                'id' => $goodsReceipt->id,
                'number' => $goodsReceipt->receipt_number,
                'date' => $goodsReceipt->receipt_date,
                'date_label' => $goodsReceipt->receipt_date ? \Carbon\Carbon::parse($goodsReceipt->receipt_date)->format('d M Y') : null,
                'status' => $goodsReceipt->status,
                'notes' => $goodsReceipt->notes,
                'purchase_order' => $goodsReceipt->purchaseOrder,
                'supplier' => $goodsReceipt->supplier,
                'warehouse' => $goodsReceipt->warehouse,
                'operator' => $goodsReceipt->creator,
                'items' => $goodsReceipt->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'sku' => $item->product?->sku,
                    'name' => $item->product?->name,
                    'quantity_received' => $item->quantity_received,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                    'batch_number' => $item->batch_number,
                    'expired_date' => $item->expired_date,
                ]),
                'total_quantity' => $goodsReceipt->items->sum('quantity_received'),
                'total_amount' => $goodsReceipt->items->sum('subtotal'),
            ],
        ]);
    }

    public function downloadPdf(GoodsReceipt $goodsReceipt)
    {
        $document = $this->documentPayload($goodsReceipt);

        $pdf = Pdf::loadView('wms_documents.document_pdf', [
            'document' => $document,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('Goods_Receipt_'.$goodsReceipt->receipt_number.'.pdf');
    }

    private function documentPayload(GoodsReceipt $goodsReceipt): array
    {
        $goodsReceipt->loadMissing([
            'purchaseOrder:id,po_number,order_date,expected_date,status',
            'supplier:id,name,code,contact_person,email',
            'warehouse:id,name,location',
            'items.product:id,sku,name',
            'creator:id,name,email',
        ]);

        return [
            'title' => 'Goods Receipt',
            'subtitle' => 'Dokumen penerimaan barang dari purchase order',
            'number' => $goodsReceipt->receipt_number,
            'status' => ucfirst($goodsReceipt->status ?? 'completed'),
            'stats' => [
                ['label' => 'Tanggal Terima', 'value' => $goodsReceipt->receipt_date?->format('d M Y') ?? '-'],
                ['label' => 'Total Qty', 'value' => number_format((float) $goodsReceipt->items->sum('quantity_received'), 0, ',', '.')],
                ['label' => 'Total Nilai', 'value' => 'Rp '.number_format((float) $goodsReceipt->items->sum('subtotal'), 0, ',', '.')],
                ['label' => 'Operator', 'value' => $goodsReceipt->creator?->name ?? 'Sistem'],
            ],
            'details' => [
                ['label' => 'Purchase Order', 'value' => $goodsReceipt->purchaseOrder?->po_number],
                ['label' => 'Supplier', 'value' => $goodsReceipt->supplier?->name],
                ['label' => 'Kode Supplier', 'value' => $goodsReceipt->supplier?->code],
                ['label' => 'Warehouse', 'value' => $goodsReceipt->warehouse?->name],
                ['label' => 'Lokasi', 'value' => $goodsReceipt->warehouse?->location],
                ['label' => 'Catatan', 'value' => $goodsReceipt->notes],
            ],
            'columns' => [
                ['key' => 'product', 'label' => 'Produk'],
                ['key' => 'sku', 'label' => 'SKU'],
                ['key' => 'quantity', 'label' => 'Qty', 'align' => 'right'],
                ['key' => 'unit_price', 'label' => 'Harga', 'align' => 'right'],
                ['key' => 'subtotal', 'label' => 'Subtotal', 'align' => 'right'],
                ['key' => 'batch', 'label' => 'Batch'],
            ],
            'rows' => $goodsReceipt->items->map(fn ($item) => [
                'product' => $item->product?->name,
                'sku' => $item->product?->sku,
                'quantity' => number_format((float) $item->quantity_received, 0, ',', '.'),
                'unit_price' => 'Rp '.number_format((float) $item->unit_price, 0, ',', '.'),
                'subtotal' => 'Rp '.number_format((float) $item->subtotal, 0, ',', '.'),
                'batch' => $item->batch_number ?: '-',
            ])->all(),
        ];
    }
}
