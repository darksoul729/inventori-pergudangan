<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;

class PetayuVerifyEmail extends VerifyEmail
{
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);
        $sentAtWita = Carbon::now('Asia/Makassar')->format('d M Y H:i') . ' WITA';

        return (new MailMessage)
            ->subject('Verifikasi email Petayu WMS • ' . $sentAtWita)
            ->greeting('Halo ' . ($notifiable->name ?? 'Tim Gudang') . ',')
            ->line('Akun trial kamu sudah dibuat. Tinggal verifikasi email untuk aktivasi.')
            ->line('Waktu kirim: ' . $sentAtWita)
            ->action('Verifikasi Email Sekarang', $verificationUrl)
            ->line('Jika tombol tidak bisa diklik, salin link ini ke browser:')
            ->line($verificationUrl)
            ->line('Link verifikasi akan kedaluwarsa sesuai kebijakan keamanan sistem.');
    }
}
