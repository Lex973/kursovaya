import type { PaginationMeta } from '@/types'

interface PaginationProps {
  meta: PaginationMeta
  onChange: (page: number) => void
}

export function Pagination({ meta, onChange }: PaginationProps) {
  if (meta.last_page <= 1) return null

  const pages = buildPages(meta.current_page, meta.last_page)

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-1.5">
      <PageBtn
        disabled={meta.current_page === 1}
        onClick={() => onChange(meta.current_page - 1)}
        aria-label="Назад"
      >
        ‹
      </PageBtn>

      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`dot-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-gray-400"
          >
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            active={p === meta.current_page}
            onClick={() => onChange(p as number)}
          >
            {p}
          </PageBtn>
        ),
      )}

      <PageBtn
        disabled={meta.current_page === meta.last_page}
        onClick={() => onChange(meta.current_page + 1)}
        aria-label="Вперёд"
      >
        ›
      </PageBtn>
    </div>
  )
}

function PageBtn({
  children,
  active = false,
  disabled = false,
  onClick,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  'aria-label'?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition ${
        active
          ? 'border-rose-600 bg-rose-600 text-white'
          : disabled
            ? 'cursor-not-allowed border-gray-200 text-gray-300'
            : 'border-gray-300 text-gray-700 hover:border-rose-300'
      }`}
    >
      {children}
    </button>
  )
}

function buildPages(current: number, last: number): (number | '…')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(last - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < last - 2) pages.push('…')
  pages.push(last)
  return pages
}
