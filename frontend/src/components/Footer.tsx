import { Link } from 'react-router-dom'

const SHOP_LINKS = [
  { label: 'Каталог товаров', to: '/catalog' },
  { label: 'Избранное', to: '/favorites' },
  { label: 'Корзина', to: '/cart' },
  { label: 'Личный кабинет', to: '/account' },
  { label: 'Мои заказы', to: '/orders' },
]

const CATEGORIES = [
  { label: 'Парфюмерия', to: '/catalog?category=parfyumeriya' },
  { label: 'Уход за лицом', to: '/catalog?category=ukhod-za-litsom' },
  { label: 'Уход за телом', to: '/catalog?category=ukhod-za-telom' },
  { label: 'Декоративная косметика', to: '/catalog?category=dekorativnaya-kosmetika' },
  { label: 'Наборы и подарки', to: '/catalog?category=nabory' },
]

const BRANDS = [
  { label: 'Chanel', to: '/catalog?brand=chanel' },
  { label: 'Dior', to: '/catalog?brand=dior' },
  { label: 'Gucci', to: '/catalog?brand=gucci' },
  { label: 'Lancome', to: '/catalog?brand=lancome' },
  { label: 'Clinique', to: '/catalog?brand=clinique' },
]

export function Footer() {
  return (
    <footer className="bg-[#0c0a09] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {/* Бренд */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="text-2xl font-black tracking-widest text-rose-500">
              ÉCLAT
            </Link>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">beauty store</p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Оригинальная косметика и парфюмерия от мировых брендов с доставкой по всей России.
            </p>
            <div className="mt-6 flex gap-3">
              {/* Социальные сети (декоративно) */}
              {['VK', 'TG', 'IG'].map((s) => (
                <div
                  key={s}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-gray-400 transition hover:border-rose-500/50 hover:text-rose-400 cursor-default"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Магазин */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">Магазин</p>
            <ul className="mt-4 space-y-2.5">
              {SHOP_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-gray-400 transition hover:text-rose-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Категории */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">Категории</p>
            <ul className="mt-4 space-y-2.5">
              {CATEGORIES.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-gray-400 transition hover:text-rose-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Бренды */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">Популярные бренды</p>
            <ul className="mt-4 space-y-2.5">
              {BRANDS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-gray-400 transition hover:text-rose-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Нижняя строка */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-gray-600 sm:flex-row">
          <span>© {new Date().getFullYear()} ÉCLAT Beauty Store. Все права защищены.</span>
          <div className="flex gap-6">
            <span className="cursor-default hover:text-gray-400 transition">Политика конфиденциальности</span>
            <span className="cursor-default hover:text-gray-400 transition">Пользовательское соглашение</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
