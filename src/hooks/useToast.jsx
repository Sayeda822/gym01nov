import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const styles = {
  success: { icon: CheckCircle2, ring: 'text-lime' },
  error: { icon: AlertTriangle, ring: 'text-flame' },
  info: { icon: Info, ring: 'text-cyan' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback((message, { type = 'success', title } = {}) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t.slice(-2), { id, message, type, title }])
    setTimeout(() => dismiss(id), 3800)
  }, [dismiss])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6 md:top-auto md:items-end md:pr-6">
        <AnimatePresence>
          {toasts.map((t) => {
            const { icon: Icon, ring } = styles[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 !rounded-2xl p-4"
                role="status"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ring}`} />
                <div className="flex-1 text-sm">
                  {t.title && <p className="font-display font-semibold">{t.title}</p>}
                  <p className="text-muted">{t.message}</p>
                </div>
                <button onClick={() => dismiss(t.id)} className="text-muted hover:text-ink" aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
