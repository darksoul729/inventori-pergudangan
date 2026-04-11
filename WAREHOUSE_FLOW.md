# Warehouse Flow

Dokumen ini menjelaskan boundary modul `Warehouse Management` dan kontrak data untuk integrasi dengan modul `Inventory` dan `Transaction`.

## Scope Modul Warehouse

Modul warehouse bertanggung jawab untuk:

- mengelola gudang utama (`warehouses`)
- mengelola zona gudang (`warehouse_zones`)
- mengelola rack/lokasi simpan (`racks`)
- mengelola stok fisik per rack (`rack_stocks`)
- menghitung occupancy zone dan rack
- menulis activity log dasar ke `stock_movements` untuk aktivitas rack

Modul warehouse tidak menjadi pemilik utama untuk transaksi bisnis seperti PO, goods receipt formal, stock out formal, stock transfer formal, opname formal, dan adjustment formal. Tabel-tabel itu disiapkan untuk modul lain.

## Struktur Data

Relasi utama:

- `warehouses` -> banyak `warehouse_zones`
- `warehouse_zones` -> banyak `racks`
- `racks` -> banyak `rack_stocks`
- `products` -> bisa berada di banyak `rack_stocks`
- `product_stocks` -> ringkasan stok produk per warehouse
- `stock_movements` -> histori perubahan stok

## Kontrak Data

### 1. `rack_stocks`

`rack_stocks` adalah sumber kebenaran untuk lokasi fisik stok.

Artinya:

- produk ada di rack mana
- berapa quantity fisiknya
- berapa reserved quantity
- batch number
- expired date

Constraint:

- satu produk hanya boleh satu record per rack
- unique index: `(rack_id, product_id)`

### 2. `product_stocks`

`product_stocks` adalah ringkasan stok per warehouse.

Artinya:

- page inventory bisa membaca total stok per warehouse dari sini
- data ini harus sinkron dengan agregasi dari `rack_stocks`

Constraint:

- satu produk hanya boleh satu record per warehouse
- unique index: `(product_id, warehouse_id)`

### 3. `stock_movements`

`stock_movements` adalah histori perubahan stok.

Minimal field penting:

- `product_id`
- `warehouse_id`
- `movement_type`
- `reference_type`
- `reference_id`
- `quantity`
- `stock_before`
- `stock_after`
- `movement_date`
- `notes`
- `created_by`

## Aturan Sinkronisasi

### Saat modul warehouse mengubah isi rack

Jika user:

- menambah product ke rack
- mengubah qty product di rack
- menghapus product dari rack

maka sistem warehouse harus:

1. update `rack_stocks`
2. sinkronkan agregasi ke `product_stocks`
3. tulis log ke `stock_movements`

### Saat modul transaction mengubah stok warehouse

Jika modul transaction nanti membuat:

- goods receipt
- stock out
- transfer
- stock opname
- stock adjustment

maka sistem transaction minimal harus:

1. update `product_stocks`
2. tulis `stock_movements`

Jika transaksi itu juga menentukan lokasi fisik barang, maka harus lanjut:

3. update `rack_stocks`

## Boundary Dengan Modul Lain

### Modul Warehouse

Tanggung jawab:

- zone
- rack
- rack occupancy
- lokasi fisik stok
- internal rack stock mutation

### Modul Inventory

Tanggung jawab:

- master product
- overview stok
- stock summary
- low stock monitoring
- histori stok berbasis `product_stocks` dan `stock_movements`

### Modul Transaction

Tanggung jawab:

- purchase order
- goods receipt
- stock out
- transfer antar warehouse
- stock opname formal
- stock adjustment formal

## Reference Convention Untuk `stock_movements`

Supaya konsisten, gunakan nilai `reference_type` seperti ini:

- `rack`
- `zone`
- `goods_receipt`
- `stock_out`
- `stock_transfer`
- `stock_opname`
- `stock_adjustment`

Catatan:

- kalau butuh detail lokasi rack, simpan di `notes`
- jangan gunakan string bebas yang berubah-ubah antar modul

## Checklist Warehouse Management

Modul warehouse dianggap siap handoff jika:

- CRUD zone berjalan
- CRUD rack berjalan
- CRUD rack stock berjalan
- validasi kapasitas rack berjalan
- `rack_stocks` sinkron ke `product_stocks`
- perubahan rack stock menulis `stock_movements`
- seeder warehouse demo tersedia
- UI warehouse cukup jelas untuk operator
- constraint unique untuk stok sudah ada

## Catatan Integrasi

Teman yang mengerjakan `Inventory` dan `Transaction` tidak perlu mengelola zone atau rack dari nol.

Yang perlu mereka asumsikan:

- lokasi fisik stok ada di modul warehouse
- total stok warehouse ada di `product_stocks`
- histori stok lintas modul ada di `stock_movements`
