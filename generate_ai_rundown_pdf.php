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
        h2 { color: #16a085; border-left: 5px solid #16a085; padding-left: 10px; margin-top: 30px; }
        .tech-stack { background-color: #f4f7f6; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px dashed #16a085; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #bdc3c7; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; color: #2c3e50; }
        .status-ai { color: #2980b9; font-weight: bold; }
        .status-fe { color: #d35400; font-weight: bold; }
        .footer { margin-top: 50px; font-size: 0.8em; text-align: center; color: #7f8c8d; }
    </style>
</head>
<body>
    <h1>RUNDOWN IMPLEMENTASI AI GROQ<br>INVENTORI PERGUDANGAN</h1>
    <p style="text-align: center;"><strong>Target:</strong> AI Smart Assistant (Stock Analysis & Auto-Reporting)</p>

    <div class="tech-stack">
        <strong>Spesifikasi Teknis:</strong><br>
        - Backend: Groq AI API via Laravel Service.<br>
        - Frontend: React (Inertia.js) - AI Chat Bubble / Dashboard Insight Card.
    </div>

    <h2>JADWAL IMPLEMENTASI (1 MINGGU)</h2>
    <table>
        <thead>
            <tr>
                <th>Hari</th>
                <th>Fokus Backend (AI)</th>
                <th>Fokus Frontend (UI)</th>
                <th>Output</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Kamis</td>
                <td>API Key Setup & Groq Service di Laravel.</td>
                <td>Design Chat Component & AI Icon di Sidebar.</td>
                <td class="status-ai">Koneksi API</td>
            </tr>
            <tr>
                <td>Jumat</td>
                <td>Prompt Engineering (Analisis Stok & Prediksi Restock).</td>
                <td>Integrasi Chat UI ke Backend (Loading State).</td>
                <td class="status-ai">Data Sync</td>
            </tr>
            <tr>
                <td>Sabtu</td>
                <td>Implementasi Context Data (Gudang, Produk, Supplier) ke AI.</td>
                <td>Visualisasi Hasil AI (Formatting Markdown ke HTML).</td>
                <td class="status-fe">UI Insight</td>
            </tr>
            <tr>
                <td>Senin</td>
                <td>Fitur Export "AI Recommendation" ke PDF/Excel.</td>
                <td>AI Widget di Dashboard Utama (Summary Report).</td>
                <td class="status-ai">Report AI</td>
            </tr>
            <tr>
                <td>Selasa</td>
                <td>Optimasi Kecepatan Respon & Caching AI Response.</td>
                <td>Handling Error State (Rate Limit Groq).</td>
                <td class="status-fe">QA UI/UX</td>
            </tr>
            <tr>
                <td>Rabu</td>
                <td>Final Testing & Penyesuaian Response AI dengan Data Riil.</td>
                <td>Polishing Animasi "AI is thinking...".</td>
                <td>Ready</td>
            </tr>
        </tbody>
    </table>

    <h2>FITUR UTAMA AI GROQ</h2>
    <ul>
        <li><strong>Smart Stock Analysis:</strong> Bertanya "Barang apa yang paling cepat habis bulan ini?".</li>
        <li><strong>Auto Recommendation:</strong> AI menyarankan jumlah restock berdasarkan histori PO.</li>
        <li><strong>Supplier Performance Audit:</strong> Analisis otomatis performa supplier melalui chat.</li>
    </ul>

    <div class="footer">
        <p>&copy; 2026 Tim Inventori Pergudangan - AI Implementation Sprint</p>
    </div>
</body>
</html>
';

$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

$output = $dompdf->output();
file_put_contents('RUNDOWN_IMPLEMENTASI_AI_GROQ.pdf', $output);

echo "PDF Berhasil dibuat: RUNDOWN_IMPLEMENTASI_AI_GROQ.pdf\n";
