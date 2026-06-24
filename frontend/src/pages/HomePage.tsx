import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useBrands, useProducts } from '@/api/catalog'
import { ProductCard } from '@/components/ProductCard'
import { LoadingBlock, ProductGridSkeleton } from '@/components/Spinner'
import {
  TruckIcon,
  BadgeCheckIcon,
  RefreshIcon,
  ArrowRightIcon,
  ShieldIcon,
  StarIcon,
} from '@/components/Icons'

/* ─── Статистика компании ─── */
const STATS = [
  { value: '12 000+', label: 'довольных покупателей' },
  { value: '50+',    label: 'мировых брендов' },
  { value: '5 лет',  label: 'на рынке красоты' },
  { value: '98%',    label: 'положительных отзывов' },
]

/* ─── Преимущества ─── */
const PERKS = [
  {
    icon: BadgeCheckIcon,
    title: 'Оригинальная продукция',
    desc: 'Каждый товар сертифицирован и прошёл проверку подлинности. Никаких подделок.',
  },
  {
    icon: TruckIcon,
    title: 'Быстрая доставка',
    desc: 'По Москве — от 1 дня, по России — от 2 дней. Отслеживание заказа в реальном времени.',
  },
  {
    icon: RefreshIcon,
    title: 'Лёгкий возврат',
    desc: '14 дней на возврат без объяснения причин. Деньги вернём в течение 3 рабочих дней.',
  },
  {
    icon: ShieldIcon,
    title: 'Безопасная оплата',
    desc: 'Оплата картой или наличными при получении. Ваши данные надёжно защищены.',
  },
]

/* ─── Отзывы покупателей ─── */
const REVIEWS = [
  {
    name: 'Анна Соколова',
    city: 'Москва',
    rating: 5,
    text: 'Заказываю здесь уже третий год. Всегда оригинальная парфюмерия, упаковка идеальная. Chanel Coco Mademoiselle — мой вечный фаворит, и только здесь нашла его по честной цене.',
    avatar: 'А',
    product: 'Chanel Coco Mademoiselle',
  },
  {
    name: 'Мария Иванова',
    city: 'Санкт-Петербург',
    rating: 5,
    text: 'Отличный магазин! Заказала уход Clinique — доставили на следующий день. Консультанты помогли выбрать подходящий крем для моего типа кожи. Очень довольна!',
    avatar: 'М',
    product: 'Clinique Moisturizing Lotion',
  },
  {
    name: 'Дмитрий Козлов',
    city: 'Казань',
    rating: 5,
    text: 'Покупал Dior Sauvage в подарок жене. Упакован как подарочный набор, духи оригинальные — проверил по QR-коду. Доставка пришла раньше срока. Буду заказывать ещё!',
    avatar: 'Д',
    product: 'Dior Sauvage EDP',
  },
]

/* ─── Шаги работы ─── */
const HOW_IT_WORKS = [
  { step: '01', title: 'Выберите товар', desc: 'Используйте фильтры по бренду, цене, полу и рейтингу' },
  { step: '02', title: 'Добавьте в корзину', desc: 'Сравнивайте товары, добавляйте в избранное' },
  { step: '03', title: 'Оформите заказ', desc: 'Укажите адрес доставки и удобный способ оплаты' },
  { step: '04', title: 'Получите и наслаждайтесь', desc: 'Быстрая доставка и поддержка 24/7' },
]

export default function HomePage() {
  usePageTitle()
  const featured = useProducts({ featured: true, per_page: 8 })
  const brands = useBrands()

  return (
    <div className="overflow-x-hidden">
      {/* ═══ HERO ═══ */}
      <section className="relative bg-[#0c0a09]">
        {/* Фоновый паттерн */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Цветовые пятна */}
        <div className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-rose-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-pink-600/15 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-36">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Левая колонка — текст */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-800/50 bg-rose-900/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-rose-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Новая коллекция 2026
              </span>

              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl xl:text-6xl">
                Красота,{' '}
                <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                  которой
                </span>{' '}
                вы заслуживаете
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-400">
                Оригинальные ароматы и уход от Chanel, Dior, Gucci и других мировых брендов.
                Сертифицированная продукция с доставкой по всей России.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-rose-900/40 transition hover:bg-rose-500"
                >
                  Перейти в каталог
                  <ArrowRightIcon size={16} />
                </Link>
                <Link
                  to="/catalog?sort=rating"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-3.5 font-medium text-white backdrop-blur transition hover:bg-white/20"
                >
                  Хиты продаж
                </Link>
              </div>

              {/* Мини-статистика */}
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {STATS.map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Правая колонка — декоративная сетка продуктов */}
            <div className="animate-fade-up delay-200 hidden lg:block">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { bg: 'bg-rose-900/40', img: 'https://picsum.photos/seed/perfume1/400/500', label: 'Парфюмерия' },
                  { bg: 'bg-pink-900/30', img: 'https://picsum.photos/seed/beauty2/400/500', label: 'Уход' },
                  { bg: 'bg-fuchsia-900/30', img: 'https://picsum.photos/seed/makeup3/400/500', label: 'Косметика' },
                  { bg: 'bg-rose-800/30', img: 'https://picsum.photos/seed/skincare4/400/500', label: 'Новинки' },
                ].map(({ bg, img, label }, i) => (
                  <div
                    key={label}
                    className={`group relative overflow-hidden rounded-2xl ${bg} ${i === 0 ? 'row-span-2' : ''}`}
                    style={{ minHeight: i === 0 ? 320 : 150 }}
                  >
                    <img
                      src={img}
                      alt={label}
                      className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-500 group-hover:scale-105 group-hover:opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-sm font-semibold text-white/90">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ПОПУЛЯРНЫЕ ТОВАРЫ ═══ */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Подборка редактора</p>
              <h2 className="mt-2 text-3xl font-black text-gray-900">Популярное</h2>
            </div>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-rose-300 hover:text-rose-600"
            >
              Все товары
              <ArrowRightIcon size={14} />
            </Link>
          </div>

          {featured.isLoading ? (
            <div className="mt-8">
              <ProductGridSkeleton count={8} />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.data?.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ О КОМПАНИИ ═══ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Текст */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">О нас</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-gray-900 sm:text-4xl">
                Ваш надёжный партнёр<br />в мире красоты
              </h2>
              <p className="mt-5 text-base leading-relaxed text-gray-500">
                ÉCLAT — интернет-магазин оригинальной косметики и парфюмерии. С 2021 года мы помогаем
                тысячам покупателей находить идеальные ароматы и средства ухода от лучших мировых брендов.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-500">
                Каждый товар в нашем каталоге проходит строгую проверку подлинности. Мы работаем напрямую
                с официальными дистрибьюторами, что гарантирует подлинность и качество каждой покупки.
              </p>

              {/* Столбцы достижений */}
              <div className="mt-8 grid grid-cols-2 gap-6">
                {[
                  { num: '12 000+', text: 'Выполненных заказов' },
                  { num: '50+',    text: 'Брендов в каталоге' },
                  { num: '98%',    text: 'Довольных клиентов' },
                  { num: '5 лет', text: 'Опыта работы' },
                ].map(({ num, text }) => (
                  <div key={text} className="rounded-2xl bg-gray-50 p-5">
                    <p className="text-3xl font-black text-rose-600">{num}</p>
                    <p className="mt-1 text-sm text-gray-500">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Визуальная часть */}
            <div className="relative">
              {/* Главное изображение */}
              <div className="overflow-hidden rounded-3xl">
                <img
                  src="https://picsum.photos/seed/luxurybeauty/800/600"
                  alt="Магазин ÉCLAT"
                  className="h-80 w-full object-cover lg:h-[460px]"
                />
              </div>
              {/* Карточка-вставка */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
                    <StarIcon size={22} filled className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900">4.9 / 5.0</p>
                    <p className="text-xs text-gray-500">Средняя оценка товаров</p>
                  </div>
                </div>
                <div className="mt-3 flex -space-x-2">
                  {['А', 'М', 'К', 'Е', 'Д'].map((letter) => (
                    <div
                      key={letter}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-rose-100 text-xs font-bold text-rose-700"
                    >
                      {letter}
                    </div>
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-500">
                    +99
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ КАК МЫ РАБОТАЕМ ═══ */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Процесс</p>
            <h2 className="mt-3 text-3xl font-black text-gray-900">Как это работает</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500">
              Четыре простых шага — и идеальный аромат уже у вас дома
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ step, title, desc }, index) => (
              <div key={step} className="relative">
                {/* Соединительная линия */}
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute left-[calc(50%+2.5rem)] top-8 hidden h-px w-[calc(100%-5rem)] bg-gray-200 lg:block" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600 text-xl font-black text-white shadow-lg shadow-rose-200">
                    {step}
                  </div>
                  <h3 className="mt-4 font-bold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ПРЕИМУЩЕСТВА ═══ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Почему мы</p>
            <h2 className="mt-3 text-3xl font-black text-gray-900">Наши преимущества</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-rose-100 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition group-hover:bg-rose-100">
                  <Icon size={24} />
                </div>
                <h3 className="mt-4 font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ОТЗЫВЫ ═══ */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Отзывы</p>
            <h2 className="mt-3 text-3xl font-black text-gray-900">Нам доверяют</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500">
              Более 12 000 довольных покупателей по всей России
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {REVIEWS.map(({ name, city, rating, text, avatar, product }) => (
              <div
                key={name}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
              >
                {/* Звёзды */}
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <StarIcon key={i} size={16} filled className="text-amber-400" />
                  ))}
                </div>
                {/* Текст */}
                <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">«{text}»</p>
                {/* Товар */}
                <p className="mt-3 text-xs font-medium text-rose-500">{product}</p>
                {/* Автор */}
                <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ БРЕНДЫ — бегущая строка ═══ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            Официальные партнёры
          </p>
          {brands.isLoading ? (
            <LoadingBlock />
          ) : (
            <>
              <div className="marquee-track">
                <div className="animate-marquee flex gap-4 whitespace-nowrap">
                  {/* Дублируем для бесшовной прокрутки */}
                  {[...(brands.data ?? []), ...(brands.data ?? [])].map((brand, i) => (
                    <Link
                      key={`${brand.id}-${i}`}
                      to={`/catalog?brand=${brand.slug}`}
                      className="inline-flex shrink-0 items-center rounded-full border border-gray-200 bg-gray-50 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>
              {/* Статичные бренды как запасной вариант / дополнение */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {brands.data?.slice(0, 6).map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/catalog?brand=${brand.slug}`}
                    className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══ CTA-БАННЕР ═══ */}
      <section className="relative overflow-hidden bg-[#0c0a09] py-20">
        <div className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-rose-700/20 blur-[80px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-pink-600/15 blur-[80px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">Специальное предложение</p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Скидка 10% на первый заказ
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-400">
            Зарегистрируйтесь сейчас и получите персональный промокод на скидку для первой покупки.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-rose-900/40 transition hover:bg-rose-500"
            >
              Зарегистрироваться бесплатно
              <ArrowRightIcon size={16} />
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 font-medium text-white transition hover:bg-white/10"
            >
              Смотреть каталог
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
