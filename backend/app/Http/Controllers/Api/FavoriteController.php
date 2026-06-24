<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FavoriteController extends Controller
{
    /**
     * Избранные товары текущего пользователя.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = $request->user()
            ->favorites()
            ->with(['product.brand', 'product.category', 'product.images'])
            ->latest()
            ->get()
            ->pluck('product')
            ->filter() // на случай, если товар удалён из каталога
            ->values();

        return ProductResource::collection($products);
    }

    /**
     * Добавить товар в избранное (идемпотентно).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $request->user()->favorites()->firstOrCreate([
            'product_id' => $validated['product_id'],
        ]);

        return response()->json(['message' => 'Добавлено в избранное.'], 201);
    }

    /**
     * Убрать товар из избранного.
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $request->user()->favorites()->where('product_id', $product->id)->delete();

        return response()->json(['message' => 'Удалено из избранного.']);
    }
}
