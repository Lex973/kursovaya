<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\ListProductsRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Список товаров с фильтрами, сортировкой и пагинацией.
     */
    public function index(ListProductsRequest $request): AnonymousResourceCollection
    {
        $query = Product::query()
            ->active()
            ->with(['brand', 'category', 'images']);

        $this->applyFilters($query, $request);
        $this->applySort($query, $request->string('sort')->value());

        $perPage = (int) ($request->integer('per_page') ?: 12);

        return ProductResource::collection(
            $query->paginate($perPage)->withQueryString()
        );
    }

    /**
     * Карточка товара по slug — с изображениями, брендом, категорией и отзывами.
     */
    public function show(string $slug): ProductResource
    {
        $product = Product::query()
            ->active()
            ->with([
                'brand',
                'category',
                'images',
                'reviews' => fn ($query) => $query->with('user')->latest(),
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        return new ProductResource($product);
    }

    /**
     * @param  Builder<Product>  $query
     */
    private function applyFilters(Builder $query, ListProductsRequest $request): void
    {
        if ($search = $request->string('q')->trim()->value()) {
            $escaped = addcslashes($search, '%_\\');
            $query->where(function (Builder $q) use ($escaped) {
                $q->where('name', 'ilike', "%{$escaped}%")
                    ->orWhere('description', 'ilike', "%{$escaped}%");
            });
        }

        // Категория по slug: учитываем и саму категорию, и её подкатегории.
        if ($categorySlug = $request->string('category')->value()) {
            $category = Category::where('slug', $categorySlug)->first();
            if ($category) {
                $ids = $category->children()->pluck('id')->push($category->id);
                $query->whereIn('category_id', $ids);
            } else {
                // Несуществующая категория — пустой результат, а не весь каталог.
                $query->whereRaw('1 = 0');
            }
        }

        // Бренды по slug (можно несколько через запятую).
        if ($brandParam = $request->string('brand')->value()) {
            $slugs = $this->splitCsv($brandParam);
            $query->whereHas('brand', fn (Builder $q) => $q->whereIn('slug', $slugs));
        }

        // Пол (можно несколько через запятую).
        if ($genderParam = $request->string('gender')->value()) {
            $query->whereIn('gender', $this->splitCsv($genderParam));
        }

        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->float('price_min'));
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->float('price_max'));
        }

        if ($request->filled('rating_min')) {
            $query->where('rating', '>=', $request->float('rating_min'));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->boolean('in_stock')) {
            $query->where('stock', '>', 0);
        }
    }

    /**
     * @param  Builder<Product>  $query
     */
    private function applySort(Builder $query, ?string $sort): void
    {
        match ($sort) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('rating'),
            'popular' => $query->orderByDesc('reviews_count'),
            default => $query->latest(),
        };
    }

    /**
     * @return list<string>
     */
    private function splitCsv(string $value): array
    {
        return array_values(array_filter(array_map('trim', explode(',', $value))));
    }
}
