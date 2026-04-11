# Inventory Flow

Dokumen ini menjelaskan boundary modul `Inventory Management` dan bagaimana ia berinteraksi dengan modul `Warehouse` untuk menjaga sinkronisasi stok.

## Scope Modul Inventory

Modul Inventory bertanggung jawab untuk:

- Mengelola master data produk (`products`) termasuk kategori, unit, dan gambar.
- Memberikan gambaran umum (overview) stok produk secara global dan per gudang.
- Mengelola pendaftaran barang baru ke sistem (`Add New Entry`).
- Mencatat pergerakan barang keluar (`Record Outbound`).
- Melakukan sinkronisasi otomatis antara stok master dan stok fisik di rak.
- Menyediakan fitur pencarian dan penyaringan (filter) produk yang dinamis.

## Struktur Data & Relasi

Modul Inventory beroperasi di atas tabel-tabel berikut:

- `products`: Tabel utama master barang.
- `categories` & `units`: Metadata pendukung produk.
- `product_stocks`: Agregasi stok produk per warehouse.
- `rack_stocks`: Detail lokasi fisik produk di dalam rak (milik modul Warehouse).
- `stock_movements`: Log histori pergerakan barang.

## Workflow Utama

### 1. Pendaftaran Produk Baru (Add New Entry)
Proses ini menciptakan master produk sekaligus stok awal (opsional).

**Langkah-langkah:**
1. Validasi master data (SKU, Name, Category).
2. Jika `initial_stock > 0`:
   - Validasi kapasitas rak di Warehouse tujuan menggunakan `ensureRackCapacity`.
   - Update `product_stocks` (agregasi warehouse).
   - Update `rack_stocks` (lokasi fisik).
   - Tulis `stock_movements` (Movement Type: `IN`).
3. Simpan gambar produk ke storage (jika ada).

### 2. Pencatatan Barang Keluar (Record Outbound)
Proses pengurangan stok dari gudang berdasarkan permintaan.

**Langkah-langkah:**
1. Validasi ketersediaan stok di warehouse terpilih.
2. Identifikasi rak yang berisi produk tersebut di warehouse tujuan (FIFO/LIFO logic - saat ini menggunakan distribusi otomatis).
3. Kurangi stok di `rack_stocks`.
4. Sinkronkan ke `product_stocks` menggunakan trait `HandlesStockSync`.
5. Tulis `stock_movements` (Movement Type: `OUT`) dengan referensi `stock_out`.

## Aturan Sinkronisasi (Stock Sync Engine)

Modul ini menggunakan trait `HandlesStockSync` untuk memastikan integritas data:

- **Aggregated Sync**: Setiap perubahan pada level rak (`rack_stocks`) harus memicu pembaruan pada ringkasan gudang (`product_stocks`).
- **Capacity Guard**: Sebelum menambah stok ke rak, sistem wajib mengecek `max_stock` pada rak tersebut (diambil dari kapasitas rak asli).
- **Movement Logging**: Setiap perubahan stok fisik wajib menghasilkan satu baris di `stock_movements` untuk keperluan audit.

## Boundary & Integrasi

### Integrasi dengan Modul Warehouse
- Inventory "meminjam" data `racks` dan `rack_stocks` dari modul Warehouse.
- Inventory tidak mengelola pembuatan rak, hanya menggunakan rak yang sudah ada.

### Fitur UI/UX (Kinetic Architect)
- **Real-time Filter**: Penyaringan berdasarkan Kategori, Lokasi, dan Status (Healthy/Low/Out) dilakukan secara reaktif.
- **Header Search**: Pencarian produk terintegrasi langsung di header dashboard.
- **Stock Visibility**: Form outbound menunjukkan stok yang tersedia secara real-time berdasarkan kombinasi Produk + Gudang.

## Checklist Kesiapan Inventory

Modul Inventory dianggap stabil jika:
- [x] CRUD master produk (termasuk upload gambar) berjalan.
- [x] Validasi kapasitas rak saat input barang baru.
- [x] Record Outbound memotong stok fisik di rak dan agregasi gudang.
- [x] Filter Categories, Location, dan Status berfungsi 100%.
- [x] Fitur search di header tersambung ke tabel inventori.
- [x] Sinkronisasi `stock_movements` tercatat dengan benar.

## Reference Convention

- **Movement Types**: `IN` (Masuk), `OUT` (Keluar).
- **Reference Types**: `initial_entry` (Barang Baru), `stock_out` (Outbound).
