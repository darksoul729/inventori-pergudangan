# UAT Checklist Role Access (WMS)

Gunakan 3 akun terpisah:
- Akun A: `Staff`
- Akun B: `Supervisor`
- Akun C: `Manager`

Status pengujian: `Pass/Fail` + catatan bug.

## A. Akses Menu Dasar

1. Staff bisa login dan lihat dashboard.
2. Supervisor bisa login dan lihat dashboard.
3. Manager bisa login dan lihat dashboard.
4. Staff tidak bisa membuka halaman Settings.
5. Supervisor tidak bisa membuka halaman Settings.
6. Manager bisa membuka halaman Settings.

## B. Master Data

1. Staff tidak bisa create/edit/delete Produk.
2. Supervisor tidak bisa create/edit/delete Produk.
3. Manager bisa create/edit/delete Produk.
4. Staff tidak bisa create/edit/delete Supplier.
5. Supervisor tidak bisa create/edit/delete Supplier.
6. Manager bisa create/edit/delete Supplier.

## C. Purchase Order (PO)

1. Staff bisa buat PO baru.
2. Supervisor bisa buat PO baru.
3. Manager bisa buat PO baru.
4. Staff tidak bisa approve/reject/cancel PO pending.
5. Supervisor bisa approve/reject/cancel PO pending.
6. Manager bisa approve/reject/cancel PO pending.
7. Staff bisa konfirmasi penerimaan PO yang sudah approved.
8. Supervisor bisa konfirmasi penerimaan PO yang sudah approved.
9. Manager bisa konfirmasi penerimaan PO yang sudah approved.

## D. Transfer Rak

1. Staff bisa create transfer rak.
2. Supervisor bisa create transfer rak.
3. Manager bisa create transfer rak.
4. Staff tidak bisa approve/reject transfer.
5. Supervisor bisa approve/reject transfer.
6. Manager bisa approve/reject transfer.
7. User tidak bisa approve transfer yang dibuat sendiri (cek self-approval guard).

## E. Stock Opname & Adjustment

1. Staff bisa create stock opname.
2. Supervisor bisa create stock opname.
3. Manager bisa create stock opname.
4. Staff tidak bisa approve/reject stock opname.
5. Supervisor bisa approve/reject stock opname.
6. Manager bisa approve/reject stock opname.
7. Staff tidak bisa approve/reject stock adjustment.
8. Supervisor bisa approve/reject stock adjustment.
9. Manager bisa approve/reject stock adjustment.
10. User tidak bisa approve opname/adjustment milik sendiri.

## F. Outbound & Transaksi

1. Staff bisa input outbound.
2. Supervisor bisa input outbound.
3. Manager bisa input outbound.
4. Staff tidak bisa verify transaksi yang butuh approval.
5. Supervisor bisa verify transaksi.
6. Manager bisa verify transaksi.

## G. Shipment

1. Staff hanya bisa lihat shipment (jika modul aktif), tidak bisa create/update/status.
2. Supervisor bisa create/update/status shipment.
3. Manager bisa create/update/status shipment.
4. Hanya manager yang bisa delete shipment.

## H. Report & Export

1. Staff tidak bisa export transaksi/laporan sensitif.
2. Supervisor bisa export transaksi/laporan sesuai modul.
3. Manager bisa export transaksi/laporan sesuai modul.

## I. Security & URL Guard

1. Staff akses URL aksi manager langsung => 403.
2. Supervisor akses URL manager-only langsung => 403.
3. Endpoint write harus tetap gagal jika hanya ubah tombol via devtools.
4. Pastikan semua reject/approve/create tercatat di audit log (user, waktu, objek, status).

## J. Data Integrity

1. Setelah approve transfer/opname, stok berubah sesuai dokumen.
2. Setelah reject transfer/opname, stok tidak berubah.
3. Tidak ada negative stock setelah rangkaian transaksi.
4. Nilai summary dashboard konsisten dengan data transaksi.

## Kriteria Lulus

- Semua skenario critical (C, D, E, I) wajib `Pass`.
- Tidak ada privilege escalation (staff/supervisor mendapatkan hak di luar matrix).
- Tidak ada mismatch UI vs backend (tombol muncul tapi endpoint 403, atau sebaliknya).

