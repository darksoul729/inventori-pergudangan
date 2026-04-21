# WMS Alignment: ERPNext + Odoo

Dokumen ini menjadi acuan evolusi alur WMS project agar mengikuti pola sistem populer tanpa menyalin kompleksitas ERPNext/Odoo secara penuh.

## Prinsip Arsitektur

- `rack_stocks` adalah sumber kebenaran stok fisik dan lokasi barang.
- `product_stocks` adalah ringkasan stok per warehouse hasil sinkronisasi dari rack.
- `stock_movements` adalah ledger audit immutable untuk semua perubahan stok.
- Dokumen bisnis seperti PO, goods receipt, stock out, transfer, opname, dan adjustment menjadi sumber referensi ledger.
- Kesalahan transaksi tidak diedit langsung di ledger, tetapi dikoreksi dengan adjustment atau dokumen pembalik.

## Alur Target

### 1. Inbound

Referensi ERPNext:
`Purchase Order -> Purchase Receipt -> Stock Ledger`

Referensi Odoo:
`Purchase Order -> Receipt -> Putaway -> Inventory Valuation/Move History`

Target project:

1. User membuat `purchase_orders`.
2. Supervisor/manager menyetujui PO.
3. Saat PO diterima, sistem membuat `goods_receipts` dan `goods_receipt_items`.
4. Barang ditempatkan ke rack aktif di warehouse tujuan.
5. Sistem melakukan sync ke `product_stocks`.
6. Sistem mencatat `stock_movements` dengan `reference_type = goods_receipt`.

### 2. Outbound

Referensi ERPNext:
`Sales Order -> Delivery Note -> Stock Ledger`

Referensi Odoo:
`Delivery Order -> Reservation -> Picking -> Shipping`

Target project:

1. User membuat dokumen `stock_outs`.
2. Sistem membuat `stock_out_items`.
3. Sistem memilih rack berdasarkan strategi picking sederhana.
4. Qty dikurangi dari `rack_stocks`.
5. Sistem melakukan sync ke `product_stocks`.
6. Sistem mencatat `stock_movements` dengan `reference_type = stock_out`.
7. Jika dikirim keluar gudang, `stock_outs` dapat dihubungkan ke `shipments`.

### 3. Internal Transfer

Referensi Odoo:
`Internal Transfer -> Source Location -> Destination Location`

Target project:

1. User membuat `stock_transfers`.
2. Sistem mengurangi stok dari rack asal.
3. Sistem menambah stok ke rack tujuan.
4. Sistem sync warehouse asal dan tujuan.
5. Sistem mencatat movement `transfer`.

### 4. Stock Opname dan Adjustment

Referensi ERPNext/Odoo:
`Inventory Count -> Difference -> Stock Adjustment`

Target project:

1. User membuat `stock_opnames`.
2. Sistem menyimpan `system_stock`, `physical_stock`, dan `difference`.
3. Difference disetujui supervisor/manager.
4. Sistem membuat adjustment resmi.
5. Sistem sync stok dan mencatat movement `opname` atau `adjustment`.

## Prioritas Implementasi

1. Goods receipt harus benar-benar menambah stok ke rack, product stock, dan ledger.
2. Outbound harus memakai dokumen formal `stock_outs` dan `stock_out_items`.
3. Stock transfer antar rack/warehouse.
4. Stock opname dan adjustment formal.
5. Integrasi shipment dengan stock out/delivery order.
6. Barcode, reservation, FIFO/FEFO, putaway rule, dan picking wave.

## Konvensi Ledger

Gunakan `movement_type`:

- `in`
- `out`
- `transfer`
- `adjustment`
- `opname`

Gunakan `reference_type`:

- `goods_receipt`
- `stock_out`
- `stock_transfer`
- `stock_opname`
- `stock_adjustment`
- `rack`

`reference_id` harus berisi ID dokumen sumber, bukan ID produk.
