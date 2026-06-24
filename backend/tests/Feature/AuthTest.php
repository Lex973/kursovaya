<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /** Тест-кейс 1: регистрация нового пользователя выдаёт токен. */
    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Новый Покупатель',
            'email' => 'new@shop.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'email', 'role'], 'token'])
            ->assertJsonPath('user.role', User::ROLE_CUSTOMER);

        $this->assertDatabaseHas('users', ['email' => 'new@shop.test']);
    }

    /** Тест-кейс 2: вход по корректным учётным данным. */
    public function test_user_can_login(): void
    {
        $this->customer(['email' => 'c@shop.test']);

        $this->postJson('/api/auth/login', [
            'email' => 'c@shop.test',
            'password' => 'password',
        ])->assertOk()->assertJsonStructure(['user', 'token']);
    }

    /** Тест-кейс 3: вход с неверным паролем отклоняется. */
    public function test_login_fails_with_wrong_password(): void
    {
        $this->customer(['email' => 'c@shop.test']);

        $this->postJson('/api/auth/login', [
            'email' => 'c@shop.test',
            'password' => 'wrong-password',
        ])->assertStatus(422);
    }

    /** Тест-кейс 4: текущий пользователь доступен по токену. */
    public function test_authenticated_user_can_fetch_profile(): void
    {
        Sanctum::actingAs($this->customer(['email' => 'me@shop.test']));

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'me@shop.test');
    }

    /** Тест-кейс 5: обновление имени, телефона и пароля. */
    public function test_user_can_update_profile_and_password(): void
    {
        $user = $this->customer();
        Sanctum::actingAs($user);

        $this->patchJson('/api/auth/profile', [
            'name' => 'Изменённое Имя',
            'phone' => '+79991112233',
            'current_password' => 'password',
            'password' => 'newpassword1',
            'password_confirmation' => 'newpassword1',
        ])->assertOk()->assertJsonPath('user.name', 'Изменённое Имя');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'phone' => '+79991112233',
        ]);

        // Новый пароль действительно работает.
        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'newpassword1',
        ])->assertOk();
    }

    /** Смена пароля с неверным текущим паролем запрещена. */
    public function test_password_change_requires_correct_current_password(): void
    {
        Sanctum::actingAs($this->customer());

        $this->patchJson('/api/auth/profile', [
            'current_password' => 'definitely-wrong',
            'password' => 'newpassword1',
            'password_confirmation' => 'newpassword1',
        ])->assertStatus(422);
    }
}
