<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductImageResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Список всех товаров (включая неактивные) для админ-панели.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->with(['brand', 'category', 'images'])
            ->latest()
            ->paginate((int) ($request->integer('per_page') ?: 20));

        return ProductResource::collection($products);
    }

    /**
     * Создание товара.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? $this->uniqueSlug($data['name']);

        $product = Product::create($data);
        // refresh() подтягивает значения колонок по умолчанию из БД (is_active и т.п.).
        $product->refresh()->load(['brand', 'category', 'images']);

        return (new ProductResource($product))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Обновление товара.
     */
    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $product->update($request->validated());
        $product->load(['brand', 'category', 'images']);

        return new ProductResource($product);
    }

    /**
     * Удаление товара вместе с загруженными файлами изображений.
     */
    public function destroy(Product $product): JsonResponse
    {
        foreach ($product->images as $image) {
            $this->deleteImageFile($image->path);
        }

        $product->delete(); // Строки product_images удалятся каскадно (FK).

        return response()->json(['message' => 'Товар удалён.']);
    }

    /**
     * Загрузка изображения товара.
     */
    public function uploadImage(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        $path = $request->file('image')->store('products', 'public');

        // Первое изображение товара автоматически становится главным.
        $isPrimary = $request->boolean('is_primary') || $product->images()->count() === 0;

        if ($isPrimary) {
            $product->images()->update(['is_primary' => false]);
        }

        $image = $product->images()->create([
            'path' => $path,
            'is_primary' => $isPrimary,
            'sort_order' => (int) $product->images()->max('sort_order') + 1,
        ]);

        return (new ProductImageResource($image))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Удаление конкретного изображения товара.
     */
    public function deleteImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_unless($image->product_id === $product->id, 404);

        $this->deleteImageFile($image->path);
        $wasPrimary = $image->is_primary;
        $image->delete();

        // Если удалили главное — назначаем главным первое оставшееся.
        if ($wasPrimary) {
            $product->images()->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }

        return response()->json(['message' => 'Изображение удалено.']);
    }

    /**
     * Генерирует уникальный slug на основе названия.
     */
    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;

        while (Product::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    /**
     * Удаляет файл с диска, только если это локальный путь (не внешний URL).
     */
    private function deleteImageFile(string $path): void
    {
        if (! Str::startsWith($path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($path);
        }
    }
}
