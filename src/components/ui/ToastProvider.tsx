import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

type ToastTone = 'success' | 'error'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = Date.now() + Math.floor(Math.random() * 1000)
      setItems((prev) => [...prev, { id, tone, message }])
      setTimeout(() => dismiss(id), 3200)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-3 top-3 z-100 w-[min(360px,calc(100vw-24px))] space-y-2">
        {items.map((item) => {
          const isSuccess = item.tone === 'success'
          return (
            <div
              key={item.id}
              className={`pointer-events-auto rounded-xl border px-3.5 py-2.5 shadow-lg backdrop-blur-sm transition-all ${
                isSuccess
                  ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900'
                  : 'border-rose-200 bg-rose-50/95 text-rose-900'
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 inline-block h-2.5 w-2.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}
                />
                <p className="text-sm font-medium leading-snug">
                  {item.message}
                </p>
                <button
                  onClick={() => dismiss(item.id)}
                  className="ml-auto text-xs font-bold opacity-70 hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  x
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}
