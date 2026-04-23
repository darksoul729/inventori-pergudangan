<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HelpCenterController extends Controller
{
    public function liveSupport(): Response
    {
        return Inertia::render('Help/LiveSupport');
    }

    public function documentation(): Response
    {
        return Inertia::render('Help/Documentation');
    }
}
