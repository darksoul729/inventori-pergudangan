# PETAYU SaaS Modular Blueprint

## 1) Tujuan Produk
- Sederhana untuk UMKM/toko/gudang kecil-menengah.
- Modular: tenant hanya melihat & membayar fitur yang dipakai.
- Alur utama tidak membingungkan: Barang Masuk -> Simpan/Pindah Rak -> Barang Keluar/Pengiriman -> Tagihan -> Laporan.

## 2) Prinsip UX
- Default mode: `Operasional Harian` (fitur advanced disembunyikan).
- Menu utama maksimal 5:
  - Dasbor
  - Stok Barang
  - Pengiriman
  - Tagihan
  - Laporan
- Modul aktif menentukan submenu yang tampil.
- Bahasa full operasional Indonesia, konsisten.

## 3) Domain SaaS
- `Tenant`: perusahaan pengguna.
- `Subscription`: paket aktif, trial, status billing.
- `Module`: fitur yang bisa diaktif/nonaktif per tenant.
- `Entitlement`: hasil akhir izin fitur tenant (dari paket + add-on).

## 4) Paket (Plan) yang Direkomendasikan
- `trial_14d`
  - Semua modul aktif.
  - Batas ekspor/PDF dan watermark.
- `basic_umkm`
  - Core + 1 add-on modul.
- `growth`
  - Core + Tagihan + Laporan + Approval.
- `pro`
  - Semua modul + AI kontekstual + API.

## 5) Modul
- `core_inventory` (wajib)
  - Dasbor sederhana, inventaris, barang masuk/keluar, transaksi dasar.
- `warehouse_ops`
  - Pindah Rak, Cek Stok Fisik, dokumen WMS.
- `shipment`
  - Pengiriman, status, POD, verifikasi.
- `invoicing`
  - Tagihan, status bayar, cetak PDF.
- `reports_advanced`
  - Laporan lanjutan, ekspor detail.
- `driver_management`
  - Driver, assignment, tracking.
- `ai_contextual`
  - Asisten AI berbasis data tenant.

## 6) Data Model (Tabel Baru)
- `tenants`
  - id, code, name, slug, status, timezone, locale, created_at, updated_at
- `plans`
  - id, code, name, monthly_price, yearly_price, is_public, metadata(json)
- `modules`
  - id, code, name, category, is_core, metadata(json)
- `plan_modules`
  - id, plan_id, module_id, is_enabled
- `tenant_subscriptions`
  - id, tenant_id, plan_id, status(trialing/active/past_due/canceled), trial_ends_at, starts_at, ends_at, billing_provider, external_id
- `tenant_modules`
  - id, tenant_id, module_id, is_enabled, source(plan/addon/manual), starts_at, ends_at

## 7) Adaptasi Model Existing
- Tambahkan `tenant_id` bertahap pada tabel domain:
  - users, warehouses, products, product_stocks, shipments, invoices, suppliers, purchase_orders, stock_* documents.
- Set global scope tenant pada query domain utama.
- Pastikan unique index disesuaikan per tenant (contoh: sku unique per tenant).

## 8) Enforcement Akses
- Middleware baru:
  - `EnsureTenantContext`
  - `EnsureModuleEnabled:<module_code>`
- Integrasi route:
  - Contoh `invoices.*` wajib `invoicing`
  - `shipments.*` wajib `shipment`
  - `stock-opname`/`rack-allocation` wajib `warehouse_ops`

## 9) Rollout Bertahap (Aman)
- Sprint 1: Fondasi SaaS
  - Tabel tenants/plans/modules/subscriptions.
  - Seeder plan+module default.
  - Mapping 1 tenant default untuk data existing.
- Sprint 2: Modul Guard
  - Middleware module.
  - Menu dinamis berdasarkan entitlement.
- Sprint 3: Trial & Billing
  - Trial 14 hari.
  - Lifecycle subscription (active/past_due/canceled).
- Sprint 4: Multitenancy penuh
  - `tenant_id` di seluruh domain penting + hardening query.

## 10) KPI Keberhasilan
- Waktu onboarding tenant baru < 15 menit.
- User awam bisa menyelesaikan alur harian tanpa training > 30 menit.
- Penurunan klik/menu yang tidak relevan minimal 40%.
- Upgrade trial -> paid meningkat karena modul add-on jelas.

## 11) Risiko & Mitigasi
- Risiko: scope tenant bocor data lintas tenant.
  - Mitigasi: policy + global scope + test isolasi tenant.
- Risiko: menu terlalu banyak.
  - Mitigasi: only show enabled module, default simple mode.
- Risiko: paket membingungkan.
  - Mitigasi: 3 paket utama + 1 trial, tanpa kombinasi rumit.

## 12) Definisi "Done" Fase Awal
- Tenant bisa login dan hanya melihat modul yang aktif.
- Modul Tagihan bisa on/off tanpa mengganggu modul lain.
- Trial 14 hari berjalan otomatis.
- Test akses role + module guard hijau.
