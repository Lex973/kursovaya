<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * История заказов текущего пользователя.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()
            ->orders()
            ->with('items')
            ->latest()
            ->paginate((int) ($request->integer('per_page') ?: 15));

        return OrderResource::collection($orders);
    }

    /**
     * Оформление заказа: переносит корзину в order_items, списывает остатки,
     * очищает корзину. Всё в одной транзакции.
     *
     * @throws ValidationException
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();

        $order = DB::transaction(function () use ($user, $request) {
            // Блокируем строки корзины и товаров на время оформления.
            $cartItems = $user->cartItems()
                ->with('product')
                ->lockForUpdate()
                ->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Корзина пуста.'],
                ]);
            }

            $total = 0.0;
            $orderItems = [];

            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;

                if ($product === null || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'cart' => ['Товар недоступен и был удалён из каталога.'],
                    ]);
                }

                if ($cartItem->quantity > $product->stock) {
                    throw ValidationException::withMessages([
                        'cart' => ["«{$product->name}»: на складе только {$product->stock} шт."],
                    ]);
                }

                $total += (float) $product->price * $cartItem->quantity;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $cartItem->quantity,
                ];

                $product->decrement('stock', $cartItem->quantity);
            }

            $order = $user->orders()->create([
                'status' => Order::STATUS_PENDING,
                'total' => round($total, 2),
                'full_name' => $request->string('full_name'),
                'phone' => $request->string('phone'),
                'address' => $request->string('address'),
                'comment' => $request->input('comment'),
            ]);

            $order->items()->createMany($orderItems);
            $user->cartItems()->delete();

            return $order;
        });

        $order->load('items.product');

        return (new OrderResource($order))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Детали конкретного заказа пользователя.
     */
    public function show(Request $request, Order $order): OrderResource
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->load('items.product');

        return new OrderResource($order);
    }
}
