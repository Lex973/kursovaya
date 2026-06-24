import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useBrands, useCategories, useProducts, type ProductFilters } from '@/api/catalog'
import { useDebounce } from '@/hooks/useDebounce'
import { ProductCard } from '@/components/ProductCard'

import { CloseIcon, SearchIcon, ChevronDownIcon, ChevronRightIcon } from '@/components/Icons'
import type { Category } from '@/types'

/* ─── Опции сортировки ─── */
const SORT_OPTIONS: { value: NonNullable<ProductFilters['sort']>; label: string }[] = [
  { value: 'newest',    label: 'Новинки' },
  { value: 'popular',   label: 'Популярные' },
  { value: 'rating',    label: 'По рейтингу' },
  { value: 'price_asc', label: 'Дешевле' },
  { value: 'price_desc', label: 'Дороже' },
]

const GENDERS: { value: string; label: string; emoji: string }[] = [
  { value: 'female', label: 'Женский', emoji: '♀' },
  { value: 'male',   label: 'Мужской', emoji: '♂' },
  { value: 'unisex', label: 'Унисекс', emoji: '⊕' },
]

const RATING_OPTIONS = [
  { value: '4', label: '4★ и выше' },
  { value: '3', label: '3★ и выше' },
  { value: '2', label: '2★ и выше' },
]

function flattenCategories(categories: Category[]): { category: Category; depth: number }[] {
  const result: { category: Category; depth: number }[] = []
  const walk = (items: Category[], depth: number) => {
    for (const cat of items) {
      result.push({ category: cat, depth })
      if (cat.children?.length) walk(cat.children, depth + 1)
    }
  }
  walk(categories, 0)
  return result
}

/* ═══════════════════════════════════════════════════════════ */

export default function CatalogPage() {
  usePageTitle('Каталог')
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const closeMobileFilters = useCallback(() => setMobileFiltersOpen(false), [])

  useEffect(() => {
    if (!mobileFiltersOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMobileFilters() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [mobileFiltersOpen, closeMobileFilters])
  const categories = useCategories()
  const brands    = useBrands()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (debouncedSearch) next.set('q', debouncedSearch)
        else next.delete('q')
        next.delete('page')
        return next
      },
      { replace: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const filters: ProductFilters = useMemo(
    () => ({
      q:          searchParams.get('q') ?? undefined,
      category:   searchParams.get('category') ?? undefined,
      brand:      searchParams.get('brand') ?? undefined,
      gender:     searchParams.get('gender') ?? undefined,
      price_min:  numParam(searchParams.get('price_min')),
      price_max:  numParam(searchParams.get('price_max')),
      rating_min: numParam(searchParams.get('rating_min')),
      in_stock:   searchParams.get('in_stock') === '1',
      sort:       (searchParams.get('sort') as ProductFilters['sort']) ?? undefined,
      page:       numParam(searchParams.get('page')) ?? 1,
      per_page:   12,
    }),
    [searchParams],
  )

  const products = useProducts(filters)

  function setParam(key: string, value: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  function toggleCsv(key: string, value: string) {
    const current = (searchParams.get(key) ?? '').split(',').filter(Boolean)
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    setParam(key, next.join(',') || null)
  }

  function isInCsv(key: string, value: string) {
    return (searchParams.get(key) ?? '').split(',').filter(Boolean).includes(value)
  }

  function resetAll() {
    setSearch('')
    setSearchParams({}, { replace: true })
  }

  const selectedCategory = searchParams.get('category')
  const selectedSort     = searchParams.get('sort') ?? 'newest'
  const flatCategories   = categories.data ? flattenCategories(categories.data) : []
  const meta             = products.data?.meta

  /* Чипы активных фильтров */
  const activeChips: { key: string; label: string; remove: () => void }[] = []
  if (searchParams.get('q')) {
    activeChips.push({ key: 'q', label: `«${searchParams.get('q')}»`, remove: () => { setSearch(''); setParam('q', null) } })
  }
  if (selectedCategory) {
    const cat = flatCategories.find((fc) => fc.category.slug === selectedCategory)
    activeChips.push({ key: 'cat', label: cat?.category.name ?? selectedCategory, remove: () => setParam('category', null) })
  }
  for (const slug of (searchParams.get('brand') ?? '').split(',').filter(Boolean)) {
    const brand = brands.data?.find((b) => b.slug === slug)
    activeChips.push({ key: `brand-${slug}`, label: brand?.name ?? slug, remove: () => toggleCsv('brand', slug) })
  }
  for (const g of (searchParams.get('gender') ?? '').split(',').filter(Boolean)) {
    const gender = GENDERS.find((gd) => gd.value === g)
    activeChips.push({ key: `gender-${g}`, label: gender?.label ?? g, remove: () => toggleCsv('gender', g) })
  }
  if (searchParams.get('rating_min')) {
    const opt = RATING_OPTIONS.find((o) => o.value === searchParams.get('rating_min'))
    activeChips.push({ key: 'rating', label: opt?.label ?? `${searchParams.get('rating_min')}★+`, remove: () => setParam('rating_min', null) })
  }
  if (searchParams.get('price_min') || searchParams.get('price_max')) {
    const min = searchParams.get('price_min')
    const max = searchParams.get('price_max')
    const label = min && max ? `${min}–${max} ₽` : min ? `от ${min} ₽` : `до ${max} ₽`
    activeChips.push({ key: 'price', label, remove: () => { setParam('price_min', null); setParam('price_max', null) } })
  }
  if (searchParams.get('in_stock') === '1') {
    activeChips.push({ key: 'stock', label: 'В наличии', remove: () => setParam('in_stock', null) })
  }

  const sidebar = (
    <FilterSidebar
      flatCategories={flatCategories}
      selectedCategory={selectedCategory}
      brands={brands.data ?? []}
      searchParams={searchParams}
      setParam={setParam}
      toggleCsv={toggleCsv}
      isInCsv={isInCsv}
    />
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Hero-шапка каталога ─── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Магазин</p>
              <h1 className="mt-1 text-3xl font-black text-gray-900">Каталог</h1>
              {meta && (
                <p className="mt-1 text-sm text-gray-400">
                  {meta.total.toLocaleString('ru-RU')} {plural(meta.total, ['товар', 'товара', 'товаров'])}
                </p>
              )}
            </div>

            {/* Поиск */}
            <div className="relative w-full sm:max-w-sm">
              <SearchIcon
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setParam('q', null) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Сортировка — пилюли */}
          <div className="mt-5 flex flex-wrap gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setParam('sort', opt.value === 'newest' ? null : opt.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  selectedSort === opt.value
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Активные фильтры-чипы */}
          {activeChips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.remove}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
                >
                  {chip.label}
                  <CloseIcon size={11} />
                </button>
              ))}
              <button
                type="button"
                onClick={resetAll}
                className="rounded-full px-3 py-1 text-xs font-medium text-gray-400 ring-1 ring-gray-200 transition hover:ring-gray-300 hover:text-gray-600"
              >
                Сбросить всё
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Контент ─── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">

          {/* Сайдбар desktop */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 space-y-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">Фильтры</p>
              {sidebar}
              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="mt-4 w-full rounded-xl border border-rose-200 bg-rose-50 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          </aside>

          {/* Основная колонка */}
          <main className="min-w-0 flex-1">
            {/* Кнопка фильтров mobile */}
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                Фильтры
                {activeChips.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                    {activeChips.length}
                  </span>
                )}
              </button>
              <p className="text-sm text-gray-400">
                {meta ? `${meta.total.toLocaleString('ru-RU')} товаров` : ''}
              </p>
            </div>

            {/* Сетка товаров */}
            {products.isLoading ? (
              <CatalogSkeleton />
            ) : products.data && products.data.data.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {products.data.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {meta && meta.last_page > 1 && (
                  <Pagination
                    current={meta.current_page}
                    last={meta.last_page}
                    onChange={(page) => { setParam('page', String(page)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  />
                )}
              </>
            ) : (
              <EmptyState onReset={resetAll} hasFilters={activeChips.length > 0} />
            )}
          </main>
        </div>
      </div>

      {/* ─── Мобильный drawer с фильтрами ─── */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-80 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <p className="font-bold text-gray-900">Фильтры</p>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-1">
              {sidebar}
            </div>
            <div className="border-t border-gray-100 p-4 flex gap-3">
              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={() => { resetAll(); setMobileFiltersOpen(false) }}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600"
                >
                  Сбросить
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white"
              >
                {meta ? `Показать ${meta.total}` : 'Показать'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── Сайдбар фильтров ─── */
function FilterSidebar({
  flatCategories,
  selectedCategory,
  brands,
  searchParams,
  setParam,
  toggleCsv,
  isInCsv,
}: {
  flatCategories: { category: Category; depth: number }[]
  selectedCategory: string | null
  brands: { id: number; name: string; slug: string }[]
  searchParams: URLSearchParams
  setParam: (key: string, value: string | null) => void
  toggleCsv: (key: string, value: string) => void
  isInCsv: (key: string, value: string) => boolean
}) {
  return (
    <div className="space-y-1">
      {/* Категории */}
      <Collapsible title="Категории" defaultOpen>
        <div className="space-y-0.5">
          <CategoryButton
            label="Все категории"
            active={!selectedCategory}
            depth={0}
            onClick={() => setParam('category', null)}
          />
          {flatCategories.map(({ category, depth }) => (
            <CategoryButton
              key={category.id}
              label={category.name}
              active={selectedCategory === category.slug}
              depth={depth}
              onClick={() => setParam('category', category.slug)}
            />
          ))}
        </div>
      </Collapsible>

      {/* Бренды */}
      <Collapsible title="Бренды" defaultOpen>
        <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
          {brands.map((brand) => (
            <FilterCheckbox
              key={brand.id}
              label={brand.name}
              checked={isInCsv('brand', brand.slug)}
              onChange={() => toggleCsv('brand', brand.slug)}
            />
          ))}
        </div>
      </Collapsible>

      {/* Пол */}
      <Collapsible title="Для кого">
        <div className="flex gap-2">
          {GENDERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleCsv('gender', value)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                isInCsv('gender', value)
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Collapsible>

      {/* Цена */}
      <Collapsible title="Цена, ₽">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="от"
            defaultValue={searchParams.get('price_min') ?? ''}
            onBlur={(e) => setParam('price_min', e.target.value || null)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:bg-white"
          />
          <span className="shrink-0 text-gray-300">—</span>
          <input
            type="number"
            min={0}
            placeholder="до"
            defaultValue={searchParams.get('price_max') ?? ''}
            onBlur={(e) => setParam('price_max', e.target.value || null)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:bg-white"
          />
        </div>
      </Collapsible>

      {/* Рейтинг */}
      <Collapsible title="Рейтинг">
        <div className="space-y-1">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setParam('rating_min', searchParams.get('rating_min') === opt.value ? null : opt.value)
              }
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                searchParams.get('rating_min') === opt.value
                  ? 'bg-amber-50 font-semibold text-amber-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-amber-400">{'★'.repeat(Number(opt.value))}</span>
              <span className="text-xs text-gray-400">и выше</span>
            </button>
          ))}
        </div>
      </Collapsible>

      {/* В наличии */}
      <div className="pt-1">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition hover:border-gray-200">
          <span className="text-sm font-medium text-gray-700">Только в наличии</span>
          <div
            className={`relative h-5 w-9 rounded-full transition-colors ${
              searchParams.get('in_stock') === '1' ? 'bg-rose-600' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                searchParams.get('in_stock') === '1' ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
            <input
              type="checkbox"
              className="sr-only"
              checked={searchParams.get('in_stock') === '1'}
              onChange={(e) => setParam('in_stock', e.target.checked ? '1' : null)}
            />
          </div>
        </label>
      </div>
    </div>
  )
}

/* ─── Подкомпоненты фильтра ─── */

function Collapsible({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-gray-800"
      >
        {title}
        <ChevronDownIcon
          size={15}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

function CategoryButton({ label, active, depth, onClick }: {
  label: string; active: boolean; depth: number; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 rounded-xl px-3 py-2 text-left text-sm transition ${
        active
          ? 'bg-rose-50 font-semibold text-rose-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
      style={{ paddingLeft: `${12 + depth * 14}px` }}
    >
      {depth > 0 && <ChevronRightIcon size={12} className="shrink-0 text-gray-300" />}
      {label}
    </button>
  )
}

function FilterCheckbox({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition hover:bg-gray-50">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
          checked
            ? 'border-rose-600 bg-rose-600 text-white'
            : 'border-gray-300 bg-white'
        }`}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
            <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

/* ─── Skeleton каталога ─── */
function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
          <div className="bg-gray-100" style={{ aspectRatio: '3/4' }} />
          <div className="space-y-2 p-4">
            <div className="h-2.5 w-1/3 rounded-full bg-gray-100" />
            <div className="h-4 w-3/4 rounded-full bg-gray-100" />
            <div className="h-3 w-1/4 rounded-full bg-gray-100" />
            <div className="h-9 rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Пустой результат ─── */
function EmptyState({ onReset, hasFilters }: { onReset: () => void; hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <SearchIcon size={32} className="text-gray-300" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-gray-900">Ничего не найдено</h3>
      <p className="mt-2 max-w-xs text-sm text-gray-400">
        {hasFilters
          ? 'Попробуйте изменить параметры фильтрации — возможно, таких товаров пока нет в наличии.'
          : 'По вашему запросу товаров не найдено.'}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Сбросить все фильтры
        </button>
      )}
    </div>
  )
}

/* ─── Пагинация ─── */
function Pagination({ current, last, onChange }: {
  current: number; last: number; onChange: (page: number) => void
}) {
  const pages = buildPages(current, last)
  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <PageBtn disabled={current === 1} onClick={() => onChange(current - 1)} aria-label="Назад">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </PageBtn>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`dot-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-gray-400">…</span>
        ) : (
          <PageBtn key={p} active={p === current} onClick={() => onChange(p as number)}>
            {p}
          </PageBtn>
        ),
      )}

      <PageBtn disabled={current === last} onClick={() => onChange(current + 1)} aria-label="Вперёд">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </PageBtn>
    </div>
  )
}

function PageBtn({
  children, active = false, disabled = false, onClick, 'aria-label': ariaLabel,
}: {
  children: ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void; 'aria-label'?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-medium transition ${
        active
          ? 'bg-gray-900 text-white shadow-sm'
          : disabled
          ? 'cursor-not-allowed text-gray-300'
          : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

/* ─── Хелперы ─── */

function numParam(v: string | null): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}

function buildPages(current: number, last: number): (number | '…')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(last - 1, current + 1); p++) pages.push(p)
  if (current < last - 2) pages.push('…')
  pages.push(last)
  return pages
}
