<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    /** @var list<string> */
    private array $brands = [
        'Chanel',
        'Dior',
        'Yves Saint Laurent',
        'Lancome',
        'Estee Lauder',
        'Clinique',
        'MAC',
        'Maybelline',
        "L'Oreal Paris",
        'Nivea',
    ];

    public function run(): void
    {
        foreach ($this->brands as $name) {
            Brand::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'is_active' => true,
            ]);
        }
    }
}
