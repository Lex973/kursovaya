import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { CartItem, ResourceResponse } from '@/types'

export const cartApi = {
  async list(): Promise<CartItem[]> {
    const { data } = await api.get<ResourceResponse<CartItem[]>>('/cart')
    return data.data
  },

  async add(productId: number, quantity = 1): Promise<CartItem> {
    const { data } = await api.post<ResourceResponse<CartItem>>('/cart', {
      product_id: productId,
      quantity,
    })
    return data.data
  },

  async updateQuantity(itemId: number, quantity: number): Promise<CartItem> {
    const { data } = await api.patch<ResourceResponse<CartItem>>(`/cart/${itemId}`, {
      quantity,
    })
    return data.data
  },

  async remove(itemId: number): Promise<void> {
    await api.delete(`/cart/${itemId}`)
  },

  async clear(): Promise<void> {
    await api.delete('/cart')
  },
}

export const CART_KEY = ['cart'] as const

export function useCart() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))

  return useQuery({
    queryKey: CART_KEY,
    queryFn: cartApi.list,
    enabled: isAuthenticated,
  })
}

/** Суммарное количество единиц в корзине — для бейджа в шапке. */
export function useCartCount(): number {
  const { data } = useCart()
  return (data ?? []).reduce((sum, item) => sum + item.quantity, 0)
}

/** Set из product_id всех товаров в корзине — для быстрой проверки isInCart. */
export function useCartProductIds(): Set<number> {
  const { data } = useCart()
  return new Set((data ?? []).map((item) => item.product_id))
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity?: number }) =>
      cartApi.add(productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) => cartApi.remove(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}
