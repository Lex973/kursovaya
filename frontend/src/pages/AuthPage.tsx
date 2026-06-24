import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useLogin, useRegister } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/errors'
import { Spinner } from '@/components/Spinner'
import { BadgeCheckIcon, TruckIcon, StarIcon } from '@/components/Icons'

type Mode = 'login' | 'register'

interface LocationState {
  from?: { pathname: string }
}

const FEATURES = [
  { icon: BadgeCheckIcon, text: 'Только оригинальные товары' },
  { icon: TruckIcon,      text: 'Доставка по всей России' },
  { icon: StarIcon,       text: '12 000+ довольных покупателей' },
]

export default function AuthPage() {
  usePageTitle('Вход')
  const [mode, setMode] = useState<Mode>('login')
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/'

  const login = useLogin()
  const register = useRegister()
  const pending = login.isPending || register.isPending
  const error = login.error ?? register.error

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '',
  })

  function update(field: keyof typeof form) {
    return (event: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const onSuccess = () => navigate(redirectTo, { replace: true })
    if (mode === 'login') {
      login.mutate({ email: form.email, password: form.password }, { onSuccess })
    } else {
      register.mutate({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        password_confirmation: form.password_confirmation,
      }, { onSuccess })
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Левая декоративная панель */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-[#0c0a09] p-12 lg:flex">
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-rose-700/20 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-pink-600/15 blur-[80px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />

        <div className="relative">
          <Link to="/" className="text-2xl font-black tracking-widest text-rose-500">ÉCLAT</Link>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-600">beauty store</p>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-black leading-tight text-white">
              Красота начинается<br />
              <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                здесь
              </span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Войдите или зарегистрируйтесь, чтобы делать покупки, сохранять избранное и отслеживать заказы.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-900/40 text-rose-400">
                  <Icon size={16} />
                </div>
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </div>

          {/* Аватары */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['А', 'М', 'К', 'Е'].map((l) => (
                <div key={l} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0c0a09] bg-rose-900/60 text-xs font-bold text-rose-200">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">+12 000 покупателей уже с нами</p>
          </div>
        </div>

        <p className="relative text-xs text-gray-700">© {new Date().getFullYear()} ÉCLAT Beauty Store</p>
      </div>

      {/* Правая форма */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-100">
            {/* Переключатель */}
            <div className="flex rounded-xl bg-gray-100 p-1">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    mode === m
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'login' ? 'Войти' : 'Регистрация'}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h1 className="text-xl font-black text-gray-900">
                {mode === 'login' ? 'С возвращением!' : 'Создать аккаунт'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {mode === 'login'
                  ? 'Войдите, чтобы продолжить покупки'
                  : 'Регистрация занимает меньше минуты'}
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === 'register' && (
                <Field label="Ваше имя">
                  <input type="text" required value={form.name} onChange={update('name')} className={inputClass} placeholder="Анна Иванова" />
                </Field>
              )}

              <Field label="Email">
                <input type="email" required value={form.email} onChange={update('email')} className={inputClass} placeholder="you@example.com" />
              </Field>

              {mode === 'register' && (
                <Field label="Телефон (необязательно)">
                  <input type="tel" value={form.phone} onChange={update('phone')} className={inputClass} placeholder="+7 900 000-00-00" />
                </Field>
              )}

              <Field label="Пароль">
                <input type="password" required value={form.password} onChange={update('password')} className={inputClass} placeholder="••••••••" />
              </Field>

              {mode === 'register' && (
                <Field label="Повторите пароль">
                  <input type="password" required value={form.password_confirmation} onChange={update('password_confirmation')} className={inputClass} placeholder="••••••••" />
                </Field>
              )}

              {error && (
                <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getErrorMessage(error)}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:bg-gray-300 disabled:text-gray-400"
              >
                {pending && <Spinner className="h-4 w-4" />}
                {mode === 'login' ? 'Войти в аккаунт' : 'Зарегистрироваться'}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-gray-400">
              <Link to="/" className="hover:text-rose-500 hover:underline">← Вернуться на главную</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      {children}
    </label>
  )
}
