# Driver Management Flow

Dokumen ini menjelaskan alur modul `Manajemen Driver` — dari registrasi akun driver di Kotlin App, proses verifikasi admin di web dashboard, hingga siklus hidup driver dalam sistem pengiriman.

---

## Scope Modul Driver

Modul Driver bertanggung jawab untuk:

- Registrasi akun driver baru melalui Kotlin App.
- Verifikasi dan persetujuan akun oleh admin di web dashboard.
- Pengelolaan status driver (`pending`, `approved`, `suspended`).
- Tracking posisi GPS driver secara real-time.
- Deteksi penggunaan Fake GPS oleh driver.
- Menampilkan live tracking di peta admin.

---

## Struktur Data & Relasi

| Tabel / Model | Relasi | Keterangan |
|---|---|---|
| `drivers` | Tabel utama | Data profil dan posisi driver |
| `users` | `belongsTo` | Akun autentikasi (email, password) |
| `shipments` | `hasMany` | Daftar pengiriman yang pernah ditugaskan |

### Field Penting Model `Driver`

| Field | Tipe | Keterangan |
|---|---|---|
| `user_id` | FK | Relasi ke tabel `users` |
| `license_number` | string | Nomor SIM driver |
| `phone` | string | Nomor telepon driver |
| `photo_id_card` | string | Path foto KTP/ID Card di storage |
| `status` | enum | `pending`, `approved`, `suspended` |
| `latitude` | decimal | Posisi GPS terakhir driver |
| `longitude` | decimal | Posisi GPS terakhir driver |
| `is_active` | boolean | `true` jika driver sedang aktif mengirim |
| `last_location_mock` | boolean | `true` jika GPS terakhir terdeteksi palsu |

---

## Status Driver Life-Cycle

```
[Kotlin App: Registrasi]
        ↓
   status = pending
        ↓
[Admin: Review di Web Dashboard]
        ↓
   status = approved  ──→  Driver bisa login & terima shipment
        ↓  (jika melanggar)
   status = suspended ──→  Driver tidak bisa login
```

| Status | Keterangan | Bisa Login? | Bisa Terima Shipment? |
|---|---|---|---|
| `pending` | Baru mendaftar, menunggu review admin | ❌ | ❌ |
| `approved` | Terverifikasi oleh admin | ✅ | ✅ |
| `suspended` | Ditangguhkan oleh admin | ❌ | ❌ |

---

## Workflow Utama

### 1. Driver Registrasi (Kotlin App)

**Endpoint:** `POST /api/driver/register` *(tanpa auth)*

**Request Body (multipart/form-data):**
```
name             : "Budi Santoso"
email            : "budi@email.com"
password         : "password123"
license_number   : "1234567890"
phone            : "08123456789"
photo_id_card    : <file: KTP/ID Card image>
```

**Respons Sukses (201):**
```json
{
  "message": "Driver registered successfully. Please wait for admin approval.",
  "driver": { ... }
}
```

**Status setelah registrasi:** `pending`

> **Desain Kotlin App:** Screen registrasi perlu field upload foto KTP. Setelah berhasil, tampilkan layar "Menunggu Persetujuan Admin" dan blokir login sampai status berubah ke `approved`.

---

### 2. Admin Mereview Driver (Web Dashboard)

Di halaman `Drivers > Daftar Driver`, admin melihat tabel semua driver dengan kolom:
- Nama & Email
- Nomor Telepon
- Nomor SIM
- Status Badge (`TERVERIFIKASI`, `MENUNGGU`, `DITANGGUHKAN`)
- Tombol Aksi: Lihat Detail, Setujui, Tangguhkan

**Aksi yang tersedia:**

| Aksi | Endpoint | Kondisi |
|---|---|---|
| Setujui Driver | `PUT /drivers/{id}/status` `{status: "approved"}` | Jika status bukan `approved` |
| Tangguhkan Driver | `PUT /drivers/{id}/status` `{status: "suspended"}` | Jika status bukan `suspended` |

**Modal Detail Driver** menampilkan:
- Nama lengkap & email
- Nomor SIM
- Status saat ini
- Foto KTP/ID Card yang diupload driver

---

### 3. Driver Login (Kotlin App)

**Endpoint:** `POST /api/driver/login` *(tanpa auth)*

**Request Body:**
```json
{
  "email": "budi@email.com",
  "password": "password123"
}
```

**Respons Sukses (200):**
```json
{
  "token": "1|abcdefghijklmnop...",
  "user": { "id": 5, "name": "Budi Santoso", "email": "budi@email.com" },
  "driver": { "id": 3, "status": "approved", "license_number": "..." }
}
```

**Error Cases:**
| HTTP Code | Kondisi |
|---|---|
| `401` | Email/password salah |
| `403` | Status driver `pending` atau `suspended` |

> **Desain Kotlin App:** Simpan token ke encrypted SharedPreferences / DataStore. Token ini digunakan sebagai `Authorization: Bearer {token}` di semua request selanjutnya.

---

### 4. Driver Mengirim Update Lokasi GPS (Kotlin App)

**Endpoint:** `POST /api/driver/location` *(auth: Bearer Token)*

**Request Body:**
```json
{
  "latitude": -6.9175,
  "longitude": 107.6191,
  "is_mock": false
}
```

**Implementasi di Kotlin:**
- Panggil endpoint ini di dalam `ForegroundService` yang berjalan selama ada pengiriman aktif.
- Interval yang disarankan: **setiap 15–30 detik**.
- Field `is_mock` harus diisi `true` jika device mendeteksi mock location (dari `LocationManager.isProviderMocked()`).
- Koordinat disimpan ke field `latitude` & `longitude` di tabel `drivers`.

**Deteksi Fake GPS oleh Backend:**
- Jika `is_mock = true`, server set `last_location_mock = true` di model `Driver`.
- Dashboard admin menampilkan badge merah **"Fake GPS Terdeteksi"** pada kartu driver di tab Live Tracking.

---

### 5. Live Tracking di Dashboard Admin (Web)

Di halaman `Drivers > Live Tracking`, admin melihat:
- **Sidebar kiri:** Daftar driver yang memiliki koordinat GPS aktif, beserta status koneksi dan waktu update terakhir.
- **Peta kanan:** Marker posisi driver secara real-time (via `LiveMap` component, Leaflet.js).
- Klik kartu driver di sidebar → peta auto-zoom ke posisi driver tersebut.

**Data yang ditampilkan per driver di sidebar:**

| Elemen UI | Sumber Data |
|---|---|
| Avatar (initial nama) | `driver.user.name` |
| Nama driver | `driver.user.name` |
| Badge "Terhubung" / "Offline" | `driver.latitude && driver.longitude` |
| Badge "Fake GPS Terdeteksi" | `driver.last_location_mock === true` |
| Waktu update terakhir | `driver.updated_at` |

---

## Screen Recommendation untuk Kotlin App

Berdasarkan flow di atas, layar-layar yang diperlukan:

| Screen | Deskripsi |
|---|---|
| **RegisterScreen** | Form registrasi: nama, email, password, SIM, telepon, foto KTP |
| **PendingApprovalScreen** | Info statis "Akun sedang diverifikasi admin" |
| **LoginScreen** | Form email & password |
| **HomeScreen / ShipmentListScreen** | Daftar shipment yang ditugaskan ke driver |
| **ShipmentDetailScreen** | Detail rute, tracking stage, tombol update status |
| **UpdateStatusBottomSheet** | Tombol per-stage, form catatan, upload foto POD |
| **DeliveryConfirmScreen** | Form khusus untuk stage `delivered`: nama penerima, foto, catatan |
| **TrackingService (Background)** | ForegroundService untuk kirim GPS secara periodik |

---

## Checklist Kesiapan Modul Driver

- [x] API registrasi driver dengan upload foto KTP.
- [x] API login dengan validasi status `approved`.
- [x] API update lokasi GPS dengan deteksi mock.
- [x] Admin bisa approve/suspend driver dari dashboard.
- [x] Admin melihat foto KTP driver di modal detail.
- [x] Live tracking peta di tab `LIVE TRACKING` halaman Drivers.
- [x] Badge Fake GPS terdeteksi di sidebar tracking.
- [x] Auto-refresh data list driver (20 detik) di tab Daftar.
- [ ] Notifikasi push ke driver saat ada shipment baru (roadmap).
- [ ] History log aksi verifikasi admin (roadmap).

---

## Reference Conventions

- **Status Driver:** `pending` | `approved` | `suspended`
- **Auth:** Laravel Sanctum Bearer Token
- **GPS Storage:** Field `latitude` & `longitude` di tabel `drivers` (bukan per-shipment, selalu latest position)
- **Mock Detection:** Field `last_location_mock` (boolean) di tabel `drivers`
- **Photo Storage:** `storage/app/public/` (diakses via `/storage/*`)
