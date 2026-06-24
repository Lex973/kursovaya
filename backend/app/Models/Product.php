<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'category_id', 'brand_id', 'name', 'slug', 'sku', 'description',
    'price', 'old_price', 'stock', 'gender', 'attributes',
    'rating', 'reviews_count', 'is_active', 'is_featured',
])]
class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'attributes' => 'array',
            'price' => 'decimal:2',
            'old_price' => 'decimal:2',
            'stock' => 'integer',
            'rating' => 'decimal:1',
            'reviews_count' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    /**
     * Только активные (опубликованные) товары.
     *
     * @param Builder<Product> $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<Brand, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /** @return HasMany<ProductImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /** Главное изображение. @return HasMany<ProductImage, $this> */
    public function primaryImage(): HasMany
    {
        return $this->images()->where('is_primary', true);
    }

    /** @return HasMany<Review, $this> */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Пересчитывает денормализованные рейтинг и число отзывов
     * на основании связанных записей reviews.
     */
    public function recalculateRating(): void
    {
        $aggregate = $this->reviews()
            ->selectRaw('COUNT(*) as cnt, COALESCE(AVG(rating), 0) as avg_rating')
            ->first();

        $this->forceFill([
            'reviews_count' => (int) $aggregate->cnt,
            'rating' => round((float) $aggregate->avg_rating, 1),
        ])->save();
    }
}
