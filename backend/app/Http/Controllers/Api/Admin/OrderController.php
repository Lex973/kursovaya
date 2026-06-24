<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Список всех заказов с фильтром по статусу.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::in(Order::STATUSES)],
        ]);

        $orders = Order::query()
            ->with(['user', 'items'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate((int) ($request->integer('per_page') ?: 20));

        return OrderResource::collection($orders);
    }

    /**
     * Детали заказа (для админа — с покупателем и составом).
     */
    public function show(Order $order): OrderResource
    {
        $order->load(['user', 'items.product']);

        return new OrderResource($order);
    }

    /**
     * Смена статуса заказа.
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): OrderResource
    {
        $order->update(['status' => $request->string('status')]);
        $order->load(['user', 'items.product']);

        return new OrderResource($order);
    }
}
