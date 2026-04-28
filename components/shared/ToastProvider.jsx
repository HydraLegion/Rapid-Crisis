import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Info, X, Zap } from 'lucide-react'

const ToastCtx = createContext(null)

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const ICONS = {
  success: <CheckCircle size={18} style={{ color: 'var(--color-safe)', flexShrink: 0 }} />,
  crisis:  <Zap size={18} style={{ color: 'var(--color-crisis)', flexShrink: 0 }} />,
  info:    <Info size={18} style={{ color: 'var(--color-blue)', flexShrink: 0 }} />,
  warning: <AlertTriangle size={18} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />,
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', title, message, duration = 4500 }) => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, type, title, message }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration)
  }, [])

  const remove = (id) => setToasts(p => p.filter(t => t.id !== id))

  return (
    <ToastCtx.Provider value={addToast}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} role="alert">
            {ICONS[t.type] || ICONS.info}
            <div style={{ flex: 1, minWidth: 0 }}>
              {t.title && <div className="fw-700 text-sm">{t.title}</div>}
              {t.message && <div className="text-xs text-secondary mt-1" style={{ lineHeight: 1.5 }}>{t.message}</div>}
            </div>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
              className="btn btn-icon-sm btn-ghost"
              style={{ flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
