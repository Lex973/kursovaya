import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Order, PaginatedResponse, ResourceResponse } from '@/types'
import { CART_KEY } from '@/api/cart'

export interface CheckoutPayload {
  full_name: string
  phone: string
  address: string
  comment?: string
}

export const ordersApi = {
  async list(page = 1): Promise<PaginatedResponse<Order>> {
    const { data } = await api.get<PaginatedResponse<Order>>('/orders', {
      params: { page },
    })
    return data
  },

  async get(id: number): Promise<Order> {
    const { data } = await api.get<ResourceResponse<Order>>(`/orders/${id}`)
    return data.data
  },

  async create(payload: CheckoutPayload): Promise<Order> {
    const { data } = await api.post<ResourceResponse<Order>>('/orders', payload)
    return data.data
  },
}

export function useOrders(page = 1) {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  return useQuery({
    queryKey: ['orders', page],
    queryFn: () => ordersApi.list(page),
    enabled: isAuthenticated,
  })
}

export function useOrder(id: number | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id as number),
    enabled: Boolean(id),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => ordersApi.create(payload),
    onSuccess: () => {
      // Корзина очищена на сервере, история заказов изменилась.
      queryClient.invalidateQueries({ queryKey: CART_KEY })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
