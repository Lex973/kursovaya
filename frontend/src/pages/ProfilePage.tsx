import { useState, type FormEvent, type ReactNode } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useUpdateProfile } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth'
import { getErrorMessage } from '@/lib/errors'
import { Spinner } from '@/components/Spinner'

export default function ProfilePage() {
  usePageTitle('Профиль')
  const user = useAuthStore((s) => s.user)

  const profile = useUpdateProfile()
  const password = useUpdateProfile()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function saveProfile(event: FormEvent) {
    event.preventDefault()
    profile.mutate({ name, phone: phone || null })
  }

  function savePassword(event: FormEvent) {
    event.preventDefault()
    password.mutate(
      {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      },
      {
        onSuccess: () => {
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        },
      },
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Данные профиля */}
      <form onSubmit={saveProfile} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Личные данные</h2>

        <Field label="Имя">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Email">
          <input value={user?.email ?? ''} disabled className={`${inputClass} bg-gray-50 text-gray-400`} />
        </Field>
        <Field label="Телефон">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+7 900 000-00-00"
          />
        </Field>

        {profile.isError && <Message error>{getErrorMessage(profile.error)}</Message>}
        {profile.isSuccess && <Message>Данные сохранены.</Message>}

        <button type="submit" disabled={profile.isPending} className={buttonClass}>
          {profile.isPending && <Spinner className="h-4 w-4" />}
          Сохранить
        </button>
      </form>

      {/* Смена пароля */}
      <form onSubmit={savePassword} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Смена пароля</h2>

        <Field label="Текущий пароль">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Новый пароль">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Повторите новый пароль">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            required
          />
        </Field>

        {password.isError && <Message error>{getErrorMessage(password.error)}</Message>}
        {password.isSuccess && <Message>Пароль изменён.</Message>}

        <button type="submit" disabled={password.isPending} className={buttonClass}>
          {password.isPending && <Spinner className="h-4 w-4" />}
          Изменить пароль
        </button>
      </form>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
const buttonClass =
  'flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:bg-gray-300'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

function Message({ children, error }: { children: ReactNode; error?: boolean }) {
  return (
    <p
      className={`rounded-lg px-3 py-2 text-sm ${
        error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
      }`}
    >
      {children}
    </p>
  )
}
