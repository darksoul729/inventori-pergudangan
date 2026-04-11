# Transaction Flow

Dokumen ini menjelaskan alur kerja, integrasi data, dan fungsionalitas utama dari modul `Transaction Ledger` yang berfungsi sebagai pusat audit pergerakan stok secara real-time.

## Scope Modul Transaction

Modul ini bertanggung jawab untuk:

- Menampilkan log pergerakan stok secara immutable (tidak dapat diubah).
- Melacak histori audit lintas gudang dan operator.
- Menghitung metrik real-time (Inbound/Outbound dalam 24 jam terakhir).
- Memonitor status audit melalui "AI Pulse" (deteksi anomali/pending audits).
- Menyediakan fitur export data ke format Excel (.xlsx) dengan styling premium.

## Sumber Data & Sinkronisasi

Modul Transaction adalah konsumen utama dari tabel `stock_movements`.

### 1. Konsumsi Log
Setiap kali ada aktivitas di modul **Warehouse** (pemindahan rak) atau **Inventory** (penyesuaian stok/outbound), data akan dicatat ke `stock_movements`. 

Tipe pergerakan yang didukung:
- `in`: Penerimaan barang ke gudang.
- `out`: Pengeluaran barang.
- `transfer`: Perpindahan antar lokasi/rak/gudang.
- `adjustment`: Penyesuaian stok karena selisih.
- `opname`: Hasil verifikasi stok fisik.

### 2. Metrik Real-Time
Metrik dihitung langsung lewat `TransactionController`:
- **Inbound/Outbound Growth**: Perbandingan volume transaksi antara 24 jam terakhir vs 24 jam sebelumnya.
- **Pending Audits**: Menghitung transaksi bertipe `adjustment` atau `opname` dalam 48 jam terakhir yang memerlukan perhatian supervisor.

## Fungsionalitas UI (Transaction.jsx)

### 1. Filtering Seamless (No-Refresh)
Menggunakan fitur **Partial Reload** dari Inertia.js. Saat filter pencarian atau tipe diubah:
- Hanya prop `movements`, `stats`, dan `filters` yang dikirim ulang dari server.
- State UI tetap terjaga tanpa reload halaman penuh.
- `preserveState: true` dan `preserveScroll: true` memastikan pengalaman pengguna yang mulus.

### 2. Export Premium (.xlsx)
Alur export dirancang untuk menghasilkan file spreadsheet yang siap pakai:
1. **Request**: Frontend mengirim request ke backend dengan filter aktif + parameter `format=json`.
2. **Backend**: Controller mengembalikan dataset lengkap (tanpa paginasi) dalam format JSON.
3. **Frontend**: Library `ExcelJS` memproses JSON tersebut di browser untuk:
   - Membuat header berwarna biru tua dengan teks putih.
   - Menambahkan border pada setiap sel.
   - Mengatur format angka (Quantity) rata kanan.
   - Menambahkan judul laporan dan catatan kaki otomatis.

## Integrasi AI Audit Pulse

AI Pulse di sisi kanan halaman memberikan snapshot kondisi gudang:
- **Alert Status**: Muncul jika ada transaksi volume tinggi (>1000 unit) atau pending audits yang menumpuk.
- **Node Connectivity**: Status visual koneksi node IoT yang melakukan transmisi data transaksi.

## Checklist Implementasi Transaction

Modul Transaction dianggap lengkap jika:
- [x] Histori transaksi terbaca dari `stock_movements`.
- [x] Filter pencarian dan tipe berfungsi secara asinkron (no reload).
- [x] Metrik Inbound/Outbound memunculkan tren persentase yang akurat.
- [x] Export ke Excel menghasilkan file `.xlsx` dengan styling premium sesuai template.
- [x] Status badge berwarna sesuai dengan tipe transaksi (`in`=hijau, `out`=biru, `audit`=kuning).

## Catatan Teknis
Pergerakan stok bersifat **Immutable**. Jika terjadi kesalahan input di modul lain, modul tersebut harus menciptakan record "Adjustment" atau "Return" baru daripada mengedit record yang sudah ada di ledger transaksi.
