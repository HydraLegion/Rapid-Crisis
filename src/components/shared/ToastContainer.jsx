import { X, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react'

const ICONS = {
  crisis: AlertTriangle,
  success: CheckCircle,
  info: Info,
  warning: Zap,
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type] || Info
        return (
          <div
            key={toast.id}
            className={`toast toast-${toast.type === 'crisis' ? 'crisis' : toast.type === 'success' ? 'safe' : 'amber'}`}
            role="alert"
            aria-live="assertive"
          >
            <div style={{ flexShrink: 0, fontSize: 20 }}>
              {toast.icon || <Icon size={18} />}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm mb-1">{toast.title}</div>
              <div className="text-xs text-secondary">{toast.message}</div>
            </div>
            <button
              className="btn btn-icon-sm btn-ghost flex-shrink-0"
              onClick={() => onRemove(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
