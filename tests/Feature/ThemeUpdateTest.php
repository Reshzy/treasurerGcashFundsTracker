<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ThemeUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_theme_preference(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patchJson(route('profile.theme.update'), [
            'theme' => 'dark',
        ]);

        $response->assertOk();
        $response->assertJson(['theme' => 'dark']);

        $user->refresh();
        $this->assertSame('dark', $user->theme_preference);
    }

    public function test_theme_preference_accepts_light_dark_and_system(): void
    {
        $user = User::factory()->create();

        foreach (['light', 'dark', 'system'] as $theme) {
            $response = $this->actingAs($user)->patchJson(route('profile.theme.update'), [
                'theme' => $theme,
            ]);

            $response->assertOk();
            $user->refresh();
            $this->assertSame($theme, $user->theme_preference);
        }
    }

    public function test_theme_update_rejects_invalid_values(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patchJson(route('profile.theme.update'), [
            'theme' => 'invalid',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('theme');
    }

    public function test_guest_cannot_update_theme(): void
    {
        $response = $this->patchJson(route('profile.theme.update'), [
            'theme' => 'dark',
        ]);

        $response->assertUnauthorized();
    }
}
