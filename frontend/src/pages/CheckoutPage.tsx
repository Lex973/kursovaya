import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCart } from '@/api/cart'
import { useCreateOrder } from '@/api/orders'
import { useAuthStore } from '@/store/auth'
import { formatPrice } from '@/lib/format'
import { getErrorMessage } from '@/lib/errors'
import { LoadingBlock, Spinner } from '@/components/Spinner'

export default function CheckoutPage() {
  usePageTitle('Оформление заказа')
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: items, isLoading } = useCart()
  const createOrder = useCreateOrder()

  const [form, setForm] = useState({
    full_name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: '',
    comment: '',
  })

  function update(field: keyof typeof form) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  if (isLoading) return <LoadingBlock />

  const cart = items ?? []
  // Пустую корзину оформлять нечего — возвращаем на страницу корзины.
  if (cart.length === 0) return <Navigate to="/cart" replace />

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    createOrder.mutate(
      {
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
        comment: form.comment || undefined,
      },
      { onSuccess: (order) => navigate(`/order/${order.id}`, { replace: true }) },
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Оформление заказа</h1>

      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Контактные данные</h2>

          <Field label="Имя получателя">
            <input type="text" required value={form.full_name} onChange={update('full_name')} className={inputClass} />
          </Field>

          <Field label="Телефон">
            <input
              type="tel"
              required
              value={form.phone}
              onChange={update('phone')}
              className={inputClass}
              placeholder="+7 900 000-00-00"
            />
          </Field>

          <Field label="Адрес доставки">
            <input
              type="text"
              required
              value={form.address}
              onChange={update('address')}
              className={inputClass}
              placeholder="Город, улица, дом, квартира"
            />
          </Field>

          <Field label="Комментарий (необязательно)">
            <textarea
              value={form.comment}
              onChange={update('comment')}
              rows={3}
              className={inputClass}
              placeholder="Пожелания к заказу"
            />
          </Field>

          {createOrder.isError && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {getErrorMessage(createOrder.error)}
            </p>
          )}
        </div>

        {/* Сводка заказа */}
        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Ваш заказ</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-gray-600">
                <span className="line-clamp-1">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="shrink-0 text-gray-900">{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-lg font-bold text-gray-900">
            <span>Итого</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button
            type="submit"
            disabled={createOrder.isPending}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-3 font-medium text-white transition hover:bg-rose-700 disabled:bg-gray-300"
          >
            {createOrder.isPending && <Spinner className="h-4 w-4" />}
            Подтвердить заказ
          </button>
        </aside>
      </form>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}
