<?php

namespace App\Http\Resources;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin OrderItem
 */
class OrderItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'price' => (float) $this->price,
            'quantity' => $this->quantity,
            'subtotal' => round((float) $this->price * $this->quantity, 2),
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
