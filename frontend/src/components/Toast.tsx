import { useEffect, useState } from 'react'
import { CheckIcon, CloseIcon } from '@/components/Icons'

export type ToastType = 'success' | 'error'

export interface ToastData {
  id: number
  type: ToastType
  message: string
}

let nextId = 1
const listeners: Array<(toast: ToastData) => void> = []

export function showToast(message: string, type: ToastType = 'success') {
  const toast: ToastData = { id: nextId++, type, message }
  listeners.forEach((fn) => fn(toast))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const fn = (toast: ToastData) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3500)
    }
    listeners.push(fn)
    return () => {
      const idx = listeners.indexOf(fn)
      if (idx !== -1) listeners.splice(idx, 1)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === 'success' ? 'bg-gray-900' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckIcon size={16} className="shrink-0" />
          ) : (
            <CloseIcon size={16} className="shrink-0" />
          )}
          {toast.message}
        </div>
      ))}
    </div>
  )
}
