<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartOrderTest extends TestCase
{
    use RefreshDatabase;

    /** Тест-кейс 10: покупатель добавляет товар в корзину. */
    public function test_customer_can_add_to_cart(): void
    {
        Sanctum::actingAs($this->customer());
        $product = Product::factory()->create(['stock' => 10]);

        $this->postJson('/api/cart', ['product_id' => $product->id, 'quantity' => 2])
            ->assertCreated()
            ->assertJsonPath('data.quantity', 2);

        $this->getJson('/api/cart')->assertOk()->assertJsonCount(1, 'data');
    }

    /** Тест-кейс 11: количество в корзине не может превышать остаток. */
    public function test_cart_rejects_quantity_over_stock(): void
    {
        Sanctum::actingAs($this->customer());
        $product = Product::factory()->create(['stock' => 3]);

        $this->postJson('/api/cart', ['product_id' => $product->id, 'quantity' => 5])
            ->assertStatus(422);
    }

    /** Тест-кейс 12: оформление заказа создаёт заказ, списывает остаток и чистит корзину. */
    public function test_checkout_creates_order_decrements_stock_and_clears_cart(): void
    {
        $user = $this->customer();
        Sanctum::actingAs($user);
        $product = Product::factory()->create(['price' => 1000, 'stock' => 5]);

        $this->postJson('/api/cart', ['product_id' => $product->id, 'quantity' => 2])->assertCreated();

        $response = $this->postJson('/api/orders', [
            'full_name' => 'Иван Тестов',
            'phone' => '+79990001122',
            'address' => 'Москва, ул. Тестовая, 1',
        ])->assertCreated();

        $response->assertJsonPath('data.total', 2000)
            ->assertJsonPath('data.status', Order::STATUS_PENDING);

        // Остаток уменьшился, корзина пуста.
        $this->assertSame(3, $product->fresh()->stock);
        $this->getJson('/api/cart')->assertJsonCount(0, 'data');
        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'total' => 2000]);
    }

    /** Оформление пустой корзины запрещено. */
    public function test_checkout_with_empty_cart_fails(): void
    {
        Sanctum::actingAs($this->customer());

        $this->postJson('/api/orders', [
            'full_name' => 'Иван',
            'phone' => '1',
            'address' => 'Адрес',
        ])->assertStatus(422);
    }

    /** Тест-кейс 13: заказы видны только их владельцу. */
    public function test_orders_are_scoped_to_their_owner(): void
    {
        $owner = $this->customer();
        $other = $this->customer();

        $order = Order::create([
            'user_id' => $owner->id,
            'status' => Order::STATUS_PENDING,
            'total' => 1000,
            'full_name' => 'Владелец',
            'phone' => '1',
            'address' => 'Адрес',
        ]);

        Sanctum::actingAs($other);
        $this->getJson("/api/orders/{$order->id}")->assertForbidden();

        Sanctum::actingAs($owner);
        $this->getJson("/api/orders/{$order->id}")->assertOk();
    }
}
