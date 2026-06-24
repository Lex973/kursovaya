import { Link, useNavigate } from 'react-router-dom'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/format'
import { Rating } from '@/components/Rating'
import { HeartIcon, CartIcon, CheckIcon } from '@/components/Icons'
import { useAddToCart, useCartProductIds } from '@/api/cart'
import { useFavoriteIds, useToggleFavorite } from '@/api/favorites'
import { useAuthStore } from '@/store/auth'

function primaryImage(product: Product): string | undefined {
  const images = product.images ?? []
  return (images.find((image) => image.is_primary) ?? images[0])?.url
}

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const addToCart = useAddToCart()
  const toggleFavorite = useToggleFavorite()
  const favoriteIds = useFavoriteIds()
  const cartIds = useCartProductIds()

  const isFavorite = favoriteIds.has(product.id)
  const inCart = cartIds.has(product.id)
  const image = primaryImage(product)

  function requireAuth(action: () => void) {
    if (!isAuthenticated) { navigate('/auth'); return }
    action()
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-rose-100">
      {/* Изображение */}
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden bg-gray-50" style={{ aspectRatio: '3/4' }}>
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-300">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span className="text-xs">нет фото</span>
          </div>
        )}

        {product.discount_percent ? (
          <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            −{product.discount_percent}%
          </span>
        ) : null}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            requireAuth(() => toggleFavorite.mutate({ productId: product.id, isFavorite }))
          }}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all duration-200 ${
            isFavorite
              ? 'bg-rose-600 text-white scale-110'
              : 'bg-white text-gray-400 opacity-0 group-hover:opacity-100 hover:text-rose-600'
          }`}
          aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          <HeartIcon size={15} filled={isFavorite} />
        </button>

        {!product.in_stock && (
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 pb-4">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              Нет в наличии
            </span>
          </div>
        )}
      </Link>

      {/* Контент */}
      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {product.brand.name}
          </span>
        )}
        <Link
          to={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition hover:text-rose-600"
        >
          {product.name}
        </Link>

        <div className="mt-1.5">
          <Rating value={product.rating} count={product.reviews_count} />
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-gray-900">{formatPrice(product.price)}</span>
            {product.old_price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.old_price)}</span>
            )}
          </div>

          <AddToCartButton
            inStock={product.in_stock}
            inCart={inCart}
            isPending={addToCart.isPending}
            onAdd={() => requireAuth(() => addToCart.mutate({ productId: product.id }))}
            onGoToCart={() => navigate('/cart')}
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Кнопка с состояниями ─── */
interface AddToCartButtonProps {
  inStock: boolean
  inCart: boolean
  isPending: boolean
  onAdd: () => void
  onGoToCart: () => void
}

export function AddToCartButton({ inStock, inCart, isPending, onAdd, onGoToCart }: AddToCartButtonProps) {
  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className="mt-2.5 w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-400 cursor-not-allowed"
      >
        Нет в наличии
      </button>
    )
  }

  if (isPending) {
    return (
      <button
        type="button"
        disabled
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        Добавляем…
      </button>
    )
  }

  if (inCart) {
    return (
      <button
        type="button"
        onClick={onGoToCart}
        className="animate-pop-in mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        <CheckIcon size={15} />
        В корзине
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 group-hover:bg-rose-600"
    >
      <CartIcon size={14} />
      В корзину
    </button>
  )
}
