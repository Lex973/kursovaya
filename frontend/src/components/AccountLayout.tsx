import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/account', label: 'Профиль' },
  { to: '/orders', label: 'Мои заказы' },
  { to: '/favorites', label: 'Избранное' },
]

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-4 py-2 text-sm font-medium transition ${
    isActive ? 'bg-rose-600 text-white' : 'text-gray-600 hover:bg-gray-100'
  }`

/** Каркас личного кабинета: заголовок + вкладки + контент. */
export function AccountLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>

      <nav className="mt-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end className={tabClass}>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  )
}
