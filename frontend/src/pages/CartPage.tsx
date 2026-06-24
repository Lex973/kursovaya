import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/api/cart'
import { formatPrice } from '@/lib/format'
import { LoadingBlock } from '@/components/Spinner'
import type { CartItem } from '@/types'

function primaryImage(item: CartItem): string | undefined {
  const images = item.product.images ?? []
  return (images.find((image) => image.is_primary) ?? images[0])?.url
}

export default function CartPage() {
  usePageTitle('Корзина')
  const { data: items, isLoading } = useCart()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  if (isLoading) return <LoadingBlock />

  const cart = items ?? []
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Корзина пуста</h1>
        <p className="mt-2 text-gray-500">Самое время выбрать что-нибудь приятное.</p>
        <Link
          to="/catalog"
          className="mt-6 inline-block rounded-lg bg-rose-600 px-6 py-3 font-medium text-white transition hover:bg-rose-700"
        >
          В каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Корзина</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {cart.map((item) => {
            const image = primaryImage(item)
            const maxQuantity = Math.max(item.quantity, item.product.stock)
            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <Link
                  to={`/product/${item.product.slug}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                >
                  {image && <img src={image} alt={item.product.name} className="h-full w-full object-cover" />}
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {item.product.brand && (
                        <span className="text-xs uppercase tracking-wide text-gray-400">
                          {item.product.brand.name}
                        </span>
                      )}
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="block text-sm font-medium text-gray-900 hover:text-rose-600"
                      >
                        {item.product.name}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem.mutate(item.id)}
                      className="text-gray-400 transition hover:text-rose-600"
                      aria-label="Удалить"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        type="button"
                        disabled={item.quantity <= 1 || updateItem.isPending}
                        onClick={() =>
                          updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                        }
                        className="px-3 py-1.5 text-gray-600 hover:text-rose-600 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        disabled={item.quantity >= maxQuantity || updateItem.isPending}
                        onClick={() =>
                          updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                        }
                        className="px-3 py-1.5 text-gray-600 hover:text-rose-600 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Итог */}
        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Итого</h2>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Товары ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-lg font-bold text-gray-900">
            <span>К оплате</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-6 block rounded-lg bg-rose-600 px-4 py-3 text-center font-medium text-white transition hover:bg-rose-700"
          >
            Оформить заказ
          </Link>
        </aside>
      </div>
    </div>
  )
}
