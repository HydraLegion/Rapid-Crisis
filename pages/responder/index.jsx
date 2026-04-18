import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, Clock, Shield, MapPin, Phone, Eye, EyeOff, Lock } from 'lucide-react'
import useStore from '../../store/useStore'
import { SeverityPill, TYPE_META } from '../../components/shared/SeverityPill'

const VALID_TOKEN = 'RCR-2024-ALPHA'
const SESSION_MINS = 28

function CountdownTimer({ expiresAt }) {
  const [remaining, setRemaining] = useState('')
  const [expired, setExpired]     = useState(false)

  useEffect(() => {
    const tick = () => {
      const diff = expiresAt - Date.now()
      if (diff <= 0) { setRemaining('EXPIRED'); setExpired(true); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${m}:${String(s).padStart(2,'0')}`)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [expiresAt])

  return (
    <span
      className="mono fw-700"
      style={{ color: expired ? 'var(--color-crisis)' : remaining.startsWith('0:') ? 'var(--color-amber)' : 'var(--color-safe)' }}
      aria-live="polite"
      aria-label={`Session expires in ${remaining}`}
    >
      {remaining}
    </span>
  )
}

// ─── Token gate screen ────────────────────────────────────────────────────────
function TokenGate({ onAuth }) {
  const router  = useRouter()
  const [token, setToken] = useState(typeof window !== 'undefined' ? (router.query.token || '') : '')
  const [error, setError] = useState('')

  useEffect(() => {
    // Auto-fill from URL ?token=
    if (router.query.token) setToken(router.query.token)
  }, [router.query.token])

  useEffect(() => {
    // Check for expired token in URL
    if (router.query.expired) setError('This link has expired. Contact the incident commander for a new link.')
  }, [router.query.expired])

  const handleLogin = () => {
    if (!token.trim()) { setError('Please enter your access token.'); return }
    if (token.trim().toUpperCase() !== VALID_TOKEN) {
      setError('Invalid token. Contact the incident commander for a valid link.')
      return
    }
    onAuth({ token: token.trim(), expiresAt: Date.now() + SESSION_MINS * 60 * 1000 })
  }

  return (
    <div className="page" style={{ background:'#070710', minHeight:'100vh' }}>
      <div className="full-center">
        <div style={{ width:'100%', maxWidth:400 }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🔐</div>
            <h1 className="fw-800 text-2xl mb-1">First Responder Access</h1>
            <p className="text-secondary text-sm lh-normal">This portal is restricted to authorized emergency responders. Enter the time-limited token from your incident commander.</p>
          </div>

          {router.query.expired && (
            <div className="alert alert-crisis mb-4">
              <Lock size={16} style={{ color:'var(--color-crisis)', flexShrink:0 }} />
              <div className="text-sm fw-700" style={{ color:'var(--color-crisis)' }}>This link has expired. Contact the incident commander for a new access link.</div>
            </div>
          )}

          <div className="card card-pad mb-4">
            <div className="alert alert-amber mb-4">
              <Lock size={16} style={{ color:'var(--color-amber)', flexShrink:0 }} />
              <div className="text-sm">Secure channel · Session expires in {SESSION_MINS} minutes · All access is logged</div>
            </div>

            <div className="form-group mb-4">
              <label className="input-label" htmlFor="responder-token">Access Token</label>
              <input
                id="responder-token"
                type="text"
                className="input"
                placeholder="e.g., RCR-2024-ALPHA"
                value={token}
                onChange={e => { setToken(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoCapitalize="characters"
                autoComplete="off"
                aria-label="Enter responder access token"
              />
              {error && <div className="form-error">{error}</div>}
              <div className="form-hint">Demo token: <strong>RCR-2024-ALPHA</strong></div>
            </div>

            <button
              id="responder-login-btn"
              className="btn btn-amber btn-lg btn-full"
              onClick={handleLogin}
              aria-label="Access incident briefing"
            >
              <Shield size={16} /> Access Incident Briefing
            </button>
          </div>

          <div className="text-center text-tertiary text-xs lh-normal">
            All access is logged and attributable. Unauthorized access is a criminal offense.
          </div>

          <button className="btn btn-ghost btn-full mt-4" onClick={() => router.push('/')} aria-label="Return to home">← Return to Home</button>
        </div>
      </div>
    </div>
  )
}

// ─── Responder dashboard ──────────────────────────────────────────────────────
function ResponderDashboard({ session }) {
  const router   = useRouter()
  const incidents  = useStore(s => s.incidents)
  const properties = useStore(s => s.properties)
  const events     = useStore(s => s.events)

  const [tab, setTab] = useState('brief')
  const [pii, setPii] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)

  // Pick most critical active incident
  const incident = incidents.find(i => i.status !== 'resolved') || incidents[0]
  const property = incident ? properties.find(p => p.id === incident.propertyId) : properties[0]
  const incEvents = incident ? events.filter(e => e.incidentId === incident.id).sort((a,b) => b.createdAt - a.createdAt) : []

  useEffect(() => {
    if (!session.expiresAt) return
    const check = setInterval(() => {
      if (Date.now() >= session.expiresAt) {
        setSessionExpired(true)
        clearInterval(check)
      }
    }, 5000)
    return () => clearInterval(check)
  }, [session.expiresAt])

  if (sessionExpired) return (
    <div className="full-center" style={{ background:'#070710' }}>
      <div style={{ textAlign:'center', maxWidth:320 }}>
        <div style={{ fontSize:56, marginBottom:12 }}>⏰</div>
        <div className="fw-800 text-xl mb-2">Session Expired</div>
        <div className="text-secondary text-sm mb-4 lh-normal">Your access link has expired. Contact the incident commander for a new link.</div>
        <button className="btn btn-ghost btn-full" onClick={() => router.push('/responder?expired=1')}>← Get New Access Link</button>
      </div>
    </div>
  )

  if (!incident || !property) return (
    <div className="full-center" style={{ background:'#070710' }}>
      <div className="text-secondary text-sm">No active incident data available at this time.</div>
    </div>
  )

  const type = TYPE_META[incident.type] || TYPE_META.other

  return (
    <div className="page" style={{ background:'#070710' }}>
      {/* Topbar */}
      <header className="topbar" style={{ background:'rgba(255,102,0,0.1)', borderBottom:'1px solid rgba(255,159,10,0.2)', justifyContent:'space-between' }}>
        <div>
          <div className="fw-800 text-sm">First Responder View</div>
          <div className="text-xs fw-700 uppercase" style={{ color:'var(--color-amber)', letterSpacing:'0.04em' }}>RESTRICTED · NO PII BY DEFAULT</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div className="text-xs text-tertiary" style={{ marginBottom:2 }}>SESSION EXPIRES IN</div>
          <CountdownTimer expiresAt={session.expiresAt} />
        </div>
      </header>

      {/* Incident banner */}
      <div style={{ background:'linear-gradient(135deg,rgba(255,45,85,0.15),rgba(255,107,53,0.08))', borderBottom:'1px solid rgba(255,45,85,0.2)', padding:'12px 16px' }}>
        <div className="flex items-center gap-2 mb-1">
          <SeverityPill sev={incident.severity} />
          <span className="mono text-xs text-tertiary">{incident.id}</span>
        </div>
        <div className="fw-800 text-lg lh-tight">{type.label} — {incident.location}</div>
        <div className="text-sm text-secondary mt-1">📍 {incident.location} · 🏨 {property.name}</div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ paddingLeft:16 }}>
        {[['brief','📋 Brief'],['ingress','🚪 Ingress'],['hazards','⚠️ Hazards'],['updates','📡 Updates']].map(([id,label])=>(
          <button key={id} className={`tab ${tab===id?'active':''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <main style={{ flex:1, overflowY:'auto', padding:'16px' }}>

        {/* BRIEF */}
        {tab === 'brief' && (
          <div className="flex-col gap-4 animate-fade-in">
            {/* Property address */}
            <div className="card card-elevated card-pad-lg">
              <div className="text-xs text-tertiary fw-700 uppercase mb-2">Property Address</div>
              <div className="fw-800 text-xl lh-tight mb-1">{property.name}</div>
              <div className="text-secondary text-sm lh-normal mb-4">{property.address}</div>
              <div className="flex gap-2">
                <button className="btn btn-crisis flex-1" onClick={() => { if(typeof window!=='undefined') window.location.href=`tel:${property.phone}` }} aria-label={`Call ${property.name}`}><Phone size={14} /> Call Hotel</button>
                <button className="btn btn-ghost flex-1" onClick={() => { if(typeof window!=='undefined') window.open(`https://maps.google.com/?q=${encodeURIComponent(property.address)}`, '_blank') }} aria-label="Open in Maps"><MapPin size={14} /> Open Maps</button>
              </div>
            </div>

            {/* Incident summary */}
            <div className="card card-pad">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs text-tertiary fw-700 uppercase">Incident Summary</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setPii(v=>!v)} aria-label={pii?'Hide personal information':'Show personal information'} style={{ gap:4 }}>
                  {pii ? <><EyeOff size={12} /> Hide PII</> : <><Eye size={12} /> View PII</>}
                </button>
              </div>
              {[
                { label:'Type', value: type.label },
                { label:'Severity', value: incident.severity },
                { label:'Location', value: incident.location },
                { label:'Reported', value: new Date(incident.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) },
                { label:'Status', value: incident.status },
                { label:'Guest Info', value: pii ? 'Information available — handle per privacy law' : '[PII HIDDEN — tap View PII to reveal]', sensitive: true },
              ].map(row => (
                <div key={row.label} className="flex gap-3" style={{ padding:'8px 0', borderBottom:'1px solid var(--border-subtle)' }}>
                  <span className="text-xs text-tertiary fw-600" style={{ minWidth:80, flexShrink:0 }}>{row.label}</span>
                  <span className="text-xs text-secondary fw-500" style={{ color: row.sensitive && pii ? 'var(--color-amber)' : undefined }}>{row.value}</span>
                </div>
              ))}
              {pii && (
                <div className="alert alert-amber mt-3">
                  <AlertTriangle size={14} style={{ color:'var(--color-amber)', flexShrink:0 }} />
                  <span className="text-xs">PII access logged. Handle per applicable privacy laws. Do not retain after session.</span>
                </div>
              )}
            </div>

            {/* Incident commander */}
            <div className="card card-pad">
              <div className="text-xs text-tertiary fw-700 uppercase mb-3">Incident Commander</div>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#0A84FF,#BF5AF2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14 }}>PS</div>
                <div>
                  <div className="fw-700 text-sm">Priya Singh</div>
                  <div className="text-xs text-tertiary">Manager on Duty · {property.name}</div>
                </div>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => { if(typeof window!=='undefined') window.location.href='tel:+919876522002' }} aria-label="Call incident commander">
                <Phone size={14} /> Call Commander
              </button>
            </div>
          </div>
        )}

        {/* INGRESS */}
        {tab === 'ingress' && (
          <div className="flex-col gap-4 animate-fade-in">
            <div className="card card-pad" style={{ textAlign:'center', background:'var(--bg-glass)', padding:'20px', borderRadius:'var(--r-xl)', position:'relative', minHeight:180, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize:'32px 32px', borderRadius:'var(--r-xl)' }} />
              <div style={{ zIndex:1 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🗺️</div>
                <div className="text-sm text-secondary">Floor Plan — {property.name}</div>
                <div className="text-xs text-tertiary mt-1">Interactive map — tap ingress points below</div>
              </div>
            </div>
            {[
              { title:'🚗 Vehicle Access', items:['Main gate: Marine Drive entrance — gate code provided by commander','Emergency vehicle lane: Reserved lane with yellow markings','Drop-off bay: 20m past security booth on left'] },
              { title:'🚶 Pedestrian Ingress', items:['Main lobby: Revolving door on Marine Drive','Emergency elevator: Use commander-provided key card','Stairwell to Floor 12: Take main stairwell, turn left at Floor 12'] },
              { title:'🛗 Elevator Notes', items:['Elevator 2 secured for responder use only','Opens directly at Floor 12 corridor near 1200–1210','Staff meets responders at elevator bay'] },
            ].map(s => (
              <div key={s.title} className="card card-pad">
                <div className="fw-700 mb-2">{s.title}</div>
                {s.items.map((item, i) => (
                  <div key={i} className="text-sm text-secondary lh-normal" style={{ padding:'6px 0', borderBottom: i < s.items.length-1 ? '1px solid var(--border-subtle)' : 'none' }}>• {item}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* HAZARDS */}
        {tab === 'hazards' && (
          <div className="flex-col gap-3 animate-fade-in">
            <div className="alert alert-crisis">
              <AlertTriangle size={16} style={{ color:'var(--color-crisis)', flexShrink:0 }} />
              <div><div className="fw-700 text-sm">Review all hazards before entry</div><div className="text-xs">Updated in real-time from property system</div></div>
            </div>
            {[
              { level:'HIGH', icon:'⚡', title:'Elevator 2 Out of Service', desc:'Use Elevators 1 or 3 for emergency access. Do not use Elevator 2.' },
              { level:'MED',  icon:'🔄', title:'Kitchen Ventilation — Level B1', desc:'Smoke from controlled fryer incident (resolved). Avoid B1 kitchen. Ventilation ongoing.' },
              { level:'LOW',  icon:'🔧', title:'Sprinkler Testing — Floor 15', desc:'Scheduled maintenance. Not related to current incident.' },
              { level:'INFO', icon:'👥', title:'High Occupancy — 94%', desc:'Expect high foot traffic in lobby and corridors.' },
            ].map((h, i) => (
              <div key={i} className="card card-pad" style={{ borderColor: h.level==='HIGH'?'rgba(255,45,85,0.3)':h.level==='MED'?'rgba(255,159,10,0.3)':'var(--border-subtle)' }}>
                <div className="flex items-start gap-3">
                  <div style={{ fontSize:24, flexShrink:0 }}>{h.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${h.level==='HIGH'?'badge-crisis':h.level==='MED'?'badge-amber':'badge-muted'}`}>{h.level}</span>
                      <span className="fw-700 text-sm">{h.title}</span>
                    </div>
                    <div className="text-xs text-secondary lh-normal">{h.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIVE UPDATES */}
        {tab === 'updates' && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-3 text-xs text-tertiary">
              <div className="live-dot live-dot-crisis" style={{ width:6, height:6 }} />
              LIVE UPDATES — refreshes every 30 seconds
            </div>
            {incEvents.length === 0 && <div className="empty-state"><div style={{ fontSize:32 }}>📋</div><div className="text-secondary text-sm">No events logged yet.</div></div>}
            {incEvents.map(ev => (
              <div key={ev.id} className="card card-pad mb-2">
                <div className="text-sm fw-500 lh-normal mb-1">{ev.message}</div>
                <div className="text-xs text-tertiary flex gap-2">
                  <span>{new Date(ev.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' })}</span>
                  <span>·</span><span>{ev.actor}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResponderPage() {
  const [session, setSession] = useState(null)

  return (
    <>
      <Head>
        <title>First Responder — Rapid Crisis Response</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      {session
        ? <ResponderDashboard session={session} />
        : <TokenGate onAuth={setSession} />}
    </>
  )
}
