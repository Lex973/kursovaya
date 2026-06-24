import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useCartCount } from '@/api/cart'
import { useLogout } from '@/hooks/useAuth'
import { CartIcon, CloseIcon } from '@/components/Icons'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative text-sm font-medium transition-colors hover:text-rose-600 ${
    isActive
      ? 'text-rose-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-rose-600'
      : 'text-gray-600'
  }`

export function Header() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const cartCount = useCartCount()
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout.mutate(undefined, { onSettled: () => navigate('/') })
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6">
        {/* Логотип */}
        <Link to="/" className="shrink-0">
          <span className="text-xl font-black tracking-widest text-rose-600">ÉCLAT</span>
          <span className="ml-1 hidden text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 sm:inline">
            beauty
          </span>
        </Link>

        {/* Навигация desktop */}
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/catalog" className={navLinkClass}>Каталог</NavLink>
          {isAuthenticated && (
            <NavLink to="/favorites" className={navLinkClass}>Избранное</NavLink>
          )}
          {user?.is_admin && (
            <NavLink to="/admin" className={navLinkClass}>Управление</NavLink>
          )}
        </nav>

        {/* Правая часть */}
        <div className="ml-auto flex items-center gap-1">
          {/* Корзина */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="Корзина"
          >
            <CartIcon size={20} />
            {cartCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Профиль / Войти desktop */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="max-w-28 truncate">{user?.name ?? 'Профиль'}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full px-3 py-1.5 text-sm text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  Войти
                </Link>
                <Link
                  to="/auth"
                  className="rounded-full bg-rose-600 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Бургер mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 md:hidden"
            aria-label="Меню"
          >
            {menuOpen ? <CloseIcon size={20} /> : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile-меню */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <MobileLink to="/catalog" onClick={() => setMenuOpen(false)}>Каталог</MobileLink>
            {isAuthenticated && (
              <>
                <MobileLink to="/favorites" onClick={() => setMenuOpen(false)}>Избранное</MobileLink>
                <MobileLink to="/account" onClick={() => setMenuOpen(false)}>Профиль</MobileLink>
                <MobileLink to="/orders" onClick={() => setMenuOpen(false)}>Мои заказы</MobileLink>
                {user?.is_admin && (
                  <MobileLink to="/admin" onClick={() => setMenuOpen(false)}>Управление</MobileLink>
                )}
              </>
            )}
          </nav>
          <div className="mt-4 flex gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600"
              >
                Выйти
              </button>
            ) : (
              <>
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-600"
                >
                  Войти
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-rose-50 hover:text-rose-600"
    >
      {children}
    </Link>
  )
}
