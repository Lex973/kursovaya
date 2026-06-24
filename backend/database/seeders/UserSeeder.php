<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Администратор',
            'email' => 'admin@shop.test',
            'password' => Hash::make('password'),
            'role' => User::ROLE_ADMIN,
            'phone' => '+7 (900) 000-00-01',
        ]);

        User::create([
            'name' => 'Иван Покупатель',
            'email' => 'customer@shop.test',
            'password' => Hash::make('password'),
            'role' => User::ROLE_CUSTOMER,
            'phone' => '+7 (900) 000-00-02',
        ]);

        User::create([
            'name' => 'Мария Иванова',
            'email' => 'maria@shop.test',
            'password' => Hash::make('password'),
            'role' => User::ROLE_CUSTOMER,
            'phone' => '+7 (900) 000-00-03',
        ]);
    }
}
