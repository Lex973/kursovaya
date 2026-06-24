import { Link, useParams } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useOrder } from '@/api/orders'
import { formatPrice, orderStatusLabel } from '@/lib/format'
import { LoadingBlock } from '@/components/Spinner'

export default function OrderSuccessPage() {
  usePageTitle('Заказ оформлен')
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading, isError } = useOrder(Number(id))

  if (isLoading) return <LoadingBlock />
  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-gray-500">Заказ не найден.</p>
        <Link to="/catalog" className="mt-4 inline-block text-rose-600 hover:underline">
          ← В каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Заказ оформлен!</h1>
        <p className="mt-2 text-gray-500">
          Заказ №{order.id} принят и находится в статусе «{orderStatusLabel(order.status)}». Мы свяжемся
          с вами для подтверждения.
        </p>

        <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-5 text-left">
          <ul className="space-y-2 text-sm">
            {order.items?.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-gray-600">
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span className="text-gray-900">{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 font-bold text-gray-900">
            <span>Итого</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-1 text-left text-sm text-gray-500">
          <p>
            <span className="text-gray-400">Получатель:</span> {order.full_name}
          </p>
          <p>
            <span className="text-gray-400">Телефон:</span> {order.phone}
          </p>
          <p>
            <span className="text-gray-400">Адрес:</span> {order.address}
          </p>
        </div>

        <Link
          to="/catalog"
          className="mt-8 inline-block rounded-lg bg-rose-600 px-6 py-3 font-medium text-white transition hover:bg-rose-700"
        >
          Продолжить покупки
        </Link>
      </div>
    </div>
  )
}
