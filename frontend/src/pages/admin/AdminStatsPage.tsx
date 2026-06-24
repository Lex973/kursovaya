import { type ReactNode } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAdminStats } from '@/api/admin'
import { formatPrice, orderStatusLabel } from '@/lib/format'
import { LoadingBlock } from '@/components/Spinner'
import { TrendingUpIcon, PackageIcon, UserIcon, CartIcon, SparklesIcon } from '@/components/Icons'
import type { AdminStats } from '@/types'

const STAT_CARDS = (stats: AdminStats) => [
  {
    label: 'Выручка',
    value: formatPrice(stats.totals.revenue),
    icon: TrendingUpIcon,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    accent: 'border-l-4 border-emerald-400',
  },
  {
    label: 'Заказов всего',
    value: stats.totals.orders,
    icon: CartIcon,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accent: 'border-l-4 border-blue-400',
  },
  {
    label: 'Новых заказов',
    value: stats.totals.pending_orders,
    icon: SparklesIcon,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    accent: 'border-l-4 border-amber-400',
  },
  {
    label: 'Товаров',
    value: `${stats.totals.active_products} / ${stats.totals.products}`,
    icon: PackageIcon,
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    accent: 'border-l-4 border-violet-400',
  },
  {
    label: 'Покупателей',
    value: stats.totals.customers,
    icon: UserIcon,
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    accent: 'border-l-4 border-rose-400',
  },
]

export default function AdminStatsPage() {
  usePageTitle('Статистика')
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading || !stats) return <LoadingBlock />

  return (
    <div className="space-y-8">
      <StatCards stats={stats} />
      <RevenueChart stats={stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProducts stats={stats} />
        <OrdersByStatus stats={stats} />
      </div>
    </div>
  )
}

function StatCards({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {STAT_CARDS(stats).map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm ${card.accent}`}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm text-gray-500">{card.label}</p>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg} ${card.iconColor}`}>
              <card.icon size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  )
}

function RevenueChart({ stats }: { stats: AdminStats }) {
  const data = stats.revenue_by_week.map((row) => ({
    week: new Date(row.week).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    revenue: row.revenue,
  }))

  return (
    <ChartCard title="Выручка по неделям">
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              width={70}
              tickFormatter={(value) => `${value / 1000}к`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [formatPrice(Number(value)), 'Выручка']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
              cursor={{ fill: '#fef2f2' }}
            />
            <Bar dataKey="revenue" fill="#e11d48" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

function TopProducts({ stats }: { stats: AdminStats }) {
  return (
    <ChartCard title="Топ товаров по продажам">
      {stats.top_products.length === 0 ? (
        <EmptyChart />
      ) : (
        <ol className="space-y-4">
          {stats.top_products.map((product, index) => (
            <li key={`${product.product_id}-${index}`} className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  index === 0
                    ? 'bg-amber-100 text-amber-700'
                    : index === 1
                      ? 'bg-gray-100 text-gray-600'
                      : index === 2
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-50 text-gray-500'
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{product.name}</p>
                <p className="text-xs text-gray-400">{product.sold} шт.</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-gray-900">
                {formatPrice(product.revenue)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </ChartCard>
  )
}

const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#6366f1', '#10b981', '#9ca3af']

function OrdersByStatus({ stats }: { stats: AdminStats }) {
  const data = Object.entries(stats.orders_by_status).map(([status, count]) => ({
    status: orderStatusLabel(status),
    count,
  }))

  return (
    <ChartCard title="Заказы по статусам">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 24 }}>
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="status" tick={{ fontSize: 12, fill: '#64748b' }} width={90} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-5 font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  )
}

function EmptyChart() {
  return <p className="py-12 text-center text-sm text-gray-400">Недостаточно данных.</p>
}
