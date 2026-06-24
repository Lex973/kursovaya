// Форматирование значений для отображения.

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

/** Цена в рублях: 12990 -> «12 990 ₽». */
export function formatPrice(value: number): string {
  return `${priceFormatter.format(Math.round(value))} ₽`
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** Дата из ISO-строки: «23 июня 2026». */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  completed: 'Выполнен',
  cancelled: 'Отменён',
}

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status
}

const GENDER_LABELS: Record<string, string> = {
  male: 'Мужской',
  female: 'Женский',
  unisex: 'Унисекс',
}

export function genderLabel(gender: string | null): string | null {
  return gender ? (GENDER_LABELS[gender] ?? gender) : null
}
