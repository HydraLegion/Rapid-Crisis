import { useNavigate } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(255,45,85,0.08) 0%, transparent 60%), var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
        {/* Big 404 */}
        <div
          style={{
            fontSize: 'clamp(5rem, 20vw, 8rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, var(--color-crisis), rgba(255,45,85,0.3))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 'var(--space-2)',
          }}
        >
          404
        </div>

        <div style={{
          width: 64, height: 64, borderRadius: 'var(--radius-xl)',
          background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-5)',
          boxShadow: '0 0 32px rgba(255,45,85,0.1)',
        }}>
          <AlertTriangle size={28} style={{ color: 'var(--color-crisis)' }} />
        </div>

        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 var(--space-3)' }}>
          Page Not Found
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>
          This page doesn't exist or the link may have expired.
          If you're responding to an emergency, please use the main entry points below.
        </p>

        {/* Quick links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          {[
            { label: '🆘 Guest SOS', path: '/guest', desc: 'Report an emergency — no login needed', color: 'var(--color-crisis)' },
            { label: '👮 Staff Dashboard', path: '/staff/login', desc: 'For hotel staff and security', color: 'var(--color-blue)' },
            { label: '🚒 First Responder', path: '/responder', desc: 'Emergency services access', color: 'var(--color-amber)' },
          ].map(link => (
            <button
              key={link.path}
              className="glass-card"
              onClick={() => navigate(link.path)}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                textAlign: 'left',
                width: '100%',
                border: '1px solid var(--border-subtle)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = link.color + '50'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{link.label.split(' ')[0]}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{link.label.slice(3)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{link.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          className="btn btn-ghost"
          onClick={() => navigate('/')}
          style={{ gap: 8 }}
          id="back-home-404"
        >
          <Home size={15} />
          Back to Home
        </button>

        <div style={{ marginTop: 'var(--space-6)', fontSize: 11, color: 'var(--text-tertiary)' }}>
          In a life-threatening emergency, call <strong style={{ color: 'var(--color-crisis)' }}>112</strong> immediately
        </div>
      </div>
    </div>
  )
}
