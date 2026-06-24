import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, useAdminOrders } from '@/api/admin'
import { formatDate, formatPrice, orderStatusLabel } from '@/lib/format'
import { LoadingBlock } from '@/components/Spinner'
import { Pagination } from '@/components/Pagination'
import { showToast } from '@/components/Toast'
import type { Order, OrderStatus } from '@/types'

const STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'completed', 'cancelled']

export default function AdminOrdersPage() {
  usePageTitle('Управление заказами')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminOrders(status, page)
  const queryClient = useQueryClient()

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      showToast('Статус заказа обновлён')
    },
    onError: () => showToast('Не удалось обновить статус', 'error'),
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Заказы</h2>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-rose-500"
        >
          <option value="">Все статусы</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabel(value)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">№</th>
                <th className="px-4 py-3 font-medium">Покупатель</th>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusChange={(value) => updateStatus.mutate({ id: order.id, status: value })}
                  disabled={updateStatus.isPending}
                />
              ))}
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    Заказов нет.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data?.meta && (
        <Pagination meta={data.meta} onChange={setPage} />
      )}
    </div>
  )
}

function OrderRow({
  order,
  onStatusChange,
  disabled,
}: {
  order: Order
  onStatusChange: (status: OrderStatus) => void
  disabled: boolean
}) {
  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="px-4 py-3 font-medium text-gray-900">{order.id}</td>
      <td className="px-4 py-3">
        <div className="text-gray-900">{order.full_name}</div>
        <div className="text-xs text-gray-400">{order.user?.email ?? order.phone}</div>
      </td>
      <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
      <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(order.total)}</td>
      <td className="px-4 py-3">
        <select
          value={order.status}
          disabled={disabled}
          onChange={(event) => onStatusChange(event.target.value as OrderStatus)}
          className="rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-rose-500 disabled:opacity-50"
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabel(value)}
            </option>
          ))}
        </select>
      </td>
    </tr>
  )
}
