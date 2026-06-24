<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Используется как для списка, так и для карточки товара.
 * Связи отдаются только если были загружены (whenLoaded).
 *
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'description' => $this->description,
            'price' => (float) $this->price,
            'old_price' => $this->old_price !== null ? (float) $this->old_price : null,
            'discount_percent' => $this->discountPercent(),
            'stock' => $this->stock,
            'in_stock' => $this->stock > 0,
            'gender' => $this->gender,
            'attributes' => $this->attributes ?? [],
            'rating' => (float) $this->rating,
            'reviews_count' => $this->reviews_count,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'created_at' => $this->created_at,
        ];
    }

    private function discountPercent(): ?int
    {
        if ($this->old_price === null || (float) $this->old_price <= (float) $this->price) {
            return null;
        }

        return (int) round((1 - (float) $this->price / (float) $this->old_price) * 100);
    }
}
