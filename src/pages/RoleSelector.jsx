import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Building2, Radio, ChevronRight, Clock, Activity, Globe } from 'lucide-react'

// Route map: each role id maps to its entry URL
const ROUTE_MAP = {
  guest:     '/guest',
  staff:     '/staff/login',
  command:   '/command/login',
  responder: '/responder',
}

const ROLES = [
  {
    id: 'guest',
    icon: '🆘',
    label: 'Guest SOS',
    subtitle: 'Report an emergency or request help',
    description: 'Quick access for guests to report incidents, request assistance, or get safety information.',
    color: '#FF2D55',
    gradient: 'linear-gradient(135deg, rgba(255,45,85,0.2), rgba(199,33,63,0.1))',
    border: 'rgba(255,45,85,0.35)',
    badge: 'No login required',
    badgeStyle: 'badge-crisis',
    recommended: true,
  },
  {
    id: 'staff',
    icon: '👮',
    label: 'Staff Dashboard',
    subtitle: 'Security · Front Desk · Housekeeping',
    description: 'Incident management, task checklists, team coordination, and floor plan navigation.',
    color: '#0A84FF',
    gradient: 'linear-gradient(135deg, rgba(10,132,255,0.15), rgba(0,102,204,0.08))',
    border: 'rgba(10,132,255,0.3)',
    badge: 'Role-based access',
    badgeStyle: 'badge-blue',
    recommended: false,
  },
  {
    id: 'command',
    icon: '🏢',
    label: 'Command Center',
    subtitle: 'Manager · Corporate · Multi-property',
    description: 'Multi-property overview, broadcast alerts, analytics, postmortems, and playbook management.',
    color: '#BF5AF2',
    gradient: 'linear-gradient(135deg, rgba(191,90,242,0.15), rgba(140,60,190,0.08))',
    border: 'rgba(191,90,242,0.3)',
    badge: 'Manager + Corporate',
    badgeStyle: 'badge-purple',
    recommended: false,
  },
  {
    id: 'responder',
    icon: '🚒',
    label: 'First Responder',
    subtitle: 'Emergency services limited view',
    description: 'Secure time-limited view with address, ingress routes, hazards, and live incident updates.',
    color: '#FF9F0A',
    gradient: 'linear-gradient(135deg, rgba(255,159,10,0.15), rgba(204,127,8,0.08))',
    border: 'rgba(255,159,10,0.3)',
    badge: 'First Responders only',
    badgeStyle: 'badge-amber',
    recommended: false,
  },
]

const LIVE_STATS = [
  { label: 'Active Incidents', value: '3',     icon: Activity,   color: 'var(--color-crisis)' },
  { label: 'Properties Live',  value: '4',     icon: Building2,  color: 'var(--color-blue)' },
  { label: 'Avg Response',     value: '2m 6s', icon: Clock,      color: 'var(--color-safe)' },
  { label: 'Staff On Duty',    value: '48',    icon: Shield,     color: 'var(--color-purple)' },
]

export default function RoleSelector() {
  const navigate     = useNavigate()
  const [hovered, setHovered] = useState(null)

  const handleSelect = (roleId) => navigate(ROUTE_MAP[roleId])

  return (
    <div className="bg-animated min-h-screen flex flex-col" style={{ padding: '0 0 40px' }}>
      {/* Header */}
      <header
        className="topbar"
        style={{ justifyContent: 'space-between', background: 'transparent', backdropFilter: 'none', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="logo-mark">
          <div className="logo-icon">🛡️</div>
          <div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, letterSpacing: '-0.03em' }}>Rapid Crisis Response</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 400, letterSpacing: '0.02em' }}>
              Hospitality Emergency Platform
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="live-dot animate-pulse-crisis" />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
            SYSTEM LIVE
          </span>
          <Globe size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>EN · IN</span>
        </div>
      </header>

      {/* Hero */}
      <div className="text-center" style={{ padding: '60px 24px 32px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        <div className="badge badge-crisis mb-4 animate-fade-in" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <div className="live-dot live-dot-crisis" style={{ width: 6, height: 6 }} />
          MULTI-PROPERTY OPERATIONS — 4 PROPERTIES LIVE
        </div>

        <h1
          className="animate-fade-in-up"
          style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 'var(--space-4)' }}
        >
          Crisis Response,{' '}
          <span style={{ color: 'var(--color-crisis)' }}>Seconds Matter.</span>
        </h1>

        <p
          className="animate-fade-in-up delay-1"
          style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}
        >
          AI-powered incident detection, reporting, and coordination for hospitality venues.
          Select your role to access the right tools.
        </p>

        {/* Live Stats Bar */}
        <div
          className="glass-card animate-fade-in-up delay-2"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}
        >
          {LIVE_STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                style={{ padding: 'var(--space-4)', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}
              >
                <Icon size={16} style={{ color: stat.color, margin: '0 auto 4px' }} />
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Role Cards */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
        {ROLES.map((role, i) => (
          <div
            key={role.id}
            className={`role-card animate-fade-in-up delay-${i + 2}`}
            style={{
              background: hovered === role.id ? role.gradient : 'var(--bg-glass)',
              borderColor: hovered === role.id ? role.border : 'var(--border-subtle)',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() => handleSelect(role.id)}
            onMouseEnter={() => setHovered(role.id)}
            onMouseLeave={() => setHovered(null)}
            role="button"
            tabIndex={0}
            aria-label={`Enter as ${role.label}`}
            onKeyDown={(e) => e.key === 'Enter' && handleSelect(role.id)}
          >
            {role.recommended && (
              <div style={{
                position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--color-crisis)', color: 'white', fontSize: 9, fontWeight: 800,
                padding: '3px 10px', borderRadius: 'var(--radius-full)', letterSpacing: '0.06em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>
                GUEST ENTRY POINT
              </div>
            )}

            <div
              className="role-icon"
              style={{
                background: hovered === role.id ? `rgba(${role.color}, 0.1)` : 'var(--bg-glass-active)',
                fontSize: 28, borderRadius: 'var(--radius-xl)', transition: 'all var(--transition-base)',
                boxShadow: hovered === role.id ? `0 0 24px ${role.color}40` : 'none',
              }}
            >
              {role.icon}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.02em', marginBottom: 2 }}>{role.label}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500 }}>{role.subtitle}</div>
            </div>

            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{role.description}</div>

            <div className="flex items-center justify-between w-full mt-2">
              <span className={`badge ${role.badgeStyle}`}>{role.badge}</span>
              <ChevronRight size={16} style={{ color: hovered === role.id ? role.color : 'var(--text-tertiary)', transition: 'all var(--transition-fast)', transform: hovered === role.id ? 'translateX(4px)' : 'none' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center animate-fade-in" style={{ marginTop: 'var(--space-12)', padding: '0 24px' }}>
        <div className="flex items-center justify-center gap-6 flex-wrap" style={{ marginBottom: 'var(--space-3)' }}>
          {['🔒 End-to-End Encrypted', '📵 Offline Resilient', '♿ WCAG 2.1 AA', '🌐 Multilingual Ready', '⚡ < 1s Response Bootstrap'].map(text => (
            <span key={text} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500 }}>{text}</span>
          ))}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          Rapid Crisis Response v2.4.0 · India Operations · Emergency: 112 · Police: 100 · Ambulance: 108
        </div>
      </div>
    </div>
  )
}
