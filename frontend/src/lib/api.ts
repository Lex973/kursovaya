import axios from 'axios'
import { useAuthStore } from '@/store/auth'

// Базовый URL. В dev по умолчанию используется Vite-прокси (/api -> Laravel).
const baseURL = import.meta.env.VITE_API_URL ?? '/api'

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
})

// Подставляем Bearer-токен в каждый запрос, если пользователь авторизован.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// При 401 (токен истёк/невалиден) — сбрасываем локальную сессию.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clear()
    }
    return Promise.reject(error)
  },
)
