<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /** @var list<string> */
    private array $comments = [
        'Отличный товар, полностью соответствует описанию!',
        'Пользуюсь уже месяц — очень довольна результатом.',
        'Хорошее соотношение цены и качества.',
        'Аромат стойкий, держится весь день.',
        'Неплохо, но ожидала большего.',
        'Заказываю повторно, рекомендую.',
    ];

    public function run(): void
    {
        $customers = User::where('role', User::ROLE_CUSTOMER)->get();
        if ($customers->isEmpty()) {
            return;
        }

        // Отзывы примерно на каждый второй товар, чтобы данные выглядели реалистично.
        Product::query()->each(function (Product $product) use ($customers) {
            if ($product->id % 2 !== 0) {
                return;
            }

            foreach ($customers as $index => $customer) {
                // Не каждый покупатель оставляет отзыв на каждый товар.
                if (($product->id + $index) % 3 === 0) {
                    continue;
                }

                Review::create([
                    'user_id' => $customer->id,
                    'product_id' => $product->id,
                    'rating' => random_int(4, 5),
                    'comment' => $this->comments[array_rand($this->comments)],
                ]);
            }

            $product->recalculateRating();
        });
    }
}
