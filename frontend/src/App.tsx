import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AccountLayout } from '@/components/AccountLayout'
import { AdminRoute } from '@/components/AdminRoute'
import { AdminLayout } from '@/components/AdminLayout'
import { useAuthBootstrap } from '@/hooks/useAuth'
import HomePage from '@/pages/HomePage'
import CatalogPage from '@/pages/CatalogPage'
import ProductPage from '@/pages/ProductPage'
import AuthPage from '@/pages/AuthPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrderSuccessPage from '@/pages/OrderSuccessPage'
import ProfilePage from '@/pages/ProfilePage'
import OrdersPage from '@/pages/OrdersPage'
import FavoritesPage from '@/pages/FavoritesPage'
import AdminStatsPage from '@/pages/admin/AdminStatsPage'
import AdminProductsPage from '@/pages/admin/AdminProductsPage'
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'

function App() {
  // Обновляем профиль по сохранённому токену при старте приложения.
  useAuthBootstrap()

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Публичные */}
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Требуют авторизации */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:id" element={<OrderSuccessPage />} />

          {/* Личный кабинет */}
          <Route element={<AccountLayout />}>
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Route>
        </Route>

        {/* Админ-панель (только роль admin) */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminStatsPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-gray-500">Страница не найдена.</p>
    </div>
  )
}

export default App
