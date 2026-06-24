import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Product, ResourceResponse } from '@/types'

export const favoritesApi = {
  async list(): Promise<Product[]> {
    const { data } = await api.get<ResourceResponse<Product[]>>('/favorites')
    return data.data
  },

  async add(productId: number): Promise<void> {
    await api.post('/favorites', { product_id: productId })
  },

  async remove(productId: number): Promise<void> {
    await api.delete(`/favorites/${productId}`)
  },
}

export const FAVORITES_KEY = ['favorites'] as const

export function useFavorites() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  return useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: favoritesApi.list,
    enabled: isAuthenticated,
  })
}

/** Множество id избранных товаров для быстрой проверки. */
export function useFavoriteIds(): Set<number> {
  const { data } = useFavorites()
  return new Set((data ?? []).map((product) => product.id))
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, isFavorite }: { productId: number; isFavorite: boolean }) =>
      isFavorite ? favoritesApi.remove(productId) : favoritesApi.add(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FAVORITES_KEY }),
  })
}
