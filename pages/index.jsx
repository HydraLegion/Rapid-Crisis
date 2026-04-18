import Head from 'next/head'
import Link from 'next/link'
import { Activity, Building2, Clock, Shield, ChevronRight, Globe } from 'lucide-react'

const ROLES = [
  {
    href: '/guest',
    icon: '🆘',
    label: 'Guest SOS',
    sub: 'Report an emergency · No login required',
    desc: 'One tap to alert security and get help fast. Silent mode available.',
    color: '#FF2D55',
    gradient: 'linear-gradient(135deg,rgba(255,45,85,0.2),rgba(199,33,63,0.08))',
    border: 'rgba(255,45,85,0.4)',
    badge: 'No login required',
    badgeCls: 'badge-crisis',
    primary: true,
  },
  {
    href: '/staff/login',
    icon: '👮',
    label: 'Staff Dashboard',
    sub: 'Security · Front Desk · Housekeeping',
    desc: 'Incident feed, task checklists, team coordination, and floor maps.',
    color: '#0A84FF',
    gradient: 'linear-gradient(135deg,rgba(10,132,255,0.15),rgba(0,102,204,0.06))',
    border: 'rgba(10,132,255,0.3)',
    badge: 'Role-based access',
    badgeCls: 'badge-blue',
  },
  {
    href: '/command/login',
    icon: '🏢',
    label: 'Command Center',
    sub: 'Manager · Corporate · Multi-property',
    desc: 'Property overview, broadcast alerts, analytics, and postmortems.',
    color: '#BF5AF2',
    gradient: 'linear-gradient(135deg,rgba(191,90,242,0.15),rgba(140,60,190,0.06))',
    border: 'rgba(191,90,242,0.3)',
    badge: 'Manager access',
    badgeCls: 'badge-purple',
  },
  {
    href: '/responder',
    icon: '🚒',
    label: 'First Responder',
    sub: 'Emergency services limited view',
    desc: 'Secure time-limited view with address, hazards, and live updates.',
    color: '#FF9F0A',
    gradient: 'linear-gradient(135deg,rgba(255,159,10,0.15),rgba(204,127,8,0.06))',
    border: 'rgba(255,159,10,0.3)',
    badge: 'Token required',
    badgeCls: 'badge-amber',
  },
]

const STATS = [
  { label: 'Active', value: '3', icon: Activity, color: 'var(--color-crisis)' },
  { label: 'Properties', value: '4', icon: Building2, color: 'var(--color-blue)' },
  { label: 'Avg Response', value: '2m', icon: Clock, color: 'var(--color-safe)' },
  { label: 'On Duty', value: '48', icon: Shield, color: 'var(--color-purple)' },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>Rapid Crisis Response — Hospitality Emergency Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="page bg-animated">
        {/* Topbar */}
        <header className="topbar" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="topbar-brand">
            <div className="logo-icon">🛡️</div>
            <div>
              <div>Rapid Crisis Response</div>
              <div className="text-xs text-tertiary fw-400">Hospitality Emergency Platform</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="live-dot" />
            <span className="text-xs fw-700 text-safe uppercase" style={{ letterSpacing:'0.06em' }}>LIVE</span>
            <Globe size={14} style={{ color:'var(--text-tertiary)' }} />
          </div>
        </header>

        <main>
          {/* Hero */}
          <div className="container" style={{ paddingTop: 40, paddingBottom: 24 }}>
            <div className="badge badge-crisis mb-3 animate-fade-in" style={{ display:'inline-flex', gap:6, alignItems:'center' }}>
              <div className="live-dot live-dot-crisis" style={{ width:6,height:6 }} />
              4 PROPERTIES · LIVE MONITORING ACTIVE
            </div>
            <h1
              className="animate-fade-in-up"
              style={{ fontSize:'clamp(1.75rem,6vw,2.75rem)', fontWeight:900, lineHeight:1.1, letterSpacing:'-0.04em', marginBottom:12 }}
            >
              Crisis Response,{' '}
              <span style={{ color:'var(--color-crisis)' }}>Seconds Matter.</span>
            </h1>
            <p className="text-secondary lh-normal" style={{ fontSize:15, maxWidth:480 }}>
              AI-powered incident detection and coordination for hospitality venues. Select your role.
            </p>

            {/* Stats bar */}
            <div className="card" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', marginTop:24, overflow:'hidden' }}>
              {STATS.map((s, i) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    style={{ padding:'12px 8px', textAlign:'center', borderRight: i<3 ? '1px solid var(--border-subtle)' : 'none' }}
                  >
                    <Icon size={14} style={{ color:s.color, margin:'0 auto 4px' }} />
                    <div className="fw-900 text-xl" style={{ color:s.color, letterSpacing:'-0.03em' }}>{s.value}</div>
                    <div className="text-xs text-tertiary fw-600 uppercase">{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Guest SOS — Primary CTA (full width, prominent) */}
          <div className="container" style={{ marginBottom: 16 }}>
            <Link href={ROLES[0].href} style={{ display:'block', textDecoration:'none' }}>
              <div
                className="role-card animate-fade-in-up"
                style={{
                  background: ROLES[0].gradient,
                  border: `2px solid ${ROLES[0].border}`,
                  boxShadow: `0 0 40px rgba(255,45,85,0.15)`,
                  position:'relative',
                  overflow:'hidden',
                }}
              >
                <div style={{ position:'absolute', top:-10, right:-10, width:120, height:120, borderRadius:'50%', background:'rgba(255,45,85,0.08)', pointerEvents:'none' }} />
                <div className="flex items-center gap-3">
                  <div style={{ fontSize:40 }}>🆘</div>
                  <div style={{ flex:1 }}>
                    <div className="fw-900 text-xl lh-tight">Guest SOS</div>
                    <div className="text-sm text-secondary mt-1">{ROLES[0].sub}</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <span className="badge badge-crisis">No login needed</span>
                    <ChevronRight size={20} style={{ color:'var(--color-crisis)', display:'block', margin:'4px auto 0' }} />
                  </div>
                </div>
                <div className="text-sm text-secondary lh-normal">{ROLES[0].desc}</div>
                <div className="alert alert-crisis mt-2">
                  <span style={{ fontSize:14 }}>🔴</span>
                  <span className="text-sm fw-700" style={{ color:'var(--color-crisis)' }}>
                    Tap here if you need immediate help · Silent mode available
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Other roles */}
          <div className="container" style={{ display:'grid', gap:12, gridTemplateColumns:'1fr', marginBottom:40 }}>
            {ROLES.slice(1).map((role) => (
              <Link key={role.href} href={role.href} style={{ display:'block', textDecoration:'none' }}>
                <div
                  className="role-card"
                  style={{ background: role.gradient, border:`1px solid ${role.border}` }}
                >
                  <div className="flex items-center gap-3">
                    <div style={{ fontSize:32 }}>{role.icon}</div>
                    <div style={{ flex:1 }}>
                      <div className="fw-800 text-base">{role.label}</div>
                      <div className="text-xs text-tertiary mt-1">{role.sub}</div>
                    </div>
                    <div>
                      <span className={`badge ${role.badgeCls}`}>{role.badge}</span>
                      <ChevronRight size={16} style={{ color:'var(--text-tertiary)', display:'block', margin:'4px auto 0' }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center text-tertiary text-xs" style={{ padding:'0 16px 32px', lineHeight:2 }}>
            <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap', marginBottom:8 }}>
              {['🔒 Encrypted','📵 Offline Resilient','♿ WCAG 2.1 AA','⚡ &lt;1s Bootstrap'].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
            Emergency: <strong style={{ color:'var(--color-crisis)' }}>112</strong> · Police: 100 · Ambulance: 108
          </div>
        </main>
      </div>
    </>
  )
}
