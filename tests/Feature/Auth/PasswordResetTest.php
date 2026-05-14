<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_reset_password_link_can_be_requested(): void
    {
        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertRedirect(route('password.otp', ['email' => $user->email], false))
            ->assertSessionHas('status', 'password-otp-sent');
    }

    public function test_reset_password_screen_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);
        $this->get(route('password.otp', ['email' => $user->email], false))
            ->assertOk();
    }

    public function test_password_can_be_reset_with_valid_otp_session_token(): void
    {
        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        $resetToken = 'test-reset-session-token';
        Cache::put('password_reset_session:' . sha1(strtolower(trim($user->email))), $resetToken, now()->addMinutes(10));

        $this->post('/reset-password', [
            'email' => $user->email,
            'reset_session_token' => $resetToken,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login', absolute: false));
    }
}
