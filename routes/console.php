<?php

use Illuminate\Support\Facades\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Execute Supplier Performance calculation automatically on the 1st of every month at midnight
Schedule::command('supplier:calculate-performance')->monthlyOn(1, '00:00');
