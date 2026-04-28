import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer }) {
  // Trap keyboard focus + close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-handle" role="none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="fw-800 text-lg">{title}</span>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="btn btn-icon-sm btn-ghost"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>

        {/* Footer */}
        {footer && <div className="mt-4 flex flex-col gap-2">{footer}</div>}
      </div>
    </div>
  )
}
