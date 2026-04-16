# Shipment Flow (Pengiriman)

Dokumen ini menjelaskan keseluruhan alur modul `Pengiriman` — dari pembuatan shipment oleh admin di dashboard web, hingga penyelesaian pengiriman oleh driver melalui Kotlin Android App.

---

## Scope Modul Pengiriman

Modul Pengiriman bertanggung jawab untuk:

- Membuat dan mengelola data pengiriman (`shipments`) dari sisi admin.
- Menugaskan driver ke pengiriman yang dibuat.
- Memantau posisi GPS driver secara real-time.
- Melacak tahap konfirmasi pengiriman (`tracking_stage`) dari driver.
- Mendeteksi anomali: keterlambatan ETA & deviasi jalur.
- Menghasilkan Proof of Delivery (POD) berupa PDF berisi foto, tanda tangan, dan catatan.

---

## Struktur Data & Relasi

Modul ini beroperasi di atas tabel `shipments` dan berhubungan dengan:

| Tabel / Model | Relasi | Keterangan |
|---|---|---|
| `shipments` | Tabel utama | Data pengiriman lengkap |
| `drivers` | `belongsTo` | Driver yang ditugaskan |
| `users` | `through drivers` | Nama & email driver |
| `purchase_orders` | `belongsTo` (opsional) | Referensi PO asal barang |
| `goods_receipts` | `belongsTo` (opsional) | Referensi penerimaan barang |

### Field Penting Model `Shipment`

| Field | Tipe | Keterangan |
|---|---|---|
| `shipment_id` | string | ID unik pengiriman (misal: `TRK-10293`) |
| `origin` / `origin_name` | string | Kode & nama kota asal |
| `origin_lat` / `origin_lng` | decimal | Koordinat GPS asal |
| `destination` / `destination_name` | string | Kode & nama kota tujuan |
| `dest_lat` / `dest_lng` | decimal | Koordinat GPS tujuan |
| `status` | enum | `on-time`, `delayed`, `in-transit`, `delivered` |
| `tracking_stage` | enum | Tahap konfirmasi driver (lihat di bawah) |
| `load_type` | enum | `ground`, `sea`, `air` |
| `driver_id` | FK | ID driver yang ditugaskan |
| `claimed_at` | datetime | Waktu driver mengklaim paket |
| `picked_up_at` | datetime | Waktu driver mengambil barang |
| `in_transit_at` | datetime | Waktu mulai perjalanan |
| `arrived_at_destination_at` | datetime | Waktu tiba di tujuan |
| `delivered_at` | datetime | Waktu barang diserahkan |
| `delivery_recipient_name` | string | Nama penerima saat pengiriman |
| `delivery_note` | text | Catatan pengiriman dari driver |
| `delivery_photo_path` | string | Path foto POD di storage |
| `last_tracking_note` | string | Catatan update terakhir driver |

---

## Tracking Stage (Tahapan Pengiriman)

Urutan life-cycle `tracking_stage` dari driver app:

```
ready_for_pickup  →  picked_up  →  in_transit  →  arrived_at_destination  →  delivered
```

| tracking_stage | Label (ID) | Status Shipment Terkait |
|---|---|---|
| `ready_for_pickup` | Siap Diambil | `in-transit` |
| `picked_up` | Sudah Diambil | `in-transit` |
| `in_transit` | Dalam Perjalanan | `in-transit` |
| `arrived_at_destination` | Sampai Gudang Tujuan | `in-transit` |
| `delivered` | Terkirim | `delivered` |

> **Penting untuk desain Kotlin App:** Setiap tombol aksi di screen pengiriman driver harus memajukan `tracking_stage` secara berurutan. Tidak bisa loncat tahap.

---

## Workflow Utama

### 1. Admin Membuat Pengiriman (Web Dashboard)

**Langkah-langkah:**
1. Admin klik **Tambah Pengiriman** di halaman `Shipments`.
2. Mengisi form: ID pengiriman, asal, tujuan, estimasi tiba, jenis kargo.
3. (Opsional) Menugaskan driver yang berstatus `approved`.
4. Submit → `POST /shipments` → Controller `store()`.
5. Sistem set `tracking_stage = ready_for_pickup` secara otomatis.
6. Jika driver sudah ditugaskan, `claimed_at = now()`.

**State Awal Shipment yang Baru Dibuat:**
```
tracking_stage  = ready_for_pickup
status          = in-transit
claimed_at      = NOW() (jika driver sudah ditugaskan)
last_tracking_note = "Shipment sudah dijadwalkan ke driver."
```

---

### 2. Driver Melihat Shipment (Kotlin App)

**Endpoint:** `GET /api/driver/shipments` *(auth: Sanctum Token)*

Driver hanya melihat shipment yang di-assign ke dirinya (`driver_id = driver.id`).

**Response Field yang Relevan untuk UI:**

| Field | Digunakan di Screen |
|---|---|
| `shipment_id` | Header card/detail |
| `origin_name` & `destination_name` | Rute tampilan |
| `tracking_stage` | Progress stepper |
| `tracking_stage_label` | Label teks pada stepper |
| `estimated_arrival` | ETA timer |
| `last_tracking_note` | Info terakhir |
| `picked_up_at`, `in_transit_at`, dll. | Timeline milestone |

---

### 3. Driver Update Tahap (Kotlin App)

**Endpoint:** `PUT /api/driver/shipments/{id}/status` *(auth: Sanctum Token)*

**Request Body:**
```json
{
  "tracking_stage": "picked_up",
  "note": "Barang sudah diambil dari gudang asal.",

  // Hanya diperlukan jika tracking_stage = "delivered":
  "delivery_recipient_name": "Budi Santoso",
  "delivery_note": "Diterima di pintu depan.",
  "delivery_photo_base64": "data:image/jpeg;base64,..."
}
```

**Validasi tracking_stage yang diterima server:**
- `ready_for_pickup` | `picked_up` | `in_transit` | `arrived_at_destination` | `delivered`

**Timestamp Otomatis (Cascade):**
Server menulis timestamp secara kumulatif — artinya jika driver loncat ke `in_transit`, server juga mengisi `picked_up_at` jika belum ada.

---

### 4. Driver Update Lokasi GPS (Kotlin App)

**Endpoint:** `POST /api/driver/location` *(auth: Sanctum Token)*

**Request Body:**
```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "is_mock": false
}
```

- Field `is_mock` dideteksi server dan ditampilkan sebagai badge **"Fake GPS Terdeteksi"** di dashboard admin.
- Driver app wajib memanggil endpoint ini secara periodik selagi ada pengiriman aktif.
- Server menyimpan koordinat ke tabel `drivers` (bukan per-shipment).

---

### 5. Admin Memantau di Dashboard (Web)

Di halaman `Shipments` (auto-refresh 15 detik), admin melihat:
- Posisi driver (kolom **Progress Driver** via `tracking_stage_label`).
- Alert delay jika `estimated_arrival` sudah lewat.
- Alert off-route jika driver menyimpang > 12% dari jarak total (min. 50 km).
- Link **TRACK** → halaman `Drivers > Live Tracking`.

Di halaman `ShipmentDetail`, admin melihat:
- Peta dengan posisi driver real-time.
- Progress bar jarak (covered km / total km).
- Timeline milestone dengan timestamp masing-masing tahap.
- Foto POD, nama penerima, dan catatan pengiriman.

---

## Sistem Alert

Sistem alert dihitung server-side di `buildAlerts()`:

| Alert | Kondisi | Nilai |
|---|---|---|
| `is_delayed` | `estimated_arrival` sudah lewat & status bukan `delivered` | `true/false` |
| `delay_minutes` | Berapa menit telat | Integer |
| `eta_label` | Teks relatif ETA | String (contoh: "2 hours from now") |
| `is_off_route` | Jarak driver ke garis asal-tujuan > threshold | `true/false` |
| `off_route_km` | Jarak deviasi dalam km | Float |
| `off_route_threshold_km` | Batas maksimum deviasi (12% total jarak, min 50 km) | Float |

---

## Proof of Delivery (POD)

Saat `tracking_stage = delivered`, driver **wajib** mengisi:
- **Nama penerima** (`delivery_recipient_name`)
- **Foto bukti serah terima** (`delivery_photo_base64` — format JPEG/PNG/WebP)
- (Opsional) **Catatan** (`delivery_note`)

Foto disimpan ke: `storage/app/public/shipments/pod/{uuid}.jpg`

Admin bisa mengunduh PDF POD via: `GET /shipments/{id}/proof-of-delivery`

---

## API Endpoint Summary (untuk Kotlin App)

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/api/driver/register` | Registrasi akun driver baru | ❌ |
| `POST` | `/api/driver/login` | Login dan dapatkan Bearer Token | ❌ |
| `GET` | `/api/driver/user` | Info profil driver yang login | ✅ |
| `GET` | `/api/driver/shipments` | Daftar shipment yang ditugaskan | ✅ |
| `POST` | `/api/driver/shipments/claim` | Klaim shipment tanpa driver | ✅ |
| `PUT` | `/api/driver/shipments/{id}/status` | Update tracking stage | ✅ |
| `POST` | `/api/driver/location` | Update koordinat GPS driver | ✅ |

> **Auth:** Bearer Token via Laravel Sanctum. Sertakan di header: `Authorization: Bearer {token}`

---

## Checklist Kesiapan Modul Shipment

- [x] CRUD shipment dari dashboard admin.
- [x] Assignment driver saat buat/edit pengiriman.
- [x] API login & registrasi driver (Sanctum).
- [x] API update tracking stage dengan cascade timestamp.
- [x] API update lokasi GPS driver.
- [x] Deteksi Fake GPS (`is_mock`).
- [x] Kalkulasi route metrics (total km, covered km, progress %).
- [x] Sistem alert: delay & off-route.
- [x] Proof of Delivery: foto base64 upload & PDF download.
- [x] Live tracking map di dashboard admin.
- [x] Auto-refresh data di halaman Shipments (15 detik).
