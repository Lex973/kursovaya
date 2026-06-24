interface RatingProps {
  value: number
  count?: number
  size?: 'sm' | 'md'
}

/** Звёздный рейтинг (только для отображения). */
export function Rating({ value, count, size = 'sm' }: RatingProps) {
  const rounded = Math.round(value)
  const starClass = size === 'md' ? 'text-lg' : 'text-sm'

  return (
    <span className="inline-flex items-center gap-1">
      <span className={`leading-none ${starClass}`} aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rounded ? 'text-amber-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-500">
          {value > 0 ? value.toFixed(1) : '—'}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </span>
  )
}
