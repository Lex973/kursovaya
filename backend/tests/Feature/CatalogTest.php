<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    /** Тест-кейс 6: список товаров отдаёт только активные. */
    public function test_products_list_returns_only_active(): void
    {
        Product::factory()->count(3)->create();
        Product::factory()->inactive()->create(['name' => 'Скрытый товар']);

        $response = $this->getJson('/api/products')->assertOk();

        $this->assertSame(3, $response->json('meta.total'));
    }

    /** Тест-кейс 7: фильтрация товаров по бренду. */
    public function test_products_can_be_filtered_by_brand(): void
    {
        $brand = Brand::factory()->create(['slug' => 'chanel']);
        Product::factory()->count(2)->create(['brand_id' => $brand->id]);
        Product::factory()->count(3)->create(); // другие бренды

        $response = $this->getJson('/api/products?brand=chanel')->assertOk();

        $this->assertSame(2, $response->json('meta.total'));
    }

    /** Тест-кейс 8: поиск по названию товара. */
    public function test_products_search_by_name(): void
    {
        Product::factory()->create(['name' => 'Chanel Coco Mademoiselle']);
        Product::factory()->create(['name' => 'Dior Sauvage']);

        $response = $this->getJson('/api/products?q=coco')->assertOk();

        $this->assertSame(1, $response->json('meta.total'));
        $this->assertSame('Chanel Coco Mademoiselle', $response->json('data.0.name'));
    }

    /** Тест-кейс 9: карточка товара по slug. */
    public function test_product_detail_by_slug(): void
    {
        $product = Product::factory()->create(['slug' => 'test-product']);

        $this->getJson('/api/products/test-product')
            ->assertOk()
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonStructure(['data' => ['id', 'name', 'price', 'images', 'reviews']]);
    }

    /** Несуществующий товар возвращает 404. */
    public function test_unknown_product_returns_404(): void
    {
        $this->getJson('/api/products/no-such-slug')->assertNotFound();
    }
}
