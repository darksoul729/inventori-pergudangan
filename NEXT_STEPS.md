# Next Steps

Catatan ini dibuat sebagai pegangan untuk melanjutkan tahap berikutnya setelah pekerjaan role, security, audit Playwright, dan dependency audit.

## Status Saat Ini

- Sistem web sudah login-only. Public register web dinonaktifkan.
- Public driver register API dinonaktifkan.
- Akun staff dibuat oleh manager dari Settings.
- Seeder lokal juga menyediakan akun staff demo.
- Akun driver dibuat oleh manager dari halaman Drivers.
- Role middleware sudah membatasi akses manager, staff, dan driver.
- Staff dapat membuka halaman operasional read-only yang diizinkan.
- Staff tetap dapat mencatat outbound stock sesuai permission matrix.
- Staff tidak dapat create/update/delete data manager-only.
- UI staff menyembunyikan tombol manager-only.
- Audit Playwright sudah mencakup desktop dan mobile viewport.
- `npm audit` sudah bersih.
- Export Excel memakai dynamic import untuk `exceljs` dan `file-saver`.

## Verifikasi Terakhir

Command yang sudah lulus:

```bash
npm audit
npm run build
npm run audit:roles
php artisan test
```

Hasil terakhir:

```text
npm audit: found 0 vulnerabilities
npm run audit:roles: passed true
php artisan test: 38 passed, 109 assertions
```

## Akun Demo Lokal

Gunakan akun ini untuk pengujian lokal setelah seeding:

```text
Manager: admin@example.com / password
Staff: staff@example.com / password
Driver: driver@example.com / password
```

## Artefak Audit

Script audit role:

```bash
npm run audit:roles
```

Output screenshot dan report dibuat di:

```text
output/playwright/role-audit/
```

Folder tersebut sengaja di-ignore oleh git melalui `.gitignore`, supaya PNG/report hasil Playwright tidak ikut push.

## Tahap Berikutnya Yang Disarankan

1. Rapikan UX staff read-only.
   Fokus: halaman Inventory, Warehouse, Supplier, Purchase Orders, dan Shipments terlihat jelas sebagai mode staff tanpa tombol manager-only.

2. Optimasi chunk `Supplier`.
   Saat ini chunk Supplier masih besar karena charting library. Opsi aman: lazy-load chart section atau pisahkan chart component.

3. Audit visual mobile overlap.
   Audit role mobile sudah pass, tetapi belum ada pemeriksaan otomatis untuk overlap layout, horizontal overflow, atau teks kepotong.

4. Tambahkan dokumentasi akun demo.
   Buat catatan akun manager/staff/driver untuk pengujian lokal, tanpa memasukkan password production.

5. Rapikan `.codex/skills`.
   Banyak file skill lokal muncul di git status. Putuskan apakah skill project-local memang mau di-track atau cukup dipakai lokal.

## Catatan Branch

Nama branch yang cocok untuk perubahan saat ini:

```text
feature/role-security-audit
```

Alternatif:

```text
feature/closed-auth-role-permissions
chore/role-audit-playwright
```
