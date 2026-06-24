import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  authApi,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
} from '@/api/auth'
import { useAuthStore } from '@/store/auth'

/**
 * При загрузке приложения, если токен есть в localStorage, обновляем данные
 * пользователя с сервера. Если токен невалиден — интерсептор сбросит сессию.
 */
export function useAuthBootstrap(): void {
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    if (!token) return
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        // 401 уже обработан интерсептором (clear).
      })
  }, [token, setUser])
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ user, token }) => setAuth(user, token),
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ user, token }) => setAuth(user, token),
  })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (user) => setUser(user),
  })
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(),
    // Даже если запрос упадёт — локально разлогиниваемся.
    onSettled: () => {
      clear()
      queryClient.clear()
    },
  })
}
