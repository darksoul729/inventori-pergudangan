<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class PetayuSystemMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $subjectLine,
        public string $heading,
        public array $lines = [],
        public ?string $ctaLabel = null,
        public ?string $ctaUrl = null,
        public array $meta = [],
        public array $attachmentsData = [],
        public bool $showSecurityWarning = false,
        public string $templateStyle = 'clean',
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.petayu-system',
        );
    }

    public function attachments(): array
    {
        return collect($this->attachmentsData)->map(function (array $attachment) {
            $rawData = (string) ($attachment['data'] ?? '');
            if (!empty($attachment['is_base64'])) {
                $decoded = base64_decode($rawData, true);
                $rawData = $decoded !== false ? $decoded : '';
            }

            return Attachment::fromData(
                fn () => $rawData,
                (string) ($attachment['name'] ?? 'lampiran.pdf')
            )->withMime((string) ($attachment['mime'] ?? 'application/octet-stream'));
        })->all();
    }
}
