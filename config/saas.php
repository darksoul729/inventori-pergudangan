<?php

return [
    'trial_days' => 3,
    'billing_grace_days' => 3,

    // Grace period per plan (hari). Enterprise lebih panjang karena nilai kontrak lebih besar.
    'plan_grace_days' => [
        'trial_3d'    => 0,
        'basic_umkm'  => 3,
        'pro'         => 3,
        'enterprise'  => 7,
    ],

    'plans' => [
        'trial_3d' => [
            'name' => 'Free Trial 3 Hari',
            'price_monthly' => 0,
            'tagline' => 'Coba gratis, tanpa kartu kredit',
            // Trial = showcase semua modul. Setelah expired, SaasEntitlement
            // otomatis mematikan semua non-required modul.
            'modules' => [
                'core_inventory',
                'warehouse_ops',
                'invoicing',
                'shipment',
                'reports_advanced',
                'warehouse_layout_editor',
                'ai_contextual',
            ],
            'limits' => [
                'warehouses' => 1,
                'users' => 3,
            ],
            'benefits' => [
                'Akses semua fitur selama 3 hari',
                '1 gudang aktif',
                'Maks. 3 pengguna',
                'Support standar via email',
            ],
        ],
        'basic_umkm' => [
            'name' => 'Basic',
            'price_monthly' => 149000,
            'tagline' => 'Untuk UMKM dan toko kecil',
            'modules' => [
                'core_inventory',
                'warehouse_ops',
                'invoicing',
            ],
            'limits' => [
                'warehouses' => 1,
                'users' => 5,
            ],
            'benefits' => [
                'Manajemen stok, supplier, barang masuk-keluar',
                'Operasional gudang (rak, opname, transfer)',
                'Tagihan & customer dasar',
                '1 gudang aktif',
                'Maks. 5 pengguna',
            ],
        ],
        'pro' => [
            'name' => 'Pro',
            'price_monthly' => 799000,
            'tagline' => 'Paling cocok untuk gudang berkembang',
            'modules' => [
                'core_inventory',
                'warehouse_ops',
                'invoicing',
                'shipment',
                'reports_advanced',
            ],
            'limits' => [
                'warehouses' => 1,
                'users' => 20,
            ],
            'benefits' => [
                'Semua fitur Basic',
                'Pengiriman & driver management',
                'Laporan lanjutan & export',
                '1 gudang aktif',
                'Maks. 20 pengguna',
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
                'invoicing',
                'shipment',
                'reports_advanced',
                'warehouse_layout_editor',
                'ai_contextual',
            ],
            'limits' => [
                'warehouses' => 1,
                'users' => 999,
            ],
            'benefits' => [
                'Semua fitur Pro',
                'Layout editor gudang interaktif',
                'AI kontekstual operasional (Petayu AI)',
                'Pengguna tidak terbatas',
                'Grace period 7 hari',
                'Prioritas support & SLA',
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
        'warehouse_layout_editor' => [
            'name' => 'Layout Editor Gudang',
            'required' => false,
        ],
        'shipment' => [
            'name' => 'Pengiriman & Driver',
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
        'ai_contextual' => [
            'name' => 'AI Kontekstual',
            'required' => false,
        ],
    ],

    // route prefix => required module
    'route_modules' => [
        'invoices.' => 'invoicing',
        'shipments.' => 'shipment',
        'drivers.' => 'shipment',
        'reports.' => 'reports_advanced',
        'rack.allocation.' => 'warehouse_ops',
        'stock-opname.' => 'warehouse_ops',
        'wms-documents.' => 'warehouse_ops',
        'warehouse.layout.' => 'warehouse_layout_editor',
        'petayu.' => 'ai_contextual',
    ],
];
