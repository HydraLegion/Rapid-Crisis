import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, Shield, MapPin, AlertTriangle, Phone, Radio, ChevronDown, Lock, Eye, EyeOff } from 'lucide-react'
import { MOCK_INCIDENTS } from '../data/mockData'

function TimeLeft({ expiresAt }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = expiresAt - Date.now()
      if (diff <= 0) { setRemaining('EXPIRED'); return }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setRemaining(`${mins}m ${secs}s`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: remaining === 'EXPIRED' ? 'var(--color-crisis)' : 'var(--color-amber)' }}>{remaining}</span>
}

export default function ResponderView({ onBack, isOnline }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [token, setToken] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [incident] = useState(MOCK_INCIDENTS[0])
  const [piiRevealed, setPiiRevealed] = useState(false)
  const [activeSection, setActiveSection] = useState('brief')
  const [expiresAt] = useState(Date.now() + 28 * 60 * 1000) // 28 minutes from now

  const VALID_TOKEN = 'RCR-2024-ALPHA'

  const handleLogin = () => {
    if (token.toUpperCase() === VALID_TOKEN) {
      setAuthenticated(true)
      setTokenError('')
    } else {
      setTokenError('Invalid access token. Contact the incident commander.')
    }
  }

  if (!authenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070710',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
        }}
      >
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 'var(--space-4)' }}>🔐</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 'var(--space-2)' }}>
            First Responder Access
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
            This portal is restricted to authorized emergency responders only. Enter the time-limited token provided by the incident commander.
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
            <div className="alert-banner alert-banner-amber" style={{ marginBottom: 'var(--space-4)' }}>
              <Lock size={16} style={{ flexShrink: 0, color: 'var(--color-amber)' }} />
              <div className="text-sm">Secure channel · No guest PII visible by default · Session expires automatically</div>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Access Token</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., RCR-2024-ALPHA"
                value={token}
                onChange={e => { setToken(e.target.value); setTokenError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                aria-label="Enter responder access token"
                autoCapitalize="characters"
                autoComplete="off"
                id="responder-token-input"
              />
              {tokenError && <div className="form-error">{tokenError}</div>}
              <div className="form-hint">Hint: Try RCR-2024-ALPHA (demo)</div>
            </div>

            <button className="btn btn-amber btn-lg w-full" onClick={handleLogin} id="responder-login-btn">
              <Shield size={16} />
              Access Incident Briefing
            </button>
          </div>

          <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            All access is logged and attributable. Unauthorized access is a criminal offense.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#070710', minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div className="topbar" style={{ justifyContent: 'space-between', background: 'rgba(255, 102, 0, 0.1)', borderBottom: '1px solid rgba(255,159,10,0.2)' }}>
        <div className="flex items-center gap-2">
          <button className="btn btn-icon btn-ghost" onClick={onBack}><ArrowLeft size={16} /></button>
          <div>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)' }}>First Responder View</div>
            <div style={{ fontSize: 10, color: 'var(--color-amber)', fontWeight: 700, letterSpacing: '0.04em' }}>
              RESTRICTED · NO PII BY DEFAULT
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>SESSION EXPIRES IN</div>
          <TimeLeft expiresAt={expiresAt} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Incident Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255,45,85,0.15), rgba(255,107,53,0.08))',
            borderBottom: '1px solid rgba(255,45,85,0.2)',
            padding: 'var(--space-4) var(--space-5)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="badge sev-s0" style={{ animation: 'pulseCrisis 2s infinite' }}>S0 · CRITICAL</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>{incident.id}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', lineHeight: 1.3, marginBottom: 4 }}>
            {incident.title}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            📍 {incident.location} · 🏨 {incident.property}
          </div>
        </div>

        {/* Sections */}
        <div className="tabs" style={{ paddingLeft: 'var(--space-4)', flexShrink: 0 }}>
          {['brief', 'ingress', 'hazards', 'updates'].map(s => (
            <button key={s} className={`tab ${activeSection === s ? 'active' : ''}`} onClick={() => setActiveSection(s)}>
              {{ brief: '📋 Brief', ingress: '🚪 Ingress', hazards: '⚠️ Hazards', updates: '📡 Live Updates' }[s]}
            </button>
          ))}
        </div>

        <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {activeSection === 'brief' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Address Card */}
              <div className="glass-card-elevated" style={{ padding: 'var(--space-5)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                  Property Address
                </div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', letterSpacing: '-0.02em', marginBottom: 'var(--space-1)' }}>
                  The Grand Meridian
                </div>
                <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  14, Marine Drive, Nariman Point<br />
                  Mumbai, Maharashtra 400 021<br />
                  India
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-crisis flex-1">
                    <Phone size={14} />
                    Call Hotel: +91-22-6600-7700
                  </button>
                  <button className="btn btn-ghost flex-1">
                    <MapPin size={14} />
                    Open Maps
                  </button>
                </div>
              </div>

              {/* Incident Commander Contact */}
              <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-3)' }}>
                  Incident Commander
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="avatar">PS</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Priya Singh</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Manager on Duty · The Grand Meridian</div>
                  </div>
                </div>
                <button className="btn btn-primary w-full">
                  <Phone size={14} />
                  Call Commander: +91-98765-22002
                </button>
              </div>

              {/* Incident Summary (no PII by default) */}
              <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-center mb-3">
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Incident Brief
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPiiRevealed(v => !v)}
                    style={{ fontSize: 'var(--text-xs)', gap: 4 }}
                  >
                    {piiRevealed ? <><EyeOff size={12} /> Hide PII</> : <><Eye size={12} /> View PII</>}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {[
                    { label: 'Type', value: 'Medical Emergency — Chest Pain / Cardiac Suspected' },
                    { label: 'Location', value: 'Room 1204, Floor 12, Tower A' },
                    { label: 'Reported At', value: `${new Date(Date.now() - 4*60000).toLocaleTimeString()} (4 min ago)` },
                    { label: 'Severity', value: 'S0 — Critical / Life Threatening' },
                    { label: 'Guest Info', value: piiRevealed ? 'Male, ~67 years, known cardiac history (per PMS record)' : '[ PII HIDDEN — tap View PII to reveal ]' },
                    { label: 'Current Status', value: 'Staff on-scene, AED ready, awaiting paramedics' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, minWidth: 90, flexShrink: 0 }}>{item.label}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: piiRevealed && item.label === 'Guest Info' ? 'var(--color-amber)' : 'var(--text-secondary)', fontWeight: item.label === 'Guest Info' && !piiRevealed ? 400 : 500 }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {piiRevealed && (
                  <div className="alert-banner alert-banner-amber" style={{ marginTop: 'var(--space-3)' }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, color: 'var(--color-amber)' }} />
                    <span className="text-xs">PII access logged. You are responsible for handling this data per applicable laws. Do not share or retain beyond this session.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'ingress' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Map */}
              <div className="map-placeholder" style={{ height: 220, borderRadius: 'var(--radius-xl)', flexDirection: 'column' }}>
                <div className="map-grid-bg" />
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', zIndex: 1 }}>Facility Floor Plan — Floor 12</div>
                <div style={{ position: 'absolute', top: '35%', left: '60%' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-crisis)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, animation: 'pulseCrisis 2s infinite' }}>🆘</div>
                </div>
                <div style={{ position: 'absolute', bottom: 40, right: 40, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ background: 'var(--color-safe)', borderRadius: 4, padding: '2px 6px', fontSize: 9, color: 'white', fontWeight: 700 }}>MAIN ENTRANCE →</div>
                </div>
              </div>

              {[
                {
                  title: '🚗 Vehicle Access',
                  items: [
                    'Main gate: Marine Drive entrance — Gate code 4421 (provided by commander)',
                    'Drop-off bay: 20m past the security booth on the left',
                    'Emergency vehicle parkway: Reserved lane marked with yellow stripes',
                  ],
                },
                {
                  title: '🚶 Pedestrian Ingress',
                  items: [
                    'Lobby entrance: Main revolving door on Marine Drive',
                    'Emergency elevator: Staff elevator — use key card (provided by management)',
                    'Stairwell to Floor 12: Take main stairwell from lobby, turn left at Floor 12',
                  ],
                },
                {
                  title: '🛗 Elevator Info',
                  items: [
                    'Emergency elevator secured for responder use — do not allow guest access',
                    'Elevator opens directly at Floor 12 corridor near Room 1200-1210',
                    'Staff member will meet responders at elevator bay',
                  ],
                },
              ].map(section => (
                <div key={section.title} className="glass-card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>{section.title}</div>
                  {section.items.map((item, i) => (
                    <div key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, paddingBottom: 6, borderBottom: i < section.items.length - 1 ? '1px solid var(--border-subtle)' : 'none', marginBottom: 6 }}>
                      • {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeSection === 'hazards' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="alert-banner alert-banner-crisis">
                <AlertTriangle size={16} style={{ flexShrink: 0, color: 'var(--color-crisis)' }} />
                <div>
                  <div className="font-bold text-sm">Review all hazards before entry</div>
                  <div className="text-xs">Updated in real-time from property management system</div>
                </div>
              </div>

              {[
                { level: 'HIGH', icon: '⚡', title: 'Elevator Out of Service — Lift 2', desc: 'Elevator 2 is currently under maintenance. Use Elevator 1 or 3 for emergency access.' },
                { level: 'MED', icon: '🔄', title: 'Kitchen Ventilation — Level B1', desc: 'Active smoke from controlled fryer incident (resolved). Avoid B1 kitchen area. Ventilation ongoing.' },
                { level: 'LOW', icon: '🔧', title: 'Fire Suppression System — Testing', desc: 'Scheduled maintenance on floor 15 sprinklers. Not related to current incident.' },
                { level: 'INFO', icon: '👥', title: 'High Occupancy', desc: 'Property at 94% occupancy. Expect high foot traffic in lobby and corridors.' },
              ].map((hazard, i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{
                    padding: 'var(--space-4)',
                    borderColor: hazard.level === 'HIGH' ? 'rgba(255,45,85,0.3)' : hazard.level === 'MED' ? 'rgba(255,159,10,0.3)' : 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div style={{ fontSize: 24, flexShrink: 0 }}>{hazard.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`badge ${hazard.level === 'HIGH' ? 'badge-crisis' : hazard.level === 'MED' ? 'badge-amber' : 'badge-muted'}`}>
                          {hazard.level}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{hazard.title}</span>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{hazard.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'updates' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="live-dot animate-pulse-crisis" style={{ width: 6, height: 6 }} />
                LIVE UPDATES — Auto-refreshes every 30 seconds
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {incident.timeline.map((event, i) => (
                  <div key={i} className={`glass-card animate-fade-in delay-${i + 1}`} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 4 }}>{event.event}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', gap: 8 }}>
                      <span>
                        {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span>·</span>
                      <span>{event.actor}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-ghost w-full">
                <Radio size={14} />
                Contact Incident Commander via Radio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
