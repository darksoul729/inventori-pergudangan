# Dashboard Flow

Dokumen ini menjelaskan alur data, komponen visualisasi, dan pusat intelijen pada modul `Warehouse Intelligence Dashboard`.

## Scope Modul Dashboard

Modul dashboard berfungsi sebagai pusat komando dan monitoring real-time yang mengumpulkan data dari modul `Warehouse`, `Inventory`, dan `Transaction`.

Tanggung jawab utama:
- Menyajikan KPI Utama (Total Inventory, Outbound Rate, Active Nodes).
- Memantau kesehatan sistem melalui **System Alerts**.
- Visualisasi tren pergerakan stok (**Stock Movement Trend**).
- Monitoring kepadatan lokasi fisik (**Warehouse Floor Visualization**).
- Menyediakan akses cepat ke detail rack melalui pop-up interaktif.

## Alur Data (Data Flow)

Data dashboard dikelola oleh `DashboardController` dengan alur sebagai berikut:

1. **Agregasi Stok**: Mengambil total `quantity` dari `rack_stocks` dan menghitung tren persentase berdasarkan transaksi masuk/keluar dalam 24 jam terakhir.
2. **Kalkulasi Outbound**: Menghitung rata-rata kecepatan keluar barang per jam dari `stock_movements`.
3. **Deteksi Alerts**: 
   - Mengidentifikasi produk di bawah `minimum_stock`.
   - Menghitung aktivitas penyesuaian stok (`adjustment`/`opname`) yang baru terjadi.
4. **Pemetaan Fisik**: Mengambil status setiap `rack`, menghitung utilitas (`fill_percent`), dan menentukan status alert jika utilitas > 90%.

## Komponen Visualisasi

### 1. Stock Movement Trend
Visualisasi tren masuk (Inbound) vs keluar (Outbound) selama 7 hari terakhir.
- **Teknologi**: Dinamis SVG dengan Smooth Bézier Curves.
- **Interaktivitas**: 
  - **Scanning Crosshair**: Garis vertikal yang mengikuti kursor untuk inspeksi data harian.
  - **Daily Tooltip**: Menampilkan angka pasti inbound/outbound per tanggal.
  - **Contextual Markers**: Titik data yang menyorot saat kursor mendekat.

### 2. Warehouse Floor Visualization
Peta interaktif dari seluruh lokasi penyimpanan (Rack) di gudang.
- **Grid System**: Representasi 12-kolom yang menyesuaikan dengan jumlah rack nyata.
- **Heatmap Logic**:
  - `Biru`: Terisi (Occupied).
  - `Abu-abu`: Kosong (Empty).
  - `Merah & Glow`: Kritis (Utilization > 90%).
- **Interactive Tooltips**: Memberikan ringkasan cepat utilitas tanpa meninggalkan halaman.
- **Detail Modal**: Klik pada unit rack untuk membuka analitik mendalam dan peringatan kapasitas.

## Fitur Sorting & Grouping

User dapat mengubah cara pandang peta gudang melalui tiga mode:
1. **Grouped by Zone (Default)**: Mengelompokkan rack berdasarkan zona (misal: Zone D, Dock Line). Zona terbaru diposisikan paling atas.
2. **Fullest Capacity**: Mengurutkan seluruh rack dari yang paling padat ke yang paling kosong. Berguna untuk audit kepadatan.
3. **Newest Added**: Mengurutkan rack berdasarkan tanggal pembuatan terbaru.

## Kontrak Tampilan (UI Contract)

Dashboard menggunakan sistem koordinat dan margin yang dioptimalkan untuk responsivitas:
- **Safety Margins**: Menggunakan padding besar (`px-24`, `pt-24`) pada container visualization untuk mencegah tooltip terpotong.
- **Edge-Aware Positioning**: Tooltip pada rack paling kiri/kanan akan menyesuaikan alinasinya secara otomatis agar tidak keluar dari area pandang.
- **Non-scaling Strokes**: Semua garis grafik dan marker menggunakan `vector-effect="non-scaling-stroke"` agar ketajaman visual konsisten di semua resolusi monitor.

## Checklist Kesiapan Dashboard

Dashboard dianggap berfungsi penuh jika:
- KPI Cards menampilkan data asli dari database (bukan placeholder).
- Grafik Trend sinkron dengan data di halaman Transaction.
- Filter Zone/Full/New mengubah urutan grid rack secara instan.
- Tooltip muncul dengan informasi yang akurat dan tidak terpotong.
- Modal detail rack memberikan peringatan kapasitas yang tepat (>90%).
- Desain visual mengikuti standar Premium/High-Aesthetic.

## Catatan Integrasi

Dashboard sangat bergantung pada integritas data di:
- `rack_stocks`: Untuk perhitungan utilitas lokasi.
- `stock_movements`: Untuk data tren harian.
- `products`: Untuk monitoring ambang batas stok minimum.
