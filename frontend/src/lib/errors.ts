import { AxiosError } from 'axios'

interface LaravelError {
  message?: string
  errors?: Record<string, string[]>
}

/** Достаёт человекочитаемое сообщение из ошибки axios/Laravel. */
export function getErrorMessage(error: unknown, fallback = 'Что-то пошло не так'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as LaravelError | undefined
    if (data?.errors) {
      const first = Object.values(data.errors)[0]
      if (first?.[0]) return first[0]
    }
    if (data?.message) return data.message
  }
  return fallback
}
