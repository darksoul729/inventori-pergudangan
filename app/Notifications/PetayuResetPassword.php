<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class PetayuResetPassword extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $otpUrl = url(route('password.otp', [
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject('Reset password akun Petayu WMS')
            ->greeting('Halo ' . ($notifiable->name ?? 'Pengguna') . ',')
            ->line('Kami menerima permintaan reset password untuk akun Anda.')
            ->action('Lanjutkan Reset Password', $otpUrl)
            ->line('Reset password dilakukan dengan kode OTP 6 digit yang dikirim ke email ini.')
            ->line('Jika Anda tidak meminta reset password, abaikan email ini.');
    }
}
