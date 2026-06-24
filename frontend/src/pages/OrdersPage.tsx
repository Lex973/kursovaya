import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useOrders } from '@/api/orders'
import { formatDate, formatPrice } from '@/lib/format'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { LoadingBlock } from '@/components/Spinner'
import type { Order } from '@/types'

export default function OrdersPage() {
  usePageTitle('Мои заказы')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOrders(page)

  if (isLoading) return <LoadingBlock />

  const orders = data?.data ?? []
  const meta = data?.meta

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">У вас пока нет заказов.</p>
        <Link to="/catalog" className="mt-4 inline-block font-medium text-rose-600 hover:underline">
          Перейти в каталог →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}

      {meta && meta.last_page > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: meta.last_page }, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => setPage(number)}
              className={`h-9 min-w-9 rounded-lg border px-3 text-sm ${
                number === meta.current_page
                  ? 'border-rose-600 bg-rose-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-rose-300'
              }`}
            >
              {number}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)
  const items = order.items ?? []

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">Заказ №{order.id}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            от {formatDate(order.created_at)} · {order.items_count ?? items.length} тов.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
          <span className={`text-gray-400 transition ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5">
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-gray-600">
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span className="text-gray-900">{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm text-gray-500">
            <p>
              <span className="text-gray-400">Получатель:</span> {order.full_name}
            </p>
            <p>
              <span className="text-gray-400">Телефон:</span> {order.phone}
            </p>
            <p>
              <span className="text-gray-400">Адрес:</span> {order.address}
            </p>
            {order.comment && (
              <p>
                <span className="text-gray-400">Комментарий:</span> {order.comment}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
