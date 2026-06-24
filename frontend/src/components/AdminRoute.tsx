import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

/**
 * Guard админ-маршрутов: гостя — на /auth, авторизованного не-админа — на главную.
 */
export function AdminRoute() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const isAdmin = useAuthStore((s) => Boolean(s.user?.is_admin))
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
