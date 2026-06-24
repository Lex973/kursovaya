import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { adminApi, useAdminProducts, useInvalidateAdminProducts } from '@/api/admin'
import { formatPrice } from '@/lib/format'
import { LoadingBlock } from '@/components/Spinner'
import { Pagination } from '@/components/Pagination'
import { ProductFormModal } from '@/pages/admin/ProductFormModal'
import { showToast } from '@/components/Toast'
import { getErrorMessage } from '@/lib/errors'
import type { Product } from '@/types'

type ModalState = { open: false } | { open: true; product: Product | null }

export default function AdminProductsPage() {
  usePageTitle('Управление товарами')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<ModalState>({ open: false })
  const { data, isLoading } = useAdminProducts(page)
  const invalidate = useInvalidateAdminProducts()

  async function remove(product: Product) {
    if (!confirm(`Удалить товар «${product.name}»?`)) return
    try {
      await adminApi.deleteProduct(product.id)
      invalidate()
      showToast('Товар удалён')
    } catch (caught) {
      showToast(getErrorMessage(caught), 'error')
    }
  }

  function thumb(product: Product): string | undefined {
    const images = product.images ?? []
    return (images.find((image) => image.is_primary) ?? images[0])?.url
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Товары</h2>
        <button
          type="button"
          onClick={() => setModal({ open: true, product: null })}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          ＋ Добавить товар
        </button>
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium">Остаток</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data?.data.map((product) => {
                const image = thumb(product)
                return (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-400">{product.brand?.name ?? '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-gray-500">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {product.is_active ? 'Активен' : 'Скрыт'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setModal({ open: true, product })}
                          className="text-rose-600 hover:underline"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(product)}
                          className="text-gray-400 hover:text-rose-600"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {data?.meta && <Pagination meta={data.meta} onChange={setPage} />}

      {modal.open && (
        <ProductFormModal
          product={modal.product}
          onClose={() => setModal({ open: false })}
          onSaved={invalidate}
        />
      )}
    </div>
  )
}
