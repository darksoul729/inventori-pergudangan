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
        h2 { color: #8e44ad; border-left: 5px solid #8e44ad; padding-left: 10px; margin-top: 30px; }
        .role-box { background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #bdc3c7; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; color: #2c3e50; }
        .status-urgent { color: #e74c3c; font-weight: bold; }
        .status-deploy { color: #27ae60; font-weight: bold; }
        .footer { margin-top: 50px; font-size: 0.9em; text-align: center; color: #7f8c8d; }
    </style>
</head>
<body>
    <h1>RUNDOWN PRIBADI - FINAL SPRINT</h1>
    <p style="text-align: center;"><strong>Nama:</strong> (Handle Mobile & Deployment) | <strong>Project:</strong> Inventori Pergudangan</p>

    <div class="role-box">
        <strong>Fokus Utama:</strong> 
        1. Android App Integration (Maps, Camera, Retrofit).<br>
        2. Production Deployment (Server Setup, Domain, SSL, CI/CD).
    </div>

    <h2>JADWAL KERJA 7 HARI (FINAL SPRINT)</h2>
    <table>
        <thead>
            <tr>
                <th>Hari</th>
                <th>Fokus Task</th>
                <th>Detail Kegiatan Teknis</th>
                <th>Prioritas</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Kamis</td>
                <td>Mobile Integration</td>
                <td>Integrasi Retrofit untuk List Shipment & Detail Order.</td>
                <td class="status-urgent">High</td>
            </tr>
            <tr>
                <td>Jumat</td>
                <td>Hardware Access</td>
                <td>Implementasi GPS Tracking & Camera API untuk Proof of Delivery (POD).</td>
                <td class="status-urgent">High</td>
            </tr>
            <tr>
                <td>Sabtu</td>
                <td>State & Sync</td>
                <td>Handling status offline/online & Sync status pengiriman ke database.</td>
                <td>Medium</td>
            </tr>
            <tr>
                <td>Senin</td>
                <td>Server Setup</td>
                <td>Konfigurasi VPS (Nginx/Apache), Database Production, & SSL.</td>
                <td class="status-deploy">Critical</td>
            </tr>
            <tr>
                <td>Selasa</td>
                <td>Deployment</td>
                <td>Git Push to Production, Migration, & Testing API Link di Android.</td>
                <td class="status-deploy">Critical</td>
            </tr>
            <tr>
                <td>Rabu</td>
                <td>Final Demo</td>
                <td>APK Build (Release), Smoke Testing di Server, & Persiapan Presentasi.</td>
                <td>Goal</td>
            </tr>
        </tbody>
    </table>

    <h2>TARGET CAPAIAN (MILESTONES)</h2>
    <ul>
        <li><strong>D-5:</strong> Driver App bisa login dan melihat list tugas pengiriman.</li>
        <li><strong>D-3:</strong> Foto bukti pengiriman (POD) terkirim sukses ke storage server.</li>
        <li><strong>D-2:</strong> Aplikasi Web & API dapat diakses melalui domain publik (HTTPS).</li>
        <li><strong>D-0:</strong> Sistem berjalan 100% stabil di environment produksi.</li>
    </ul>

    <div class="footer">
        <p>&copy; 2026 Tim Inventori Pergudangan - Mobile & Deployment Role</p>
    </div>
</body>
</html>
';

$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

$output = $dompdf->output();
file_put_contents('RUNDOWN_PRIBADI_MOBILE_DEPLOY.pdf', $output);

echo "PDF Berhasil dibuat: RUNDOWN_PRIBADI_MOBILE_DEPLOY.pdf\n";
