import type { ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react'
import { createContext, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'

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
      }, 5_000)
    },
    [],
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toastLayer = (
    <div className="pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+1rem)] z-[200] grid w-[min(92vw,420px)] -translate-x-1/2 gap-3 sm:top-5">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            'pointer-events-auto flex items-start gap-3 rounded-3xl border px-4 py-3 text-sm font-bold shadow-[0_20px_50px_rgba(8,28,32,0.18)] backdrop-blur-xl',
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
          <span className="min-w-0 flex-1">{toast.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-current opacity-70 transition hover:bg-current/10 hover:opacity-100"
            onClick={() => dismissToast(toast.id)}
          >
            <XIcon weight="bold" className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {typeof document === 'undefined'
        ? null
        : createPortal(toastLayer, document.body)}
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
