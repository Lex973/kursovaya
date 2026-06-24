import { api } from '@/lib/api'
import type { AuthResponse, User } from '@/types'

export interface RegisterPayload {
  name: string
  email: string
  phone?: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string | null
  current_password?: string
  password?: string
  password_confirmation?: string
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/auth/me')
    return data.user
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.patch<{ user: User }>('/auth/profile', payload)
    return data.user
  },
}
