import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

/**
 * Guard для защищённых маршрутов. Неавторизованного отправляем на /auth,
 * запомнив, куда он шёл, чтобы вернуть после входа.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <Outlet />
}
