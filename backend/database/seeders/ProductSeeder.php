<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Каталог товаров. Категория и бренд указываются по названию,
     * attributes — гибкие характеристики (хранятся в JSONB).
     *
     * @var list<array<string, mixed>>
     */
    private array $products = [
        // --- Парфюмерия ---
        [
            'name' => 'Chanel Coco Mademoiselle', 'category' => 'Женская парфюмерия', 'brand' => 'Chanel',
            'price' => 12990, 'old_price' => 14990, 'gender' => 'female', 'featured' => true,
            'description' => 'Восточно-цветочный аромат с нотами апельсина, жасмина и пачули. Современная классика.',
            'attributes' => ['volume_ml' => 50, 'type' => 'Eau de Parfum', 'notes' => ['Апельсин', 'Жасмин', 'Пачули', 'Бергамот']],
        ],
        [
            'name' => 'Dior Sauvage', 'category' => 'Мужская парфюмерия', 'brand' => 'Dior',
            'price' => 11490, 'old_price' => null, 'gender' => 'male', 'featured' => true,
            'description' => 'Свежий и мужественный аромат с нотами бергамота и амбры.',
            'attributes' => ['volume_ml' => 100, 'type' => 'Eau de Toilette', 'notes' => ['Бергамот', 'Амбра', 'Перец']],
        ],
        [
            'name' => 'YSL Black Opium', 'category' => 'Женская парфюмерия', 'brand' => 'Yves Saint Laurent',
            'price' => 10990, 'old_price' => 12490, 'gender' => 'female', 'featured' => true,
            'description' => 'Соблазнительный аромат с нотами кофе, ванили и белых цветов.',
            'attributes' => ['volume_ml' => 50, 'type' => 'Eau de Parfum', 'notes' => ['Кофе', 'Ваниль', 'Жасмин']],
        ],
        [
            'name' => 'Dior Miss Dior', 'category' => 'Женская парфюмерия', 'brand' => 'Dior',
            'price' => 9990, 'old_price' => null, 'gender' => 'female', 'featured' => false,
            'description' => 'Цветочный шипровый аромат, нежный и романтичный.',
            'attributes' => ['volume_ml' => 50, 'type' => 'Eau de Parfum', 'notes' => ['Роза', 'Пион', 'Мускус']],
        ],
        [
            'name' => 'Chanel Bleu de Chanel', 'category' => 'Мужская парфюмерия', 'brand' => 'Chanel',
            'price' => 13490, 'old_price' => null, 'gender' => 'male', 'featured' => false,
            'description' => 'Древесно-ароматический парфюм для уверенного мужчины.',
            'attributes' => ['volume_ml' => 100, 'type' => 'Eau de Parfum', 'notes' => ['Грейпфрут', 'Кедр', 'Ладан']],
        ],
        [
            'name' => 'Lancome La Vie Est Belle', 'category' => 'Нишевая парфюмерия', 'brand' => 'Lancome',
            'price' => 10490, 'old_price' => 11990, 'gender' => 'female', 'featured' => false,
            'description' => 'Сладкий гурманский аромат с ирисом и пачули.',
            'attributes' => ['volume_ml' => 75, 'type' => 'Eau de Parfum', 'notes' => ['Ирис', 'Пачули', 'Пралине']],
        ],

        // --- Макияж ---
        [
            'name' => 'MAC Powder Kiss Lipstick', 'category' => 'Губы', 'brand' => 'MAC',
            'price' => 2490, 'old_price' => null, 'gender' => 'female', 'featured' => true,
            'description' => 'Матовая помада с комфортной невесомой текстурой.',
            'attributes' => ['shade' => 'Mull It Over', 'finish' => 'Matte', 'type' => 'Помада'],
        ],
        [
            'name' => 'Maybelline Lash Sensational', 'category' => 'Глаза', 'brand' => 'Maybelline',
            'price' => 890, 'old_price' => 1190, 'gender' => 'female', 'featured' => false,
            'description' => 'Тушь для объёма и веера ресниц.',
            'attributes' => ['shade' => 'Чёрный', 'finish' => 'Volume', 'type' => 'Тушь'],
        ],
        [
            'name' => 'Estee Lauder Double Wear', 'category' => 'Лицо', 'brand' => 'Estee Lauder',
            'price' => 4790, 'old_price' => null, 'gender' => 'female', 'featured' => true,
            'description' => 'Стойкий тональный крем с натуральным финишем на 24 часа.',
            'attributes' => ['shade' => '1N1 Ivory Nude', 'finish' => 'Natural', 'spf' => 10, 'type' => 'Тональный крем'],
        ],
        [
            'name' => "L'Oreal Infaillible Foundation", 'category' => 'Лицо', 'brand' => "L'Oreal Paris",
            'price' => 1290, 'old_price' => 1590, 'gender' => 'female', 'featured' => false,
            'description' => 'Матирующий тональный крем долгого ношения.',
            'attributes' => ['shade' => '120 Vanilla', 'finish' => 'Matte', 'type' => 'Тональный крем'],
        ],
        [
            'name' => 'MAC Studio Fix Powder', 'category' => 'Лицо', 'brand' => 'MAC',
            'price' => 3290, 'old_price' => null, 'gender' => 'female', 'featured' => false,
            'description' => 'Компактная пудра с матовым финишем и плотным покрытием.',
            'attributes' => ['shade' => 'NC20', 'finish' => 'Matte', 'type' => 'Пудра'],
        ],
        [
            'name' => 'Maybelline The Nudes Palette', 'category' => 'Глаза', 'brand' => 'Maybelline',
            'price' => 1490, 'old_price' => null, 'gender' => 'female', 'featured' => false,
            'description' => 'Палетка из 12 нюдовых оттенков теней.',
            'attributes' => ['finish' => 'Mix', 'type' => 'Тени', 'shades_count' => 12],
        ],

        // --- Уход за лицом ---
        [
            'name' => 'Clinique Moisture Surge', 'category' => 'Кремы', 'brand' => 'Clinique',
            'price' => 3990, 'old_price' => null, 'gender' => 'unisex', 'featured' => true,
            'description' => 'Увлажняющий гель-крем для сияния кожи на 100 часов.',
            'attributes' => ['volume_ml' => 50, 'skin_type' => 'Все типы', 'purpose' => 'Увлажнение'],
        ],
        [
            'name' => 'Estee Lauder Advanced Night Repair', 'category' => 'Сыворотки', 'brand' => 'Estee Lauder',
            'price' => 7990, 'old_price' => 8990, 'gender' => 'unisex', 'featured' => true,
            'description' => 'Восстанавливающая ночная сыворотка для молодости кожи.',
            'attributes' => ['volume_ml' => 30, 'skin_type' => 'Все типы', 'purpose' => 'Антивозрастной уход'],
        ],
        [
            'name' => 'Clinique Take The Day Off', 'category' => 'Очищение', 'brand' => 'Clinique',
            'price' => 2890, 'old_price' => null, 'gender' => 'unisex', 'featured' => false,
            'description' => 'Бальзам для деликатного снятия макияжа.',
            'attributes' => ['volume_ml' => 125, 'skin_type' => 'Все типы', 'purpose' => 'Очищение'],
        ],
        [
            'name' => "L'Oreal Revitalift Serum", 'category' => 'Сыворотки', 'brand' => "L'Oreal Paris",
            'price' => 1690, 'old_price' => 1990, 'gender' => 'female', 'featured' => false,
            'description' => 'Сыворотка с гиалуроновой кислотой для упругости.',
            'attributes' => ['volume_ml' => 30, 'skin_type' => 'Зрелая', 'purpose' => 'Увлажнение и упругость'],
        ],
        [
            'name' => 'Nivea Soft Cream', 'category' => 'Кремы', 'brand' => 'Nivea',
            'price' => 390, 'old_price' => null, 'gender' => 'unisex', 'featured' => false,
            'description' => 'Универсальный увлажняющий крем для лица и тела.',
            'attributes' => ['volume_ml' => 100, 'skin_type' => 'Сухая', 'purpose' => 'Увлажнение'],
        ],

        // --- Уход за телом ---
        [
            'name' => 'Nivea Creme Soft Shower', 'category' => 'Гели для душа', 'brand' => 'Nivea',
            'price' => 320, 'old_price' => null, 'gender' => 'unisex', 'featured' => false,
            'description' => 'Кремовый гель для душа с миндальным маслом.',
            'attributes' => ['volume_ml' => 250, 'purpose' => 'Очищение и уход'],
        ],
        [
            'name' => 'Nivea Body Lotion Q10', 'category' => 'Лосьоны', 'brand' => 'Nivea',
            'price' => 590, 'old_price' => 690, 'gender' => 'female', 'featured' => false,
            'description' => 'Подтягивающий лосьон для тела с коэнзимом Q10.',
            'attributes' => ['volume_ml' => 400, 'purpose' => 'Упругость кожи'],
        ],
        [
            'name' => "L'Oreal Body Scrub Coffee", 'category' => 'Скрабы', 'brand' => "L'Oreal Paris",
            'price' => 790, 'old_price' => null, 'gender' => 'unisex', 'featured' => false,
            'description' => 'Кофейный скраб для гладкости и тонуса кожи.',
            'attributes' => ['volume_ml' => 200, 'purpose' => 'Отшелушивание'],
        ],

        // --- Волосы ---
        [
            'name' => "L'Oreal Elseve Hyaluron Shampoo", 'category' => 'Шампуни', 'brand' => "L'Oreal Paris",
            'price' => 540, 'old_price' => null, 'gender' => 'unisex', 'featured' => false,
            'description' => 'Увлажняющий шампунь с гиалуроновой кислотой.',
            'attributes' => ['volume_ml' => 400, 'hair_type' => 'Сухие'],
        ],
        [
            'name' => "L'Oreal Elseve Repair Mask", 'category' => 'Бальзамы и маски', 'brand' => "L'Oreal Paris",
            'price' => 690, 'old_price' => 820, 'gender' => 'unisex', 'featured' => false,
            'description' => 'Восстанавливающая маска для повреждённых волос.',
            'attributes' => ['volume_ml' => 300, 'hair_type' => 'Повреждённые'],
        ],
        [
            'name' => 'Nivea Hair Care Volume Shampoo', 'category' => 'Шампуни', 'brand' => 'Nivea',
            'price' => 360, 'old_price' => null, 'gender' => 'unisex', 'featured' => false,
            'description' => 'Шампунь для объёма тонких волос.',
            'attributes' => ['volume_ml' => 250, 'hair_type' => 'Тонкие'],
        ],
        [
            'name' => "L'Oreal Elnett Hairspray", 'category' => 'Стайлинг', 'brand' => "L'Oreal Paris",
            'price' => 620, 'old_price' => null, 'gender' => 'unisex', 'featured' => false,
            'description' => 'Лак для волос сильной фиксации с блеском.',
            'attributes' => ['volume_ml' => 250, 'hold' => 'Сильная'],
        ],
    ];

    public function run(): void
    {
        /** @var array<string, int> $categories name => id */
        $categories = Category::pluck('id', 'name')->all();
        /** @var array<string, int> $brands name => id */
        $brands = Brand::pluck('id', 'name')->all();

        foreach ($this->products as $i => $data) {
            $categoryId = $categories[$data['category']] ?? null;
            $brandId = $brands[$data['brand']] ?? null;

            if ($categoryId === null) {
                // Защита от опечатки в названии категории — пропускаем, но сигнализируем.
                $this->command?->warn("Категория не найдена: {$data['category']} (товар: {$data['name']})");
                continue;
            }

            $product = Product::create([
                'category_id' => $categoryId,
                'brand_id' => $brandId,
                'name' => $data['name'],
                'slug' => Str::slug($data['name']) . '-' . ($i + 1),
                'sku' => 'SKU-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                'description' => $data['description'],
                'price' => $data['price'],
                'old_price' => $data['old_price'],
                'stock' => random_int(5, 60),
                'gender' => $data['gender'],
                'attributes' => $data['attributes'],
                'is_active' => true,
                'is_featured' => $data['featured'],
            ]);

            // Два изображения-заглушки на товар (детерминированный seed по id).
            foreach ([1, 2] as $n) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => "https://picsum.photos/seed/product-{$product->id}-{$n}/600/600",
                    'is_primary' => $n === 1,
                    'sort_order' => $n - 1,
                ]);
            }
        }
    }
}
