import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useState } from 'react'

type ToastKind = 'success' | 'error' | 'info'

type ToastItem = {
  id: string
  kind: ToastKind
  message: string
}

type ToastContextValue = {
  showToast: (input: { kind?: ToastKind; message: string }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(
    ({ kind = 'info', message }: { kind?: ToastKind; message: string }) => {
      const id = crypto.randomUUID()

      setToasts((current) => [...current, { id, kind, message }])

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }, 3600)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed left-1/2 top-5 z-[80] grid w-[min(92vw,420px)] -translate-x-1/2 gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'rounded-3xl border px-4 py-3 text-sm font-bold shadow-[0_20px_50px_rgba(8,28,32,0.18)] backdrop-blur-xl',
              toast.kind === 'success'
                ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-700 dark:text-emerald-200'
                : '',
              toast.kind === 'error'
                ? 'border-red-400/30 bg-red-400/15 text-red-600 dark:text-red-200'
                : '',
              toast.kind === 'info'
                ? 'border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink)]'
                : '',
            ].join(' ')}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }

  return context
}
