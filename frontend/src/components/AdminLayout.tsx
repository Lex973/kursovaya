import { NavLink, Outlet } from 'react-router-dom'

const LINKS = [
  { to: '/admin', label: 'Статистика', end: true },
  { to: '/admin/products', label: 'Товары', end: false },
  { to: '/admin/orders', label: 'Заказы', end: false },
  { to: '/admin/users', label: 'Пользователи', end: false },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-2 text-sm font-medium transition ${
    isActive ? 'bg-rose-600 text-white' : 'text-gray-600 hover:bg-gray-100'
  }`

/** Каркас админ-панели: боковое меню + контент. */
export function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="space-y-1">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
