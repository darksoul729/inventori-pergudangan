# Final Notes - Sprint Malam (Pre-Final)

Tanggal: 2026-04-15

## 1) Lock Fitur Inti
- Klaim shipment by code dengan aturan **1 driver hanya 1 shipment aktif**: sudah diterapkan di backend (`hasBlockedShipment`).
- Flow POD -> verifikasi admin -> bisa ambil shipment baru: sudah aktif via `pod_verification_status`.
- Detail shipment, route maps, profile popup: sudah aktif di Kotlin driver app.

## 2) Stability Pass
- Error message jaringan di app driver dibuat lebih kontekstual:
  - Load daftar pengiriman
  - Update status
  - Submit POD
  - Klaim shipment
  - Load history
  - Submit registrasi
- Loader custom tetap dipakai (tidak kembali ke spinner default).

## 3) Data & API Consistency
- Endpoint list driver API distandardkan ke envelope:
  - `GET /api/driver/shipments` => `{ message, data: [] }`
  - `GET /api/driver/shipments/history` => `{ message, data: [] }`
- Kotlin app sudah disesuaikan untuk membaca field `data`.
- Mapping status driver di profile sudah mencakup:
  - `approved`, `pending`, `pending_approval`, `rejected`, `suspended`, `inactive`, `active`.

## 4) UI Final Polish
- Komponen tombol reusable tetap dipakai untuk aksi utama.
- Popup profile sudah dirapikan (field card style, status label manusiawi).

## 5) Test & Build Checklist
- `./driver-app/gradlew :app:compileDebugKotlin` => **SUCCESS**
- `php artisan test` => **FAIL (environment issue)**
- `php artisan test --filter=DriverApiTest` => **FAIL (environment issue)**

## 6) Known Issues (Sisa)
1. Environment PHP CLI belum memiliki `pdo_sqlite`/`sqlite3`, sehingga test Laravel berbasis in-memory sqlite tidak bisa jalan (`could not find driver`).
2. Perlu install/enable SQLite extension lalu rerun:
   - `php artisan test`
   - `php artisan test --filter=DriverApiTest`

## 7) 10 Skenario Uji Cepat (Manual) untuk Besok
1. Login driver approved -> sukses.
2. Klaim shipment pertama via kode -> sukses.
3. Coba klaim shipment kedua saat masih aktif -> ditolak.
4. Update stage hingga `arrived_at_destination` -> sukses.
5. Submit POD (`delivered`) -> status menunggu verifikasi.
6. Coba klaim shipment baru saat POD pending -> ditolak.
7. Admin reject POD -> tombol kirim ulang bukti muncul.
8. Resubmit POD -> pending lagi.
9. Admin approve POD -> shipment hilang dari aktif, masuk history.
10. Klaim shipment baru setelah approved -> sukses.
