<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class NotificationCenterController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Notifications/Index');
    }

    public function show(string $notificationId): Response
    {
        return Inertia::render('Notifications/Show', [
            'notificationId' => $notificationId,
        ]);
    }
}
