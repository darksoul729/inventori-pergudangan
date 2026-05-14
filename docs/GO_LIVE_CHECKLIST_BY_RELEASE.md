# Go-Live Checklist by Release

## Release 1 - Gudang Umum + Timber + SaaS

### Produk & Fitur
- [ ] Core WMS stabil: inventaris, transaksi, pengiriman, tagihan, laporan.
- [ ] Modul timber aktif: dimensi, volume, grade, QC kayu, lot tumpukan.
- [ ] Menu awam final (tanpa double UI/data).
- [ ] Bahasa operasional konsisten Indonesia.

### SaaS
- [ ] Multi-tenant isolation aktif.
- [ ] Trial 14 hari aktif.
- [ ] Plan Basic/Growth/Pro aktif.
- [ ] Entitlement modul per tenant aktif.
- [ ] Suspend/grace billing dasar aktif.

### Keamanan & Audit
- [ ] Role matrix enforced.
- [ ] Module middleware enforced.
- [ ] Audit log mutasi aktif.
- [ ] Security headers tervalidasi.

### QA
- [ ] Feature test hijau.
- [ ] Role + module access test hijau.
- [ ] Playwright smoke manager/supervisor/staff hijau.
- [ ] No critical bug open.

### Operasional
- [ ] Seeder demo untuk sales/support.
- [ ] SOP onboarding tenant baru.
- [ ] SOP backup & restore.
- [ ] SOP incident response.

---

## Release 2 - Cold-Chain Full
- [ ] Multi-temperature zone.
- [ ] Temperatur logging + alarm.
- [ ] FEFO + quality hold otomatis.
- [ ] Dashboard compliance suhu.
- [ ] Test deviasi suhu & audit trail.

## Release 3 - Farmasi Regulated Full
- [ ] Batch/expiry + serialisasi (jika dibutuhkan).
- [ ] Workflow hold/release/reject.
- [ ] Immutable audit trail compliance.
- [ ] Laporan inspeksi siap audit.
- [ ] Test skenario recall end-to-end.

## Release 4 - 3PL + Manufaktur Kompleks
- [ ] Multi-client 3PL + SLA.
- [ ] Billing per aktivitas 3PL.
- [ ] BOM + WIP + output produksi.
- [ ] QC lot traceability end-to-end.
- [ ] Costing & margin report.

## Exit Criteria Tiap Release
- [ ] UAT sign-off.
- [ ] Dokumen user/admin update.
- [ ] Monitoring & alert live.
- [ ] Rollback plan tervalidasi.
