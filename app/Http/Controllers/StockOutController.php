<?php

namespace App\Http\Controllers;

use App\Models\StockOut;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Inertia\Response;

class StockOutController extends Controller
{
    public function show(StockOut $stockOut): Response
    {
        $stockOut->load([
            'warehouse:id,name,location',
            'customer:id,code,name,contact_person,email,phone,address',
            'items.product:id,sku,name',
            'creator:id,name,email',
        ]);

        return Inertia::render('StockOutDetail', [
            'stockOut' => [
                'id' => $stockOut->id,
                'number' => $stockOut->stock_out_number,
                'date' => $stockOut->out_date?->format('Y-m-d'),
                'date_label' => $stockOut->out_date?->format('d M Y'),
                'purpose' => $stockOut->purpose,
                'status' => $stockOut->status,
                'notes' => $stockOut->notes,
                'warehouse' => $stockOut->warehouse,
                'customer' => $stockOut->customer,
                'operator' => $stockOut->creator,
                'items' => $stockOut->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'sku' => $item->product?->sku,
                    'name' => $item->product?->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ]),
                'total_quantity' => $stockOut->items->sum('quantity'),
                'total_amount' => $stockOut->items->sum('subtotal'),
            ],
        ]);
    }

    public function downloadPdf(StockOut $stockOut)
    {
        $document = $this->documentPayload($stockOut);

        $pdf = Pdf::loadView('wms_documents.document_pdf', [
            'document' => $document,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('Stock_Out_'.$stockOut->stock_out_number.'.pdf');
    }

    private function documentPayload(StockOut $stockOut): array
    {
        $stockOut->loadMissing([
            'warehouse:id,name,location',
            'customer:id,code,name,contact_person,email,phone,address',
            'items.product:id,sku,name',
            'creator:id,name,email',
        ]);

        return [
            'title' => 'Stock Out',
            'subtitle' => 'Dokumen pengeluaran barang dari gudang',
            'number' => $stockOut->stock_out_number,
            'status' => ucfirst($stockOut->status ?? 'completed'),
            'stats' => [
                ['label' => 'Tanggal Keluar', 'value' => $stockOut->out_date?->format('d M Y') ?? '-'],
                ['label' => 'Total Qty', 'value' => number_format((float) $stockOut->items->sum('quantity'), 0, ',', '.')],
                ['label' => 'Total Nilai', 'value' => 'Rp '.number_format((float) $stockOut->items->sum('subtotal'), 0, ',', '.')],
                ['label' => 'Operator', 'value' => $stockOut->creator?->name ?? 'Sistem'],
            ],
            'details' => [
                ['label' => 'Customer', 'value' => $stockOut->customer?->name],
                ['label' => 'Kode Customer', 'value' => $stockOut->customer?->code],
                ['label' => 'Warehouse', 'value' => $stockOut->warehouse?->name],
                ['label' => 'Lokasi', 'value' => $stockOut->warehouse?->location],
                ['label' => 'Purpose', 'value' => $stockOut->purpose],
                ['label' => 'Catatan', 'value' => $stockOut->notes],
            ],
            'columns' => [
                ['key' => 'product', 'label' => 'Produk'],
                ['key' => 'sku', 'label' => 'SKU'],
                ['key' => 'quantity', 'label' => 'Qty', 'align' => 'right'],
                ['key' => 'unit_price', 'label' => 'Harga', 'align' => 'right'],
                ['key' => 'subtotal', 'label' => 'Subtotal', 'align' => 'right'],
            ],
            'rows' => $stockOut->items->map(fn ($item) => [
                'product' => $item->product?->name,
                'sku' => $item->product?->sku,
                'quantity' => number_format((float) $item->quantity, 0, ',', '.'),
                'unit_price' => 'Rp '.number_format((float) $item->unit_price, 0, ',', '.'),
                'subtotal' => 'Rp '.number_format((float) $item->subtotal, 0, ',', '.'),
            ])->all(),
        ];
    }
}
