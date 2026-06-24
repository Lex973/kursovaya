<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReviewFavoriteTest extends TestCase
{
    use RefreshDatabase;

    /** Тест-кейс 14: отзыв пересчитывает денормализованный рейтинг товара. */
    public function test_customer_can_leave_review_and_rating_is_recalculated(): void
    {
        Sanctum::actingAs($this->customer());
        $product = Product::factory()->create(['rating' => 0, 'reviews_count' => 0]);

        $this->postJson("/api/products/{$product->id}/reviews", [
            'rating' => 4,
            'comment' => 'Хороший товар',
        ])->assertCreated();

        $product->refresh();
        $this->assertSame('4.0', (string) $product->rating);
        $this->assertSame(1, $product->reviews_count);
    }

    /** Повторный отзыв обновляет существующий (один отзыв на пользователя). */
    public function test_second_review_updates_existing(): void
    {
        Sanctum::actingAs($this->customer());
        $product = Product::factory()->create();

        $this->postJson("/api/products/{$product->id}/reviews", ['rating' => 5])->assertCreated();
        $this->postJson("/api/products/{$product->id}/reviews", ['rating' => 3])->assertOk();

        $this->assertSame(1, $product->fresh()->reviews_count);
    }

    /** Тест-кейс 15: добавление и удаление избранного. */
    public function test_customer_can_add_and_remove_favorite(): void
    {
        Sanctum::actingAs($this->customer());
        $product = Product::factory()->create();

        $this->postJson('/api/favorites', ['product_id' => $product->id])->assertCreated();
        $this->getJson('/api/favorites')->assertOk()->assertJsonCount(1, 'data');

        $this->deleteJson("/api/favorites/{$product->id}")->assertOk();
        $this->getJson('/api/favorites')->assertJsonCount(0, 'data');
    }

    /** Гость не может оставить отзыв. */
    public function test_guest_cannot_leave_review(): void
    {
        $product = Product::factory()->create();

        $this->postJson("/api/products/{$product->id}/reviews", ['rating' => 5])
            ->assertUnauthorized();
    }
}
