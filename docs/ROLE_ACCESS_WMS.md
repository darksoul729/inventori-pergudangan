# Role Access Matrix (WMS Operasional)

Dokumen ini jadi standar hak akses operasional untuk `Manager`, `Supervisor`, dan `Staff`.

## Aturan Umum

- `Manager`: akses penuh operasional + master data + approval final.
- `Supervisor`: akses operasional harian + approval transaksi.
- `Staff`: input transaksi operasional harian (tanpa approval).

## Matriks Akses

| Modul | Staff | Supervisor | Manager |
|---|---|---|---|
| Dashboard, lihat data | Ya | Ya | Ya |
| Produk (master) create/update/delete | Tidak | Tidak | Ya |
| Supplier master create/update/delete | Tidak | Tidak | Ya |
| Penilaian performa supplier | Tidak | Ya | Ya |
| Purchase Order - create | Ya | Ya | Ya |
| Purchase Order - approve/reject/cancel | Tidak | Ya | Ya |
| Purchase Order - receive barang | Ya | Ya | Ya |
| Stock Out / outbound | Ya | Ya | Ya |
| Transfer rak - create | Ya | Ya | Ya |
| Transfer rak - approve/reject | Tidak | Ya | Ya |
| Stock opname - create | Ya | Ya | Ya |
| Stock opname - approve/reject | Tidak | Ya | Ya |
| Stock adjustment - approve/reject | Tidak | Ya | Ya |
| Shipment - create/update/status | Tidak | Ya | Ya |
| Shipment - delete | Tidak | Tidak | Ya |
| Export transaksi/laporan operasional | Tidak | Ya | Ya |
| Settings (kategori/unit/staff/billing) | Tidak | Tidak | Ya |

## Implementasi Kode (ringkas)

- Gate utama: `app/Providers/AppServiceProvider.php`
- Route role middleware: `routes/web.php`
- UI conditional action:
  - `resources/js/Pages/PurchaseOrders/Index.jsx`
  - `resources/js/Pages/Dashboard.jsx`
  - `resources/js/Pages/Inventory.jsx`
  - `resources/js/Pages/Supplier.jsx`

