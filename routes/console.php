<?php

use Illuminate\Support\Facades\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Execute Supplier Performance calculation automatically on the 1st of every month at midnight
Schedule::command('supplier:calculate-performance')->monthlyOn(1, '00:00');

// Operational hardening
Schedule::command('queue:prune-failed --hours=72')->dailyAt('01:15');
Schedule::command('queue:prune-batches --hours=72')->dailyAt('01:30');
Schedule::command('db:monitor --databases=mysql --max=120')->everyFiveMinutes();
Schedule::command('billing:reconcile-pending --limit=120')->everyTenMinutes();
