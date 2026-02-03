<?php

namespace Tests\Feature;

use Tests\TestCase;

class WelcomePageTest extends TestCase
{
    public function test_welcome_page_loads_successfully(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_welcome_page_renders_inertia_component_with_expected_props(): void
    {
        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('Welcome')
            ->has('canLogin')
            ->has('canRegister')
        );
    }

    public function test_welcome_page_includes_auth_links_for_guests(): void
    {
        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('Welcome')
            ->where('canLogin', true)
            ->where('canRegister', true)
        );
    }
}
