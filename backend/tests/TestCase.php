<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Создаёт пользователя-покупателя.
     *
     * @param  array<string, mixed>  $attributes
     */
    protected function customer(array $attributes = []): User
    {
        return User::factory()->create(['role' => User::ROLE_CUSTOMER] + $attributes);
    }

    /**
     * Создаёт пользователя-администратора.
     *
     * @param  array<string, mixed>  $attributes
     */
    protected function admin(array $attributes = []): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN] + $attributes);
    }
}
