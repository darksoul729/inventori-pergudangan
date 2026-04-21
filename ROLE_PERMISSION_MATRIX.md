# Role Permission Matrix

Sistem ini memakai model login tertutup. Tidak ada registrasi publik untuk web atau driver API. Akun operasional dibuat oleh manager dari panel aplikasi.

## Role

| Role | Tujuan | Cara Dibuat |
| --- | --- | --- |
| Manager | Akses penuh untuk master data, konfigurasi, user, driver, laporan, dan operasi sensitif. | Seeder awal atau manager/admin yang sudah ada. |
| Supervisor | Koordinasi shift, validasi transaksi, laporan, export, rack stock, PO, shipment, dan approval harian. | Manager membuat akun dari `Settings -> Akun Operasional`. |
| Staff | Operasional harian gudang: melihat data dan input pergerakan stok outbound. | Manager membuat akun dari `Settings -> Akun Operasional`. |
| Driver | Akses aplikasi/mobile driver untuk shipment yang ditugaskan. | Manager membuat akun dari `Manajemen Driver -> Buat Driver`. |

## Autentikasi

| Jalur | Status |
| --- | --- |
| Web login | Aktif untuk akun `status = active`. |
| Web register `/register` | Dinonaktifkan. |
| Driver API login `/api/driver/login` | Aktif untuk user driver dengan record driver `approved`. |
| Driver API register `/api/driver/register` | Dinonaktifkan. |

## Permission Matrix

| Modul/Fitur | Manager | Supervisor | Staff | Driver |
| --- | --- | --- | --- | --- |
| Dashboard | Ya | Ya | Ya | Tidak |
| Warehouse view | Ya | Ya | Ya | Tidak |
| Warehouse zone create/update/delete | Ya | Tidak | Tidak | Tidak |
| Rack create/update/delete | Ya | Tidak | Tidak | Tidak |
| Rack stock create/update/delete | Ya | Ya | Tidak | Tidak |
| Inventory list/detail | Ya | Ya | Ya | Tidak |
| Inventory create/edit product | Ya | Tidak | Tidak | Tidak |
| Inventory outbound stock | Ya | Ya | Ya | Tidak |
| Transaction list/detail/PDF | Ya | Ya | Ya | Tidak |
| Transaction export | Ya | Ya | Tidak | Tidak |
| Supplier list/detail | Ya | Ya | Ya | Tidak |
| Supplier create | Ya | Tidak | Tidak | Tidak |
| Supplier performance update | Ya | Ya | Tidak | Tidak |
| Purchase order list/detail | Ya | Ya | Ya | Tidak |
| Purchase order create | Ya | Ya | Tidak | Tidak |
| Purchase order status approval/update | Ya | Ya | Tidak | Tidak |
| Shipment list/detail/POD PDF | Ya | Ya | Ya | Tidak |
| Shipment create/update | Ya | Ya | Tidak | Tidak |
| Shipment delete | Ya | Tidak | Tidak | Tidak |
| Shipment status update from web | Ya | Ya | Tidak | Tidak |
| POD verification | Ya | Ya | Tidak | Tidak |
| Reports | Ya | Ya | Tidak | Tidak |
| Rack allocation | Ya | Ya | Tidak | Tidak |
| Driver management | Ya | Tidak | Tidak | Tidak |
| Settings | Ya | Tidak | Tidak | Tidak |
| Operational account create/activate/deactivate | Ya | Tidak | Tidak | Tidak |
| Driver assigned shipments API | Tidak | Tidak | Tidak | Ya |
| Driver claim shipment API | Tidak | Tidak | Tidak | Ya |
| Driver update tracking/location API | Tidak | Tidak | Tidak | Ya |

## Security Notes

- Frontend hiding is only a convenience. Backend route middleware is the source of truth.
- Manager-only web routes must use `auth`, `verified`, and `role:manager`.
- Supervisor operational approval routes must use `auth`, `verified`, and `role:manager,supervisor`.
- Staff routes that mutate stock are intentionally limited to outbound stock only.
- Disabled accounts cannot log in because login requires `status = active`.
- Driver accounts can only use driver APIs if the related driver record is `approved`.
- Any new feature should be added to this matrix before implementation.
