import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AdminStats,
  Order,
  OrderStatus,
  PaginatedResponse,
  Product,
  ProductImage,
  ProductInput,
  ResourceResponse,
  User,
} from '@/types'

export const adminApi = {
  async stats(): Promise<AdminStats> {
    const { data } = await api.get<AdminStats>('/admin/stats')
    return data
  },

  async products(page = 1): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get<PaginatedResponse<Product>>('/admin/products', {
      params: { page, per_page: 15 },
    })
    return data
  },

  async createProduct(input: ProductInput): Promise<Product> {
    const { data } = await api.post<ResourceResponse<Product>>('/admin/products', input)
    return data.data
  },

  async updateProduct(id: number, input: Partial<ProductInput>): Promise<Product> {
    const { data } = await api.patch<ResourceResponse<Product>>(`/admin/products/${id}`, input)
    return data.data
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/admin/products/${id}`)
  },

  async uploadImage(productId: number, file: File): Promise<ProductImage> {
    const form = new FormData()
    form.append('image', file)
    const { data } = await api.post<ResourceResponse<ProductImage>>(
      `/admin/products/${productId}/images`,
      form,
    )
    return data.data
  },

  async deleteImage(productId: number, imageId: number): Promise<void> {
    await api.delete(`/admin/products/${productId}/images/${imageId}`)
  },

  async orders(status?: string, page = 1): Promise<PaginatedResponse<Order>> {
    const { data } = await api.get<PaginatedResponse<Order>>('/admin/orders', {
      params: { status: status || undefined, page },
    })
    return data
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const { data } = await api.patch<ResourceResponse<Order>>(`/admin/orders/${id}`, { status })
    return data.data
  },

  async users(q?: string, page = 1): Promise<PaginatedResponse<User>> {
    const { data } = await api.get<PaginatedResponse<User>>('/admin/users', {
      params: { q: q || undefined, page },
    })
    return data
  },

  async updateUser(id: number, input: Partial<Pick<User, 'name' | 'phone' | 'role'>>): Promise<User> {
    const { data } = await api.patch<ResourceResponse<User>>(`/admin/users/${id}`, input)
    return data.data
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`)
  },
}

// --- Хуки ---

export function useAdminStats() {
  return useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.stats })
}

export function useAdminProducts(page: number) {
  return useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => adminApi.products(page),
  })
}

export function useAdminOrders(status: string, page: number) {
  return useQuery({
    queryKey: ['admin', 'orders', status, page],
    queryFn: () => adminApi.orders(status, page),
  })
}

export function useAdminUsers(q: string, page: number) {
  return useQuery({
    queryKey: ['admin', 'users', q, page],
    queryFn: () => adminApi.users(q, page),
  })
}

/** Инвалидация всех админских товаров после мутаций. */
export function useInvalidateAdminProducts() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
}
