// Общие типы данных, приходящих с API.

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: 'admin' | 'customer'
  is_admin: boolean
  orders_count?: number
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Brand {
  id: number
  name: string
  slug: string
  logo: string | null
  description: string | null
  products_count?: number
}

export interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  description: string | null
  image: string | null
  children?: Category[]
  products_count?: number
}

export interface ProductImage {
  id: number
  url: string
  is_primary: boolean
  sort_order: number
}

export type Gender = 'male' | 'female' | 'unisex'

export interface Review {
  id: number
  rating: number
  comment: string | null
  user_name?: string
  created_at: string
}

export interface Product {
  id: number
  name: string
  slug: string
  sku: string | null
  description: string | null
  price: number
  old_price: number | null
  discount_percent: number | null
  stock: number
  in_stock: boolean
  gender: Gender | null
  attributes: Record<string, unknown>
  rating: number
  reviews_count: number
  is_active: boolean
  is_featured: boolean
  category?: Category
  brand?: Brand
  images?: ProductImage[]
  reviews?: Review[]
  created_at: string
}

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  subtotal: number
  product: Product
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export interface OrderItem {
  id: number
  product_id: number | null
  product_name: string
  price: number
  quantity: number
  subtotal: number
  product?: Product
}

export interface Order {
  id: number
  status: OrderStatus
  total: number
  full_name: string
  phone: string
  address: string
  comment: string | null
  items_count?: number
  items?: OrderItem[]
  user?: User
  created_at: string
}

// Обёртки ответов Laravel API Resources.

export interface ResourceResponse<T> {
  data: T
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

// --- Админ-панель ---

export interface AdminStats {
  totals: {
    products: number
    active_products: number
    orders: number
    customers: number
    revenue: number
    pending_orders: number
  }
  orders_by_status: Record<OrderStatus, number>
  revenue_by_week: { week: string; revenue: number; orders: number }[]
  top_products: { product_id: number | null; name: string; sold: number; revenue: number }[]
}

export interface ProductInput {
  category_id: number
  brand_id?: number | null
  name: string
  description?: string | null
  price: number
  old_price?: number | null
  stock?: number
  gender?: Gender | null
  is_active?: boolean
  is_featured?: boolean
}
