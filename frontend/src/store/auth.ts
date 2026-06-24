import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  clear: () => void
  isAuthenticated: () => boolean
}

/**
 * Хранилище аутентификации. Токен и пользователь персистятся в localStorage,
 * чтобы сессия не терялась при перезагрузке страницы.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, token: null }),
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: 'auth',
    },
  ),
)
