import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useFavorites } from '@/api/favorites'
import { ProductCard } from '@/components/ProductCard'
import { LoadingBlock } from '@/components/Spinner'

export default function FavoritesPage() {
  usePageTitle('Избранное')
  const { data: products, isLoading } = useFavorites()

  if (isLoading) return <LoadingBlock />

  const favorites = products ?? []

  if (favorites.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-5xl">♡</p>
        <p className="mt-3 text-gray-500">В избранном пока пусто.</p>
        <Link to="/catalog" className="mt-4 inline-block font-medium text-rose-600 hover:underline">
          Найти что-нибудь →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {favorites.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
