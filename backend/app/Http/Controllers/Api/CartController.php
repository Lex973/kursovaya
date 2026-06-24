<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    /**
     * Корзина текущего пользователя.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $items = $request->user()
            ->cartItems()
            ->with(['product.brand', 'product.images'])
            ->latest()
            ->get();

        return CartItemResource::collection($items);
    }

    /**
     * Добавить товар в корзину. Если товар уже есть — увеличить количество.
     *
     * @throws ValidationException
     */
    public function store(AddToCartRequest $request): JsonResponse
    {
        $product = Product::active()->findOrFail($request->integer('product_id'));
        $quantity = (int) ($request->integer('quantity') ?: 1);

        $item = $request->user()->cartItems()->firstOrNew(['product_id' => $product->id]);
        $newQuantity = ($item->quantity ?? 0) + $quantity;

        $this->assertStock($product, $newQuantity);

        $item->quantity = $newQuantity;
        $item->save();

        $item->load(['product.brand', 'product.images']);

        return (new CartItemResource($item))
            ->response()
            ->setStatusCode($item->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Изменить количество позиции в корзине.
     *
     * @throws ValidationException
     */
    public function update(UpdateCartItemRequest $request, CartItem $item): CartItemResource
    {
        $this->authorizeItem($request, $item);

        $item->load('product');
        $this->assertStock($item->product, $request->integer('quantity'));

        $item->update(['quantity' => $request->integer('quantity')]);
        $item->load(['product.brand', 'product.images']);

        return new CartItemResource($item);
    }

    /**
     * Удалить позицию из корзины.
     */
    public function destroy(Request $request, CartItem $item): JsonResponse
    {
        $this->authorizeItem($request, $item);
        $item->delete();

        return response()->json(['message' => 'Товар удалён из корзины.']);
    }

    /**
     * Полностью очистить корзину.
     */
    public function clear(Request $request): JsonResponse
    {
        $request->user()->cartItems()->delete();

        return response()->json(['message' => 'Корзина очищена.']);
    }

    /**
     * Позиция должна принадлежать текущему пользователю.
     */
    private function authorizeItem(Request $request, CartItem $item): void
    {
        abort_unless($item->user_id === $request->user()->id, 403);
    }

    /**
     * Проверяет, что запрашиваемое количество не превышает остаток на складе.
     *
     * @throws ValidationException
     */
    private function assertStock(Product $product, int $quantity): void
    {
        if ($quantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => ["На складе доступно только {$product->stock} шт."],
            ]);
        }
    }
}
