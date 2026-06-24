<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Дерево категорий: верхний уровень + подкатегории.
     *
     * @var array<string, list<string>>
     */
    private array $tree = [
        'Парфюмерия' => ['Женская парфюмерия', 'Мужская парфюмерия', 'Нишевая парфюмерия'],
        'Макияж' => ['Лицо', 'Глаза', 'Губы'],
        'Уход за лицом' => ['Кремы', 'Сыворотки', 'Очищение'],
        'Уход за телом' => ['Гели для душа', 'Лосьоны', 'Скрабы'],
        'Волосы' => ['Шампуни', 'Бальзамы и маски', 'Стайлинг'],
    ];

    public function run(): void
    {
        $sort = 0;

        foreach ($this->tree as $parentName => $children) {
            $parent = Category::create([
                'name' => $parentName,
                'slug' => Str::slug($parentName),
                'sort_order' => $sort++,
                'is_active' => true,
            ]);

            $childSort = 0;
            foreach ($children as $childName) {
                Category::create([
                    'name' => $childName,
                    'slug' => Str::slug($childName),
                    'parent_id' => $parent->id,
                    'sort_order' => $childSort++,
                    'is_active' => true,
                ]);
            }
        }
    }
}
