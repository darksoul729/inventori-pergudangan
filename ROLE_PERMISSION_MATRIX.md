# Role Permission Matrix

Sistem ini memakai model login tertutup. Tidak ada registrasi publik untuk web atau driver API. Akun operasional dibuat oleh manager dari panel aplikasi.

## Role

| Role | Tujuan | Cara Dibuat |
| --- | --- | --- |
| Manager | Akses penuh untuk konfigurasi, approval, laporan, akun staff, akun driver, dan operasi sensitif. | Seeder awal atau manager/admin yang sudah ada. |
| Staff | Operasional harian gudang dengan akses terbatas. | Manager membuat akun dari `Settings -> Akun Staff`. |
| Driver | Akses aplikasi/mobile driver untuk shipment yang ditugaskan. | Manager membuat akun dari `Manajemen Driver -> Buat Driver`. |

## Autentikasi

| Jalur | Status |
| --- | --- |
| Web login | Aktif untuk akun `status = active`. |
| Web register `/register` | Dinonaktifkan. |
| Driver API login `/api/driver/login` | Aktif untuk user driver dengan record driver `approved`. |
| Driver API register `/api/driver/register` | Dinonaktifkan. |

## Permission Matrix

| Modul/Fitur | Manager | Staff | Driver |
| --- | --- | --- | --- |
| Dashboard | Ya | Ya | Tidak |
| Warehouse view | Ya | Ya | Tidak |
| Warehouse zone create/update/delete | Ya | Tidak | Tidak |
| Rack create/update/delete | Ya | Tidak | Tidak |
| Rack stock create/update/delete | Ya | Tidak | Tidak |
| Inventory list/detail | Ya | Ya | Tidak |
| Inventory create product | Ya | Tidak | Tidak |
| Inventory outbound stock | Ya | Ya | Tidak |
| Transaction list/detail | Ya | Ya | Tidak |
| Transaction export | Ya | Tidak | Tidak |
| Supplier list/detail | Ya | Ya | Tidak |
| Supplier create | Ya | Tidak | Tidak |
| Supplier performance update | Ya | Tidak | Tidak |
| Purchase order list/detail | Ya | Ya | Tidak |
| Purchase order create | Ya | Tidak | Tidak |
| Purchase order status approval/update | Ya | Tidak | Tidak |
| Shipment list/detail/POD PDF | Ya | Ya | Tidak |
| Shipment create/update/delete | Ya | Tidak | Tidak |
| Shipment status update from web | Ya | Tidak | Tidak |
| POD verification | Ya | Tidak | Tidak |
| Reports | Ya | Tidak | Tidak |
| Driver management | Ya | Tidak | Tidak |
| Settings | Ya | Tidak | Tidak |
| Staff account create/activate/deactivate | Ya | Tidak | Tidak |
| Driver assigned shipments API | Tidak | Tidak | Ya |
| Driver claim shipment API | Tidak | Tidak | Ya |
| Driver update tracking/location API | Tidak | Tidak | Ya |

## Security Notes

- Frontend hiding is only a convenience. Backend route middleware is the source of truth.
- Manager-only web routes must use `auth`, `verified`, and `role:manager`.
- Staff routes that mutate stock are intentionally limited to outbound stock only.
- Disabled accounts cannot log in because login requires `status = active`.
- Driver accounts can only use driver APIs if the related driver record is `approved`.
- Any new feature should be added to this matrix before implementation.
