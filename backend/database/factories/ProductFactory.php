<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'name' => Str::ucfirst($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 1000000),
            'sku' => 'SKU-'.fake()->unique()->numberBetween(1000, 999999),
            'description' => fake()->sentence(),
            'price' => fake()->numberBetween(500, 15000),
            'old_price' => null,
            'stock' => fake()->numberBetween(1, 50),
            'gender' => fake()->randomElement(['male', 'female', 'unisex']),
            'attributes' => ['volume_ml' => 50],
            'rating' => 0,
            'reviews_count' => 0,
            'is_active' => true,
            'is_featured' => false,
        ];
    }

    /** Товара нет в наличии. */
    public function outOfStock(): static
    {
        return $this->state(fn () => ['stock' => 0]);
    }

    /** Скрытый (неопубликованный) товар. */
    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
