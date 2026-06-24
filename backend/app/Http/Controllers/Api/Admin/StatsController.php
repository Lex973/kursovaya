<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    /**
     * Сводная статистика для дашборда админ-панели.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'totals' => $this->totals(),
            'orders_by_status' => $this->ordersByStatus(),
            'revenue_by_week' => $this->revenueByWeek(),
            'top_products' => $this->topProducts(),
        ]);
    }

    /**
     * @return array<string, int|float>
     */
    private function totals(): array
    {
        // Отменённые заказы не приносят выручки.
        $paidOrders = Order::where('status', '!=', Order::STATUS_CANCELLED);

        return [
            'products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'orders' => Order::count(),
            'customers' => User::where('role', User::ROLE_CUSTOMER)->count(),
            'revenue' => round((float) (clone $paidOrders)->sum('total'), 2),
            'pending_orders' => Order::where('status', Order::STATUS_PENDING)->count(),
        ];
    }

    /**
     * Количество заказов по каждому статусу.
     *
     * @return array<string, int>
     */
    private function ordersByStatus(): array
    {
        $counts = Order::query()
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status');

        // Гарантируем наличие всех статусов (в т.ч. с нулём).
        $result = [];
        foreach (Order::STATUSES as $status) {
            $result[$status] = (int) ($counts[$status] ?? 0);
        }

        return $result;
    }

    /**
     * Выручка по неделям за последние 8 недель (для графика Recharts).
     *
     * @return list<array{week: string, revenue: float, orders: int}>
     */
    private function revenueByWeek(): array
    {
        $rows = Order::query()
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->where('created_at', '>=', now()->subWeeks(8)->startOfWeek())
            ->selectRaw("to_char(date_trunc('week', created_at), 'YYYY-MM-DD') as week")
            ->selectRaw('SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('week')
            ->orderBy('week')
            ->get();

        return $rows->map(fn ($row) => [
            'week' => $row->week,
            'revenue' => round((float) $row->revenue, 2),
            'orders' => (int) $row->orders,
        ])->all();
    }

    /**
     * Топ-5 товаров по количеству проданных единиц.
     *
     * @return list<array{product_id: int|null, name: string, sold: int, revenue: float}>
     */
    private function topProducts(): array
    {
        $rows = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->selectRaw('order_items.product_id, MAX(order_items.product_name) as name')
            ->selectRaw('SUM(order_items.quantity) as sold')
            ->selectRaw('SUM(order_items.price * order_items.quantity) as revenue')
            ->groupBy('order_items.product_id')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        return $rows->map(fn ($row) => [
            'product_id' => $row->product_id !== null ? (int) $row->product_id : null,
            'name' => $row->name,
            'sold' => (int) $row->sold,
            'revenue' => round((float) $row->revenue, 2),
        ])->all();
    }
}
