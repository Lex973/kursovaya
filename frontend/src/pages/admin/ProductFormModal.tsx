import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { adminApi } from '@/api/admin'
import { useBrands, useCategories } from '@/api/catalog'
import { getErrorMessage } from '@/lib/errors'
import { showToast } from '@/components/Toast'
import { Spinner } from '@/components/Spinner'
import type { Category, Product, ProductImage, ProductInput } from '@/types'

function flatten(categories: Category[], depth = 0): { category: Category; depth: number }[] {
  return categories.flatMap((category) => [
    { category, depth },
    ...(category.children ? flatten(category.children, depth + 1) : []),
  ])
}

interface Props {
  product: Product | null // null => создание
  onClose: () => void
  onSaved: () => void
}

export function ProductFormModal({ product, onClose, onSaved }: Props) {
  const categories = useCategories()
  const brands = useBrands()

  // После создания держим товар здесь, чтобы открыть управление фото.
  const [saved, setSaved] = useState<Product | null>(product)
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? [])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const [form, setForm] = useState({
    category_id: product?.category?.id ?? 0,
    brand_id: product?.brand?.id ?? 0,
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    old_price: product?.old_price ?? 0,
    stock: product?.stock ?? 0,
    gender: product?.gender ?? '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
  })

  function field<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload: ProductInput = {
        category_id: Number(form.category_id),
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : null,
        stock: Number(form.stock),
        gender: (form.gender || null) as ProductInput['gender'],
        is_active: form.is_active,
        is_featured: form.is_featured,
      }

      const isEdit = Boolean(saved)
      const result = saved
        ? await adminApi.updateProduct(saved.id, payload)
        : await adminApi.createProduct(payload)

      setSaved(result)
      onSaved()
      showToast(isEdit ? 'Товар сохранён' : 'Товар создан')
      if (isEdit) onClose()
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setSaving(false)
    }
  }

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !saved) return
    setUploading(true)
    setError(null)
    try {
      const image = await adminApi.uploadImage(saved.id, file)
      setImages((prev) => [...prev, image])
      onSaved()
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function onDeleteImage(imageId: number) {
    if (!saved) return
    try {
      await adminApi.deleteImage(saved.id, imageId)
      setImages((prev) => prev.filter((image) => image.id !== imageId))
      onSaved()
    } catch (caught) {
      setError(getErrorMessage(caught))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {saved ? 'Редактирование товара' : 'Новый товар'}
          </h2>
          <button type="button" onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-700">
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Название" className="sm:col-span-2">
            <input value={form.name} onChange={(e) => field('name', e.target.value)} className={input} required />
          </Field>

          <Field label="Категория">
            <select
              value={form.category_id}
              onChange={(e) => field('category_id', Number(e.target.value))}
              className={input}
              required
            >
              <option value={0} disabled>
                — выберите —
              </option>
              {categories.data &&
                flatten(categories.data).map(({ category, depth }) => (
                  <option key={category.id} value={category.id}>
                    {' '.repeat(depth * 2)}
                    {category.name}
                  </option>
                ))}
            </select>
          </Field>

          <Field label="Бренд">
            <select
              value={form.brand_id}
              onChange={(e) => field('brand_id', Number(e.target.value))}
              className={input}
            >
              <option value={0}>— без бренда —</option>
              {brands.data?.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Цена, ₽">
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => field('price', Number(e.target.value))}
              className={input}
              required
            />
          </Field>

          <Field label="Старая цена, ₽">
            <input
              type="number"
              min={0}
              value={form.old_price}
              onChange={(e) => field('old_price', Number(e.target.value))}
              className={input}
            />
          </Field>

          <Field label="Остаток на складе">
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => field('stock', Number(e.target.value))}
              className={input}
            />
          </Field>

          <Field label="Пол">
            <select value={form.gender} onChange={(e) => field('gender', e.target.value)} className={input}>
              <option value="">—</option>
              <option value="female">Женский</option>
              <option value="male">Мужской</option>
              <option value="unisex">Унисекс</option>
            </select>
          </Field>

          <Field label="Описание" className="sm:col-span-2">
            <textarea
              value={form.description}
              onChange={(e) => field('description', e.target.value)}
              rows={3}
              className={input}
            />
          </Field>

          <div className="flex items-center gap-6 sm:col-span-2">
            <Checkbox label="Активен" checked={form.is_active} onChange={(v) => field('is_active', v)} />
            <Checkbox label="Рекомендуемый" checked={form.is_featured} onChange={(v) => field('is_featured', v)} />
          </div>

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">{error}</p>}

          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
              Закрыть
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:bg-gray-300"
            >
              {saving && <Spinner className="h-4 w-4" />}
              {saved ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>

        {/* Фотографии — доступны после сохранения товара */}
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="font-semibold text-gray-900">Фотографии</h3>
          {!saved ? (
            <p className="mt-2 text-sm text-gray-400">Сначала создайте товар, затем добавьте фото.</p>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap gap-3">
                {images.map((image) => (
                  <div key={image.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                    {image.is_primary && (
                      <span className="absolute left-0 top-0 bg-rose-600 px-1 text-[10px] text-white">гл.</span>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteImage(image.id)}
                      className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/60 text-xs text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-rose-300">
                {uploading ? <Spinner className="h-4 w-4" /> : '＋'} Загрузить фото
                <input ref={fileInput} type="file" accept="image/*" onChange={onUpload} className="hidden" />
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const input =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100'

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
      />
      {label}
    </label>
  )
}
