import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Brand,
  Category,
  PaginatedResponse,
  Product,
  ResourceResponse,
} from '@/types'

export interface ProductFilters {
  q?: string
  category?: string
  brand?: string
  gender?: string
  price_min?: number
  price_max?: number
  rating_min?: number
  featured?: boolean
  in_stock?: boolean
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular'
  per_page?: number
  page?: number
}

/** Убирает пустые/неактивные параметры перед отправкой. */
function cleanParams(filters: ProductFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '' || value === false) {
      continue
    }
    params[key] = value === true ? 1 : (value as string | number)
  }
  return params
}

export const catalogApi = {
  async categories(): Promise<Category[]> {
    const { data } = await api.get<ResourceResponse<Category[]>>('/categories')
    return data.data
  },

  async brands(): Promise<Brand[]> {
    const { data } = await api.get<ResourceResponse<Brand[]>>('/brands')
    return data.data
  },

  async products(filters: ProductFilters): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get<PaginatedResponse<Product>>('/products', {
      params: cleanParams(filters),
    })
    return data
  },

  async product(slug: string): Promise<Product> {
    const { data } = await api.get<ResourceResponse<Product>>(`/products/${slug}`)
    return data.data
  },
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.categories,
    staleTime: 10 * 60_000,
  })
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: catalogApi.brands,
    staleTime: 10 * 60_000,
  })
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => catalogApi.products(filters),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogApi.product(slug as string),
    enabled: Boolean(slug),
  })
}
