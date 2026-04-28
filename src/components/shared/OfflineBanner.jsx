import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  return (
    <div
      className="status-bar-offline"
      role="alert"
      aria-live="polite"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
    >
      <WifiOff size={12} />
      NO NETWORK — OFFLINE MODE ACTIVE · SMS FALLBACK ENABLED · DATA QUEUED FOR SYNC
    </div>
  )
}
