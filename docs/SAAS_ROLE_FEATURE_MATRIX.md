# SaaS Role vs Feature Matrix

## Role
- `manager`
- `supervisor`
- `staff`
- `driver`

## Matrix Inti

| Fitur | Manager | Supervisor | Staff | Driver |
|---|---:|---:|---:|---:|
| Lihat dasbor | ✅ | ✅ | ✅ | ❌ |
| Kelola master produk | ✅ | ❌ | ❌ | ❌ |
| Barang masuk/keluar | ✅ | ✅ | ✅ | ❌ |
| Pindah rak | ✅ | ✅ | ❌ | ❌ |
| Cek stok fisik | ✅ | ✅ | ❌ | ❌ |
| Approve dokumen kritikal | ✅ | ✅ (sesuai policy) | ❌ | ❌ |
| Pengiriman create/update | ✅ | ✅ | ❌ (read-only) | ❌ |
| Update status driver app | ❌ | ❌ | ❌ | ✅ |
| Verifikasi POD | ✅ | ✅ | ❌ | ❌ |
| Tagihan (create/update status) | ✅ | ✅ | ❌ | ❌ |
| Laporan operasional | ✅ | ✅ | ❌ | ❌ |
| Pengaturan tenant/billing | ✅ | ❌ | ❌ | ❌ |

## Akses Modul
- Jika modul tenant nonaktif: semua role otomatis tidak bisa akses route/menu modul tsb.
- Jika modul aktif: tetap ikut matrix role di atas.

## Guarding Rule Teknis
- Middleware urut: `auth` -> `tenant` -> `module` -> `role`.
- Semua action mutasi wajib audit log (`actor`, `tenant`, `resource`, `before`, `after`, `timestamp`).
