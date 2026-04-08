<?php
$migrationsDir = __DIR__ . '/database/migrations';
$files = scandir($migrationsDir);

$schemas = [
    'warehouses' => <<<PHP
            \$table->string('code', 30);
            \$table->string('name', 100);
            \$table->string('location', 255);
            \$table->text('description')->nullable();
PHP,
    'categories' => <<<PHP
            \$table->string('name', 100);
            \$table->string('description', 255)->nullable();
PHP,
    'units' => <<<PHP
            \$table->string('name', 50);
            \$table->string('symbol', 20);
PHP,
    'suppliers' => <<<PHP
            \$table->string('code', 30);
            \$table->string('name', 100);
            \$table->string('contact_person', 100)->nullable();
            \$table->string('phone', 20)->nullable();
            \$table->string('email', 100)->nullable();
            \$table->text('address')->nullable();
            \$table->string('city', 100)->nullable();
            \$table->string('status', 20)->default('active');
PHP,
    'customers' => <<<PHP
            \$table->string('code', 30);
            \$table->string('name', 100);
            \$table->string('contact_person', 100)->nullable();
            \$table->string('phone', 20)->nullable();
            \$table->string('email', 100)->nullable();
            \$table->text('address')->nullable();
PHP,
    'products' => <<<PHP
            \$table->string('sku', 50);
            \$table->string('barcode', 100)->nullable();
            \$table->string('name', 150);
            \$table->foreignId('category_id')->restrictOnDelete();
            \$table->foreignId('unit_id')->restrictOnDelete();
            \$table->foreignId('default_supplier_id')->nullable()->restrictOnDelete();
            \$table->integer('minimum_stock')->default(0);
            \$table->decimal('purchase_price', 15, 2);
            \$table->decimal('selling_price', 15, 2);
            \$table->integer('lead_time_days')->default(0);
            \$table->boolean('is_active')->default(true);
            \$table->text('description')->nullable();
PHP,
    'product_stocks' => <<<PHP
            \$table->foreignId('product_id')->restrictOnDelete();
            \$table->foreignId('warehouse_id')->restrictOnDelete();
            \$table->integer('current_stock')->default(0);
            \$table->integer('reserved_stock')->default(0);
            \$table->timestamp('last_updated_at')->nullable();
PHP,
    'purchase_orders' => <<<PHP
            \$table->string('po_number', 50);
            \$table->foreignId('supplier_id')->restrictOnDelete();
            \$table->foreignId('warehouse_id')->restrictOnDelete();
            \$table->date('order_date');
            \$table->date('expected_date')->nullable();
            \$table->string('status', 20)->default('pending');
            \$table->text('notes')->nullable();
            \$table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            \$table->foreignId('approved_by')->nullable()->constrained('users')->restrictOnDelete();
PHP,
    'purchase_order_items' => <<<PHP
            \$table->foreignId('purchase_order_id')->restrictOnDelete();
            \$table->foreignId('product_id')->restrictOnDelete();
            \$table->integer('quantity');
            \$table->decimal('unit_price', 15, 2);
            \$table->decimal('subtotal', 15, 2);
PHP,
    'goods_receipts' => <<<PHP
            \$table->string('receipt_number', 50);
            \$table->foreignId('purchase_order_id')->restrictOnDelete();
            \$table->foreignId('supplier_id')->restrictOnDelete();
            \$table->foreignId('warehouse_id')->restrictOnDelete();
            \$table->date('receipt_date');
            \$table->string('status', 20)->default('received');
            \$table->text('notes')->nullable();
            \$table->foreignId('created_by')->constrained('users')->restrictOnDelete();
PHP,
    'goods_receipt_items' => <<<PHP
            \$table->foreignId('goods_receipt_id')->restrictOnDelete();
            \$table->foreignId('product_id')->restrictOnDelete();
            \$table->integer('quantity_received');
            \$table->decimal('unit_price', 15, 2);
            \$table->decimal('subtotal', 15, 2);
            \$table->string('batch_number', 100)->nullable();
            \$table->date('expired_date')->nullable();
PHP,
    'stock_outs' => <<<PHP
            \$table->string('stock_out_number', 50);
            \$table->foreignId('warehouse_id')->restrictOnDelete();
            \$table->foreignId('customer_id')->restrictOnDelete();
            \$table->date('out_date');
            \$table->string('purpose', 30);
            \$table->string('status', 20)->default('completed');
            \$table->text('notes')->nullable();
            \$table->foreignId('created_by')->constrained('users')->restrictOnDelete();
PHP,
    'stock_out_items' => <<<PHP
            \$table->foreignId('stock_out_id')->restrictOnDelete();
            \$table->foreignId('product_id')->restrictOnDelete();
            \$table->integer('quantity');
            \$table->decimal('unit_price', 15, 2);
            \$table->decimal('subtotal', 15, 2);
PHP,
    'stock_transfers' => <<<PHP
            \$table->string('transfer_number', 50);
            \$table->foreignId('from_warehouse_id')->constrained('warehouses')->restrictOnDelete();
            \$table->foreignId('to_warehouse_id')->constrained('warehouses')->restrictOnDelete();
            \$table->date('transfer_date');
            \$table->string('status', 20)->default('pending');
            \$table->text('notes')->nullable();
            \$table->foreignId('created_by')->constrained('users')->restrictOnDelete();
PHP,
    'stock_transfer_items' => <<<PHP
            \$table->foreignId('stock_transfer_id')->restrictOnDelete();
            \$table->foreignId('product_id')->restrictOnDelete();
            \$table->integer('quantity');
PHP,
    'stock_opnames' => <<<PHP
            \$table->string('opname_number', 50);
            \$table->foreignId('warehouse_id')->restrictOnDelete();
            \$table->date('opname_date');
            \$table->text('notes')->nullable();
            \$table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            \$table->foreignId('approved_by')->nullable()->constrained('users')->restrictOnDelete();
PHP,
    'stock_opname_items' => <<<PHP
            \$table->foreignId('stock_opname_id')->restrictOnDelete();
            \$table->foreignId('product_id')->restrictOnDelete();
            \$table->integer('system_stock');
            \$table->integer('physical_stock');
            \$table->integer('difference');
            \$table->string('note', 255)->nullable();
PHP,
    'stock_adjustments' => <<<PHP
            \$table->string('adjustment_number', 50);
            \$table->foreignId('warehouse_id')->restrictOnDelete();
            \$table->date('adjustment_date');
            \$table->string('reason', 100);
            \$table->text('notes')->nullable();
            \$table->foreignId('created_by')->constrained('users')->restrictOnDelete();
PHP,
    'stock_adjustment_items' => <<<PHP
            \$table->foreignId('stock_adjustment_id')->restrictOnDelete();
            \$table->foreignId('product_id')->restrictOnDelete();
            \$table->string('adjustment_type', 10);
            \$table->integer('quantity');
            \$table->string('note', 255)->nullable();
PHP,
    'stock_movements' => <<<PHP
            \$table->foreignId('product_id')->restrictOnDelete();
            \$table->foreignId('warehouse_id')->restrictOnDelete();
            \$table->string('movement_type', 20);
            \$table->string('reference_type', 50);
            \$table->bigInteger('reference_id');
            \$table->integer('quantity');
            \$table->integer('stock_before');
            \$table->integer('stock_after');
            \$table->dateTime('movement_date');
            \$table->text('notes')->nullable();
            \$table->foreignId('created_by')->constrained('users')->restrictOnDelete();
PHP,
    'restock_recommendations' => <<<PHP
            \$table->foreignId('product_id')->restrictOnDelete();
            \$table->foreignId('warehouse_id')->restrictOnDelete();
            \$table->date('recommendation_date');
            \$table->integer('current_stock');
            \$table->decimal('avg_daily_out', 10, 2);
            \$table->decimal('predicted_days_remaining', 10, 2);
            \$table->integer('suggested_restock_qty');
            \$table->string('recommendation_status', 20)->default('pending');
            \$table->text('notes')->nullable();
PHP,
    'supplier_performances' => <<<PHP
            \$table->foreignId('supplier_id')->restrictOnDelete();
            \$table->integer('period_month');
            \$table->integer('period_year');
            \$table->integer('total_orders');
            \$table->integer('on_time_deliveries');
            \$table->integer('late_deliveries');
            \$table->decimal('avg_lead_time_days', 10, 2);
            \$table->decimal('performance_score', 5, 2);
PHP,
];

foreach ($files as $file) {
    if (pathinfo($file, PATHINFO_EXTENSION) !== 'php') continue;
    $content = file_get_contents($migrationsDir . '/' . $file);
    
    foreach ($schemas as $table => $schemaContent) {
        if (strpos($file, 'create_' . $table . '_table') !== false) {
            $pattern = "/(\\\$table->id\(\);)(.*?)(\\\$table->timestamps\(\);)/s";
            if (preg_match($pattern, $content)) {
                $replacement = "\\\$table->id();\n" . $schemaContent . "\n            \\\$table->timestamps();";
                $newContent = preg_replace($pattern, $replacement, $content);
                file_put_contents($migrationsDir . '/' . $file, $newContent);
                echo "Updated {$table} migration.\n";
            }
        }
    }
}
echo "All migrations updated.\n";
