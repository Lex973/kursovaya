import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useProduct } from '@/api/catalog'
import { useAddToCart, useCartProductIds } from '@/api/cart'
import { useFavoriteIds, useToggleFavorite } from '@/api/favorites'
import { useCreateReview } from '@/api/reviews'
import { useAuthStore } from '@/store/auth'
import { formatPrice, formatDate, genderLabel } from '@/lib/format'
import { getErrorMessage } from '@/lib/errors'
import { Rating } from '@/components/Rating'
import { LoadingBlock, Spinner } from '@/components/Spinner'
import { HeartIcon, CheckIcon } from '@/components/Icons'
import type { Product } from '@/types'

/** Человекочитаемое значение атрибута (массив -> через запятую). */
function attributeValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ')
  if (value === null || typeof value === 'object') return ''
  return String(value)
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  type: 'Тип',
  notes: 'Ноты',
  volume_ml: 'Объём, мл',
  country: 'Страна',
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProduct(slug)
  usePageTitle(product?.name)

  if (isLoading) return <LoadingBlock />
  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-gray-500">Товар не найден.</p>
        <Link to="/catalog" className="mt-4 inline-block text-rose-600 hover:underline">
          ← Вернуться в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-gray-500">
        <Link to="/catalog" className="hover:text-rose-600">
          Каталог
        </Link>
        {product.category && <span> / {product.category.name}</span>}
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Gallery product={product} />
        <ProductInfo product={product} />
      </div>

      <ReviewsSection product={product} />
    </div>
  )
}

function Gallery({ product }: { product: Product }) {
  const images = product.images ?? []
  const [active, setActive] = useState(0)
  const current = images[active]?.url

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
        {current ? (
          <img src={current} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">нет фото</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                index === active ? 'border-rose-500' : 'border-transparent'
              }`}
            >
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductInfo({ product }: { product: Product }) {
  const navigateToAuth = useRequireAuth()
  const navigate = useNavigate()
  const addToCart = useAddToCart()
  const toggleFavorite = useToggleFavorite()
  const isFavorite = useFavoriteIds().has(product.id)
  const inCart = useCartProductIds().has(product.id)
  const [quantity, setQuantity] = useState(1)
  const maxQuantity = Math.max(1, product.stock)

  const attributes = Object.entries(product.attributes ?? {}).filter(
    ([, value]) => attributeValue(value) !== '',
  )

  return (
    <div>
      {product.brand && (
        <Link
          to={`/catalog?brand=${product.brand.slug}`}
          className="text-sm uppercase tracking-wide text-gray-400 hover:text-rose-600"
        >
          {product.brand.name}
        </Link>
      )}
      <h1 className="mt-1 text-3xl font-bold text-gray-900">{product.name}</h1>

      <div className="mt-3 flex items-center gap-4">
        <Rating value={product.rating} count={product.reviews_count} size="md" />
        {product.sku && <span className="text-sm text-gray-400">Артикул: {product.sku}</span>}
      </div>

      <div className="mt-5 flex items-end gap-3">
        <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
        {product.old_price && (
          <span className="text-lg text-gray-400 line-through">{formatPrice(product.old_price)}</span>
        )}
        {product.discount_percent && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-sm font-semibold text-rose-700">
            −{product.discount_percent}%
          </span>
        )}
      </div>

      <p className="mt-2 text-sm">
        {product.in_stock ? (
          <span className="text-emerald-600">В наличии: {product.stock} шт.</span>
        ) : (
          <span className="text-gray-400">Нет в наличии</span>
        )}
      </p>

      {product.in_stock && (
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="px-3 py-2 text-gray-600 hover:text-rose-600"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
              className="px-3 py-2 text-gray-600 hover:text-rose-600"
            >
              +
            </button>
          </div>

          {/* Кнопка корзины с состояниями */}
          {addToCart.isPending ? (
            <button
              type="button"
              disabled
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white"
            >
              <Spinner className="h-4 w-4" />
              Добавляем…
            </button>
          ) : inCart ? (
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="animate-pop-in flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              <CheckIcon size={18} />
              В корзине — перейти
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                navigateToAuth(() => addToCart.mutate({ productId: product.id, quantity }))
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-rose-600"
            >
              В корзину
            </button>
          )}

          {/* Кнопка избранного */}
          <button
            type="button"
            onClick={() =>
              navigateToAuth(() =>
                toggleFavorite.mutate({ productId: product.id, isFavorite }),
              )
            }
            className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition ${
              isFavorite
                ? 'border-rose-500 bg-rose-50 text-rose-500'
                : 'border-gray-200 text-gray-400 hover:border-rose-300 hover:text-rose-500'
            }`}
            aria-label="В избранное"
          >
            <HeartIcon size={20} filled={isFavorite} />
          </button>
        </div>
      )}

      {product.description && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-900">Описание</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {product.description}
          </p>
        </div>
      )}

      {(attributes.length > 0 || product.gender) && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-900">Характеристики</h2>
          <dl className="mt-2 divide-y divide-gray-100 text-sm">
            {product.gender && (
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Пол</dt>
                <dd className="text-gray-900">{genderLabel(product.gender)}</dd>
              </div>
            )}
            {attributes.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 py-2">
                <dt className="text-gray-500">{ATTRIBUTE_LABELS[key] ?? key}</dt>
                <dd className="text-right text-gray-900">{attributeValue(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}

function ReviewsSection({ product }: { product: Product }) {
  const reviews = product.reviews ?? []
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const createReview = useCreateReview(product.slug)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    createReview.mutate(
      { productId: product.id, payload: { rating, comment: comment || undefined } },
      { onSuccess: () => setComment('') },
    )
  }

  return (
    <section className="mt-14 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-bold text-gray-900">
        Отзывы {product.reviews_count > 0 && <span className="text-gray-400">({product.reviews_count})</span>}
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">Отзывов пока нет. Будьте первым!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{review.user_name ?? 'Покупатель'}</span>
                  <Rating value={review.rating} />
                </div>
                <p className="mt-1 text-xs text-gray-400">{formatDate(review.created_at)}</p>
                {review.comment && <p className="mt-2 text-sm text-gray-700">{review.comment}</p>}
              </div>
            ))
          )}
        </div>

        <div>
          {isAuthenticated ? (
            <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900">Оставить отзыв</h3>

              <div className="mt-3">
                <span className="mb-1 block text-sm text-gray-600">Оценка</span>
                <div className="flex gap-1 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={star <= rating ? 'text-amber-400' : 'text-gray-300'}
                      aria-label={`${star} звёзд`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                placeholder="Поделитесь впечатлением…"
                className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />

              {createReview.isError && (
                <p className="mt-2 text-sm text-rose-700">{getErrorMessage(createReview.error)}</p>
              )}
              {createReview.isSuccess && (
                <p className="mt-2 text-sm text-emerald-600">Спасибо за отзыв!</p>
              )}

              <button
                type="submit"
                disabled={createReview.isPending}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:bg-gray-300"
              >
                {createReview.isPending && <Spinner className="h-4 w-4" />}
                Отправить
              </button>
            </form>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
              <Link to="/auth" className="font-medium text-rose-600 hover:underline">
                Войдите
              </Link>
              , чтобы оставить отзыв.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** Хелпер: выполнить действие либо отправить на /auth. */
function useRequireAuth() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const navigate = useNavigate()
  return (action: () => void) => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    action()
  }
}
