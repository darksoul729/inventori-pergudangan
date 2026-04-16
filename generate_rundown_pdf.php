<?php

require 'vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

$options = new Options();
$options->set('isHtml5ParserEnabled', true);
$options->set('isRemoteEnabled', true);

$dompdf = new Dompdf($options);

$html = '
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 40px; }
        h1 { text-align: center; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; }
        h2 { color: #2980b9; border-left: 5px solid #2980b9; padding-left: 10px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #bdc3c7; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; color: #2c3e50; }
        .status-urgent { color: #e74c3c; font-weight: bold; }
        .status-progress { color: #f39c12; font-weight: bold; }
        .footer { margin-top: 50px; font-size: 0.9em; text-align: center; color: #7f8c8d; }
        .milestone { background-color: #ecf0f1; padding: 10px; border-radius: 5px; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>RUNDOWN FINAL SPRINT<br>INVENTORI PERGUDANGAN</h1>
    <p style="text-align: center;"><strong>Update:</strong> Rabu, 15 April 2026 | <strong>Progress Kelompok:</strong> 1.5 Minggu</p>

    <h2>1. RUNDOWN UTAMA (KELOMPOK)</h2>
    <table>
        <thead>
            <tr>
                <th>Hari</th>
                <th>Target Utama</th>
                <th>Kegiatan Teknis</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Kamis</td>
                <td>Mobile Sync</td>
                <td>Integrasi Driver App ke API Shipment & Map Tracking.</td>
                <td class="status-urgent">Urgent</td>
            </tr>
            <tr>
                <td>Jumat</td>
                <td>Admin Monitoring</td>
                <td>Implementasi Dashboard React (Live Driver Location).</td>
                <td class="status-progress">On Progress</td>
            </tr>
            <tr>
                <td>Sabtu</td>
                <td>Inventory Closing</td>
                <td>Finalisasi Stock Opname & Auto-adjustment.</td>
                <td>Planned</td>
            </tr>
            <tr>
                <td>Senin</td>
                <td>Stress Test</td>
                <td>Simulasi transaksi massal & Bulk Goods Receipt.</td>
                <td class="status-urgent">Critical</td>
            </tr>
            <tr>
                <td>Selasa</td>
                <td>Final Debugging</td>
                <td>Fixing validasi foto POD & Push Notification.</td>
                <td>Planned</td>
            </tr>
            <tr>
                <td>Rabu</td>
                <td>Submission</td>
                <td>Video Demo, Dokumentasi & Final Export.</td>
                <td>Goal</td>
            </tr>
        </tbody>
    </table>

    <h2>2. RUNDOWN PRIBADI (FULLSTACK DEVELOPER)</h2>
    <ul>
        <li><strong>Kamis:</strong> Selesaikan API <code>POST /shipments/{id}/complete</code> (POD Photo Upload).</li>
        <li><strong>Jumat:</strong> Filter Laporan Dashboard (Warehouse, Category, Supplier Performance).</li>
        <li><strong>Sabtu:</strong> Sinkronisasi <code>RackStock</code> Logic (Status: Picked Up).</li>
        <li><strong>Senin:</strong> Security Audit (Sanctum) & Transactional Integrity Check.</li>
        <li><strong>Selasa:</strong> Seeding Demo Data (Realistis untuk visualisasi grafik).</li>
        <li><strong>Rabu:</strong> Final Check Hosting, README, & Project Presentation.</li>
    </ul>

    <div class="footer">
        <p>&copy; 2026 Tim Inventori Pergudangan - Final Project Sprint</p>
    </div>
</body>
</html>
';

$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

$output = $dompdf->output();
file_put_contents('RUNDOWN_KELOMPOK_FINAL.pdf', $output);

echo "PDF Berhasil dibuat: RUNDOWN_KELOMPOK_FINAL.pdf\n";
