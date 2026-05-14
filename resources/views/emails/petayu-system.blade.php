<!doctype html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectLine }}</title>
    <style>
        @media only screen and (max-width: 640px) {
            .mail-wrap { padding: 14px !important; }
            .mail-card { border-radius: 12px !important; }
            .mail-body { padding: 20px 16px !important; }
            .mail-title { font-size: 34px !important; }
            .mail-line { font-size: 17px !important; }
            .otp-box { padding: 16px 10px !important; }
            .otp-code { font-size: 42px !important; letter-spacing: .2em !important; }
            .sign-name { font-size: 26px !important; }
            .mail-footer { padding: 14px 16px !important; }
            .clean-wrap { padding: 6px !important; }
            .clean-card { border-radius: 10px !important; width: 100% !important; max-width: 100% !important; }
            .clean-header { padding: 14px 14px !important; }
            .clean-body { padding: 16px 14px !important; }
            .clean-title { font-size: 30px !important; line-height: 1.2 !important; }
            .clean-line { font-size: 15px !important; line-height: 1.5 !important; }
            .clean-meta td { padding: 10px 10px !important; font-size: 12px !important; }
            .clean-footer { padding: 12px 14px !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#1e293b;">
@php
    $otpCode = $meta['Kode OTP'] ?? null;
    $metaEntries = collect($meta)->reject(fn($_, $label) => $label === 'Kode OTP');
    $logoUrl = asset('images/logo_petayu.png');
    $isCleanStyle = ($templateStyle ?? 'default') === 'clean';
@endphp
@if($isCleanStyle)
<table class="clean-wrap" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;padding:20px 8px;font-family:'Google Sans',Roboto,Arial,Helvetica,sans-serif;">
    <tr>
        <td align="center">
            <table class="clean-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;">
                {{-- Logo --}}
                <tr>
                    <td class="clean-header" style="padding:24px 32px 16px;">
                        <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="width:36px;vertical-align:middle;">
                                    <img src="{{ $logoUrl }}" alt="Petayu" width="32" height="32" style="display:block;border-radius:6px;">
                                </td>
                                <td style="padding-left:10px;vertical-align:middle;">
                                    <span style="font-size:16px;font-weight:700;color:#202124;">Petayu WMS</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                {{-- Divider --}}
                <tr><td style="padding:0 32px;"><div style="border-top:1px solid #e8eaed;"></div></td></tr>
                {{-- Body --}}
                <tr>
                    <td class="clean-body" style="padding:32px 32px 24px;">
                        @foreach($lines as $line)
                            <p class="clean-line" style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#3c4043;">{{ $line }}</p>
                        @endforeach

                        @if(!empty($otpCode))
                            <div style="margin:24px 0;padding:24px;background:#f8f9fa;border:1px solid #dadce0;border-radius:8px;text-align:center;">
                                <div style="font-size:12px;color:#5f6368;letter-spacing:.05em;margin-bottom:8px;font-weight:500;">KODE VERIFIKASI</div>
                                <div class="otp-code" style="font-size:36px;letter-spacing:.3em;font-weight:700;color:#202124;font-family:'Google Sans',Roboto,monospace;">{{ $otpCode }}</div>
                            </div>
                            <p style="margin:0 0 16px;font-size:12px;color:#5f6368;">Kode ini berlaku untuk satu kali penggunaan. Jangan bagikan kode ini kepada siapa pun termasuk pihak yang mengaku dari Petayu.</p>
                        @endif

                        @if($metaEntries->isNotEmpty())
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;border-top:1px solid #e8eaed;">
                                @foreach($metaEntries as $label => $value)
                                    <tr>
                                        <td style="padding:10px 0;font-size:12px;color:#5f6368;width:40%;border-bottom:1px solid #f1f3f4;">{{ $label }}</td>
                                        <td style="padding:10px 0;font-size:13px;font-weight:600;color:#202124;border-bottom:1px solid #f1f3f4;">{{ $value }}</td>
                                    </tr>
                                @endforeach
                            </table>
                        @endif

                        @if($ctaLabel && $ctaUrl)
                            <p style="margin:24px 0 0;">
                                <a href="{{ $ctaUrl }}" style="display:inline-block;background:#1a73e8;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;padding:10px 24px;border-radius:4px;">{{ $ctaLabel }}</a>
                            </p>
                        @endif
                    </td>
                </tr>
                {{-- Footer --}}
                <tr><td style="padding:0 32px;"><div style="border-top:1px solid #e8eaed;"></div></td></tr>
                <tr>
                    <td class="clean-footer" style="padding:16px 32px 24px;">
                        <p style="margin:0 0 4px;font-size:12px;color:#5f6368;">Email ini dikirim oleh Petayu WMS untuk memverifikasi identitas Anda.</p>
                        <p style="margin:0;font-size:11px;color:#80868b;">© {{ date('Y') }} Petayu WMS • Smart Storage, Smooth Flow</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
@else
<table class="mail-wrap" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f7;padding:30px 14px;">
    <tr>
        <td align="center">
            <table class="mail-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;background:#ffffff;border:1px solid #dbe3ef;border-radius:16px;overflow:hidden;box-shadow:0 14px 34px rgba(15,23,42,.12);">
                <tr>
                    <td style="background:#5b3cc4;padding:20px 24px;border-bottom:4px solid #4a31a9;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="width:56px;vertical-align:middle;">
                                    <img src="{{ $logoUrl }}" alt="Petayu WMS" width="46" height="46" style="display:block;border:0;outline:none;text-decoration:none;border-radius:10px;">
                                </td>
                                <td style="vertical-align:middle;">
                                    <div style="font-size:20px;line-height:1.2;font-weight:800;color:#ffffff;letter-spacing:.4px;">PETAYU WMS</div>
                                    <div style="margin-top:4px;font-size:12px;color:#c6d4f5;">Smart Warehouse Management System</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="mail-body" style="padding:34px 42px 24px;">
                        <h1 class="mail-title" style="margin:0 0 18px;font-size:48px;line-height:1.1;color:#0f2a60;font-weight:800;letter-spacing:.2px;">{{ $heading }}</h1>
                        @foreach($lines as $line)
                            <p class="mail-line" style="margin:0 0 14px;font-size:20px;line-height:1.55;color:#1f2937;">{{ $line }}</p>
                        @endforeach

                        @if(!empty($otpCode))
                            <div class="otp-box" style="margin:28px 0;padding:22px 14px;border:1px solid #b9d3ff;background:#f3f7ff;border-radius:18px;text-align:center;">
                                <div style="font-size:14px;color:#1457c8;letter-spacing:.08em;margin-bottom:12px;font-weight:700;">KODE OTP VERIFIKASI</div>
                                <div class="otp-code" style="font-size:74px;letter-spacing:.32em;font-weight:800;color:#102c64;line-height:1;">{{ $otpCode }}</div>
                            </div>
                        @endif

                        @if($metaEntries->isNotEmpty())
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border:1px solid #e2e8f0;border-radius:14px;background:#ffffff;">
                                @foreach($metaEntries as $label => $value)
                                    <tr>
                                        <td style="padding:16px 16px;font-size:14px;color:#475569;width:38%;border-bottom:1px solid #edf2f7;">{{ $label }}</td>
                                        <td style="padding:16px 16px;font-size:15px;font-weight:700;color:#0f172a;border-bottom:1px solid #edf2f7;">{{ $value }}</td>
                                    </tr>
                                @endforeach
                            </table>
                        @endif

                        @if($ctaLabel && $ctaUrl)
                            <p style="margin:20px 0 6px;">
                                <a href="{{ $ctaUrl }}" style="display:inline-block;background:#2f5fc6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:12px 18px;border-radius:10px;">{{ $ctaLabel }}</a>
                            </p>
                        @endif

                        @if($showSecurityWarning || !empty($otpCode))
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0 6px;border:1px solid #f4d9a6;border-radius:14px;background:#fff9ec;">
                                <tr>
                                    <td style="padding:15px 16px;font-size:15px;line-height:1.65;color:#5b450f;">
                                        Jika Anda tidak melakukan permintaan ini, Anda dapat mengabaikan email ini. Jangan pernah membagikan kode OTP ini kepada siapa pun.
                                    </td>
                                </tr>
                            </table>
                        @endif

                        <div style="margin-top:28px;padding-top:18px;border-top:1px solid #e2e8f0;">
                            <p style="margin:0 0 6px;font-size:15px;color:#334155;">Hormat kami,</p>
                            <p class="sign-name" style="margin:0;font-size:34px;line-height:1.1;color:#0f2a60;font-weight:800;">Tim Petayu WMS</p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="mail-footer" style="padding:16px 42px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">
                            Email ini dikirim otomatis oleh sistem Petayu WMS. Mohon tidak membalas email ini.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
@endif
