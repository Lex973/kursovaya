import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, useAdminUsers } from '@/api/admin'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/format'
import { getErrorMessage } from '@/lib/errors'
import { LoadingBlock } from '@/components/Spinner'
import { Pagination } from '@/components/Pagination'
import { showToast } from '@/components/Toast'
import { useAuthStore } from '@/store/auth'
import type { User } from '@/types'

export default function AdminUsersPage() {
  usePageTitle('Управление пользователями')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 400)
  const { data, isLoading } = useAdminUsers(debouncedSearch, page)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      showToast('Изменения сохранены')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Пользователи</h2>
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Поиск по имени или email…"
          className="w-64 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-rose-500"
        />
      </div>

      {mutation.isError && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {getErrorMessage(mutation.error)}
        </p>
      )}

      {isLoading ? (
        <LoadingBlock />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Заказов</th>
                <th className="px-4 py-3 font-medium">Регистрация</th>
                <th className="px-4 py-3 font-medium">Роль</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data?.data.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500">{user.orders_count ?? 0}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      disabled={user.id === currentUserId || mutation.isPending}
                      onChange={(event) =>
                        mutation.mutate(() =>
                          adminApi.updateUser(user.id, {
                            role: event.target.value as User['role'],
                          }),
                        )
                      }
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-rose-500 disabled:opacity-50"
                    >
                      <option value="customer">Покупатель</option>
                      <option value="admin">Админ</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.id !== currentUserId && (
                      <button
                        type="button"
                        disabled={mutation.isPending}
                        onClick={() => {
                          if (confirm(`Удалить пользователя ${user.name}?`)) {
                            mutation.mutate(() => adminApi.deleteUser(user.id))
                          }
                        }}
                        className="text-sm text-gray-400 transition hover:text-rose-600"
                      >
                        Удалить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.meta && <Pagination meta={data.meta} onChange={setPage} />}
    </div>
  )
}
