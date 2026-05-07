<?php

return [
    'trial_days' => 3,

    'plans' => [
        'trial_3d' => [
            'name' => 'Free Trial 3 Hari',
            'price_monthly' => 0,
            'tagline' => 'Coba dulu tanpa biaya',
            'modules' => [
                'core_inventory',
                'warehouse_ops',
                'shipment',
                'invoicing',
                'reports_advanced',
                'driver_management',
                'ai_contextual',
            ],
            'limits' => [
                'warehouses' => 1,
                'users' => 3,
            ],
            'benefits' => [
                'Akses fitur inti gudang',
                'Bisa pakai invoicing dasar',
                '1 gudang aktif (single warehouse)',
                'Support standar',
            ],
        ],
        'basic_umkm' => [
            'name' => 'Basic',
            'price_monthly' => 149000,
            'tagline' => 'Untuk UMKM dan toko kecil',
            'modules' => [
                'core_inventory',
                'invoicing',
                'warehouse_ops',
            ],
            'limits' => [
                'warehouses' => 1,
                'users' => 5,
            ],
            'benefits' => [
                'Manajemen stok, supplier, barang masuk-keluar',
                'Tagihan dasar',
                'Laporan operasional harian',
                '1 gudang aktif (single warehouse)',
            ],
        ],
        'pro' => [
            'name' => 'Pro',
            'price_monthly' => 799000,
            'tagline' => 'Paling cocok untuk gudang berkembang',
            'modules' => [
                'core_inventory',
                'warehouse_ops',
                'shipment',
                'invoicing',
                'reports_advanced',
                'driver_management',
                'ai_contextual',
            ],
            'limits' => [
                'warehouses' => 1,
                'users' => 20,
            ],
            'benefits' => [
                'Semua fitur Basic',
                'Pengiriman & tracking',
                'Driver management',
                'Laporan lanjutan',
                'AI kontekstual operasional',
                '1 gudang aktif (single warehouse)',
            ],
            'recommended' => true,
        ],
        'enterprise' => [
            'name' => 'Enterprise',
            'price_monthly' => 2499000,
            'tagline' => 'Untuk multi-cabang dan kebutuhan custom',
            'modules' => [
                'core_inventory',
                'warehouse_ops',
                'shipment',
                'invoicing',
                'reports_advanced',
                'driver_management',
                'ai_contextual',
            ],
            'limits' => [
                'warehouses' => 1,
                'users' => 999,
            ],
            'benefits' => [
                'Semua fitur Pro',
                'Kapasitas user besar',
                'Prioritas support & SLA',
                'Bisa integrasi dan alur khusus',
                'Tetap 1 gudang aktif untuk versi saat ini',
            ],
        ],
    ],

    'modules' => [
        'core_inventory' => [
            'name' => 'Inti Inventaris',
            'required' => true,
        ],
        'warehouse_ops' => [
            'name' => 'Operasional Gudang',
            'required' => false,
        ],
        'shipment' => [
            'name' => 'Pengiriman',
            'required' => false,
        ],
        'invoicing' => [
            'name' => 'Tagihan',
            'required' => false,
        ],
        'reports_advanced' => [
            'name' => 'Laporan Lanjutan',
            'required' => false,
        ],
        'driver_management' => [
            'name' => 'Manajemen Driver',
            'required' => false,
        ],
        'ai_contextual' => [
            'name' => 'AI Kontekstual',
            'required' => false,
        ],
    ],

    // route prefix => required module
    'route_modules' => [
        'invoices.' => 'invoicing',
        'shipments.' => 'shipment',
        'drivers.' => 'driver_management',
        'reports.' => 'reports_advanced',
        'rack.allocation.' => 'warehouse_ops',
        'stock-opname.' => 'warehouse_ops',
        'wms-documents.' => 'warehouse_ops',
        'petayu.' => 'ai_contextual',
    ],
];
