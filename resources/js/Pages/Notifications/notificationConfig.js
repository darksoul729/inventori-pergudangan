import {
    Bell,
    CheckCircle2,
    Clock3,
    Package,
    Route,
    ShoppingCart,
    Warehouse,
} from 'lucide-react';

export const notificationMeta = {
    'low-stock': {
        icon: Package,
        label: 'Inventaris',
        detail: 'Ada produk yang sudah berada di bawah atau sama dengan stok minimum. Prioritaskan pengecekan produk kritis dan rencana restock.',
        recommendation: 'Cek SKU dengan stok minimum, validasi lokasi rack, lalu buat PO atau transfer internal bila stok tersedia di gudang lain.',
        action: 'Buka Inventaris',
    },
    'pending-po': {
        icon: ShoppingCart,
        label: 'Pembelian',
        detail: 'Ada purchase order yang masih menunggu keputusan. Manager Gudang perlu meninjau approval, sedangkan Supervisor dapat memantau proses penerimaan setelah disetujui.',
        recommendation: 'Pastikan supplier, kuantitas, harga, dan kebutuhan stok sudah sesuai sebelum approval dilakukan.',
        action: 'Buka Pesanan Pembelian',
    },
    'delayed-shipment': {
        icon: Clock3,
        label: 'Pengiriman',
        detail: 'Ada pengiriman yang melewati estimasi waktu atau berstatus delayed. Periksa status driver, rute, dan proof of delivery bila sudah sampai.',
        recommendation: 'Hubungi driver, cek status rute terakhir, lalu update shipment agar tim gudang dan pelanggan melihat status yang sama.',
        action: 'Buka Pengiriman',
    },
    'off-route-shipment': {
        icon: Route,
        label: 'Tracking',
        detail: 'Ada driver yang terdeteksi menyimpang dari rute pengiriman. Tinjau lokasi terakhir dan hubungi Supervisor Gudang bila perlu tindakan lapangan.',
        recommendation: 'Validasi apakah deviasi terjadi karena kemacetan, perubahan alamat, atau kendala operasional sebelum eskalasi.',
        action: 'Tinjau Rute',
    },
    'system-check': {
        icon: CheckCircle2,
        label: 'Sistem',
        detail: 'Sinkronisasi sistem berjalan normal. Notifikasi ini menandai kondisi operasional tidak memiliki kendala kritis dari pengecekan terakhir.',
        recommendation: 'Tidak ada tindakan mendesak. Tetap pantau perubahan stok, PO, dan pengiriman dari dasbor.',
        action: 'Buka Dasbor',
    },
};

export const typeStyle = {
    error: {
        badge: 'bg-red-50 text-red-600 border-red-100',
        icon: 'bg-red-50 text-red-600',
        dot: 'bg-red-500',
        row: 'border-l-red-500',
        label: 'Kritis',
    },
    warning: {
        badge: 'bg-amber-50 text-amber-600 border-amber-100',
        icon: 'bg-amber-50 text-amber-600',
        dot: 'bg-amber-500',
        row: 'border-l-amber-500',
        label: 'Perlu Dicek',
    },
    success: {
        badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        icon: 'bg-emerald-50 text-emerald-600',
        dot: 'bg-emerald-500',
        row: 'border-l-emerald-500',
        label: 'Normal',
    },
    info: {
        badge: 'bg-indigo-50 text-[#3632c0] border-indigo-100',
        icon: 'bg-indigo-50 text-[#3632c0]',
        dot: 'bg-[#3632c0]',
        row: 'border-l-[#3632c0]',
        label: 'Info',
    },
};

export const filters = [
    { key: 'all', label: 'Semua' },
    { key: 'unread', label: 'Belum Dibaca' },
    { key: 'priority', label: 'Prioritas' },
];

export const getNotificationMeta = (notification) => {
    if (notificationMeta[notification.id]) return notificationMeta[notification.id];

    if (notification.id?.startsWith('capacity-')) {
        return {
            icon: Warehouse,
            label: 'Kapasitas Gudang',
            detail: 'Kapasitas gudang mendekati penuh. Tinjau alokasi rack dan prioritas barang yang harus dipindahkan atau dikirim.',
            recommendation: 'Buka data gudang, cek rack penuh, lalu lakukan transfer rack atau percepat outbound untuk barang prioritas.',
            action: 'Buka Gudang',
        };
    }

    return {
        icon: Bell,
        label: 'Notifikasi',
        detail: 'Tinjau detail notifikasi ini dan buka modul terkait untuk tindakan lanjutan.',
        recommendation: 'Pastikan data di modul terkait sudah sinkron sebelum menutup notifikasi.',
        action: 'Buka Detail',
    };
};
