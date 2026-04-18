import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { ArrowLeft, Send, BarChart2, Building2, Radio, Eye, EyeOff } from 'lucide-react'
import useStore from '../../store/useStore'
import { useToast } from '../../components/shared/ToastProvider'
import { SeverityPill, StatusPill, TYPE_META } from '../../components/shared/SeverityPill'
import Modal from '../../components/shared/Modal'

function timeAgo(ts) {
  const d = Date.now() - ts; const m = Math.floor(d/60000)
  if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`; return `${Math.floor(m/60)}h ago`
}

const ROLES_CC = [
  { id:'corporate', label:'Corporate Command', icon:'🏢', color:'#BF5AF2', badge:'TOP LEVEL' },
  { id:'regional',  label:'Regional Director', icon:'🗺️', color:'#0A84FF', badge:'LEVEL 2' },
  { id:'gm',        label:'General Manager',   icon:'👔', color:'#FF9F0A', badge:'LEVEL 3' },
]
const DEMO_CC = [
  { name:'Vikram Mehta',  role:'corporate', email:'vikram@grandmeridian.com', pass:'Cmd@2024!' },
  { name:'Anita Sharma',  role:'regional',  email:'anita@grandmeridian.com',  pass:'Regional1!' },
  { name:'Dev Kapoor',    role:'gm',        email:'dev@grandmeridian.com',    pass:'GMPass1!' },
]

function CommandLogin({ onLogin }) {
  const router  = useRouter()
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    if (!role || !email || !pass) { setError('Complete all fields and select an access level.'); return }
    if (pass.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const user = { name: DEMO_CC.find(d=>d.email===email)?.name || 'Command User', role, email, clearance: ROLES_CC.find(r=>r.id===role)?.badge }
      sessionStorage.setItem('command_user', JSON.stringify(user))
      onLogin(user)
    }, 1100)
  }

  return (
    <div className="page bg-animated full-center" style={{ justifyContent:'flex-start', paddingTop:40 }}>
      <div style={{ width:'100%', maxWidth:460, padding:'0 16px 40px' }}>
        <button onClick={() => router.push('/')} className="btn btn-ghost btn-sm mb-4">← Back</button>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:64, height:64, borderRadius:'var(--r-xl)', background:'rgba(191,90,242,0.15)', border:'1px solid rgba(191,90,242,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 12px' }}>🏢</div>
          <h1 className="fw-800 text-2xl mb-1">Command Center</h1>
          <p className="text-secondary text-sm">Secure multi-property oversight</p>
        </div>

        {/* Role tiles */}
        <div className="text-xs text-tertiary fw-700 uppercase mb-2">Access Level</div>
        <div className="flex-col gap-2 mb-4">
          {ROLES_CC.map(r => (
            <button
              key={r.id}
              className={`btn btn-ghost`}
              style={{ justifyContent:'space-between', border: role===r.id ? `2px solid ${r.color}` : '1px solid var(--border-subtle)', background: role===r.id ? `${r.color}18` : undefined }}
              onClick={() => { setRole(r.id); setError('') }}
              aria-pressed={role===r.id}
            >
              <span className="flex items-center gap-3"><span style={{ fontSize:22 }}>{r.icon}</span><span className="fw-700">{r.label}</span></span>
              <span className="text-xs fw-700 mono" style={{ color:r.color }}>{r.badge}</span>
            </button>
          ))}
        </div>

        <div className="card card-pad mb-3">
          <form onSubmit={handleLogin} className="flex-col gap-3">
            <div className="form-group">
              <label className="input-label" htmlFor="cc-email">Work Email</label>
              <input id="cc-email" type="email" className="input" placeholder="command@property.com" value={email} onChange={e => { setEmail(e.target.value); setError('') }} autoComplete="email" />
            </div>
            <div className="form-group">
              <div className="flex justify-between items-center mb-1">
                <label className="input-label" htmlFor="cc-pass" style={{ marginBottom:0 }}>Password</label>
                <button type="button" className="btn btn-ghost btn-sm" style={{ minHeight:28, fontSize:11, gap:4 }} onClick={() => setShowPass(v=>!v)} aria-label={showPass?'Hide password':'Show password'}>
                  {showPass ? <EyeOff size={12} /> : <Eye size={12} />} {showPass?'Hide':'Show'}
                </button>
              </div>
              <input id="cc-pass" type={showPass?'text':'password'} className="input" placeholder="••••••••" value={pass} onChange={e => { setPass(e.target.value); setError('') }} autoComplete="current-password" />
            </div>
            {error && <div className="alert alert-crisis"><span className="text-sm" style={{ color:'var(--color-crisis)' }}>{error}</span></div>}
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>{loading?'Authenticating…':'Access Command Center →'}</button>
          </form>
        </div>

        <div className="card card-pad" style={{ background:'rgba(191,90,242,0.04)' }}>
          <div className="text-xs text-tertiary fw-700 uppercase mb-3">Demo Accounts</div>
          {DEMO_CC.map(d => {
            const r = ROLES_CC.find(x=>x.id===d.role)
            return (
              <button key={d.email} className="btn btn-ghost btn-full" style={{ justifyContent:'flex-start', gap:12, marginBottom:4, border:'1px solid var(--border-subtle)' }} onClick={() => { setEmail(d.email); setPass(d.pass); setRole(d.role); setError('') }}>
                <span style={{ fontSize:20 }}>{r?.icon}</span>
                <div style={{ textAlign:'left', flex:1 }}>
                  <div className="fw-700 text-sm">{d.name}</div>
                  <div className="text-xs text-tertiary">{r?.label}</div>
                </div>
                <span className="badge badge-purple">FILL</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Command Dashboard ────────────────────────────────────────────────────────
function CommandDashboard({ user }) {
  const router  = useRouter()
  const toast   = useToast()
  const { properties, incidents, broadcasts, createBroadcast } = useStore()
  const [tab, setTab] = useState('overview')
  const [bcMsg, setBcMsg] = useState('')
  const [bcProp, setBcProp] = useState('all')
  const [pmOpen, setPmOpen] = useState(false)
  const [pmIncident, setPmIncident] = useState(null)
  const [pmNotes, setPmNotes] = useState('')
  const [pmSaved, setPmSaved] = useState(false)

  const activeInc = incidents.filter(i => i.status !== 'resolved')

  const handleBroadcast = () => {
    if (!bcMsg.trim()) return
    createBroadcast(bcProp, bcMsg)
    toast({ type:'success', title:'Broadcast sent', message:`Alert delivered to ${bcProp === 'all' ? 'all properties' : properties.find(p=>p.id===bcProp)?.name}.` })
    setBcMsg('')
  }

  const handleLogout = () => { sessionStorage.removeItem('command_user'); router.push('/') }

  const handleSavePostmortem = () => {
    if (!pmNotes.trim()) return
    setPmSaved(true)
    toast({ type:'success', title:'Postmortem saved', message:`Draft linked to ${pmIncident?.id || 'incident'}` })
    setTimeout(() => { setPmOpen(false); setPmSaved(false); setPmNotes('') }, 1500)
  }

  return (
    <div className="page bg-animated">
      {/* Topbar */}
      <header className="topbar" style={{ justifyContent:'space-between' }}>
        <div className="flex items-center gap-3">
          <button className="btn btn-icon btn-ghost btn-icon-sm" onClick={handleLogout} aria-label="Logout"><ArrowLeft size={16} /></button>
          <div>
            <div className="fw-800 text-base">Command Center</div>
            <div className="text-xs text-tertiary">{user?.name} · {user?.clearance}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeInc.length > 0 && (
            <div style={{ background:'var(--color-crisis)', color:'#fff', borderRadius:'var(--r-full)', minWidth:24, height:24, padding:'0 6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, animation:'pulse-crisis 2s infinite' }}>
              {activeInc.length}
            </div>
          )}
          <div className="live-dot" /><span className="text-xs fw-700 text-safe">LIVE</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs" style={{ paddingLeft:16 }}>
        {[['overview','Overview'],['incidents','Incidents'],['broadcast','Broadcast'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} className={`tab ${tab===id?'active':''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <main style={{ flex:1, overflowY:'auto', paddingBottom: 24 }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="container-lg" style={{ paddingTop:16 }}>
            <div className="grid-2 mb-4">
              {[{ label:'Active Incidents', value:activeInc.length, color:'var(--color-crisis)' },
                { label:'Total Properties', value:properties.length, color:'var(--color-blue)' },
                { label:'Resolved Today', value: incidents.filter(i=>i.status==='resolved').length, color:'var(--color-safe)' },
                { label:'Broadcasts Sent', value: broadcasts.length, color:'var(--color-purple)' },
              ].map(s => (
                <div key={s.label} className="card card-pad" style={{ textAlign:'center' }}>
                  <div className="fw-900 text-3xl" style={{ color:s.color, letterSpacing:'-0.04em' }}>{s.value}</div>
                  <div className="text-xs text-tertiary fw-600 uppercase mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Property cards */}
            <div className="fw-800 text-lg mb-3">Properties</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {properties.map(p => {
                const propInc = incidents.filter(i => i.propertyId === p.id)
                const propActive = propInc.filter(i => i.status !== 'resolved')
                return (
                  <div key={p.id} className="card card-pad">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="fw-800 text-base">{p.name}</div>
                        <div className="text-xs text-tertiary mt-1">📍 {p.address}</div>
                        <div className="text-xs text-tertiary">📞 {p.phone} · 🛏️ {p.rooms} rooms</div>
                      </div>
                      {propActive.length > 0
                        ? <span className="badge badge-crisis">{propActive.length} Active</span>
                        : <span className="badge badge-safe">All Clear</span>}
                    </div>
                    {propActive.length > 0 && propActive.slice(0,2).map(inc => (
                      <div key={inc.id} className="flex gap-2 items-center" style={{ padding:'6px 0', borderTop:'1px solid var(--border-subtle)' }}>
                        <SeverityPill sev={inc.severity} />
                        <span className="text-xs truncate flex-1">{TYPE_META[inc.type]?.label} — {inc.location}</span>
                        <span className="text-xs text-tertiary">{timeAgo(inc.createdAt)}</span>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                      <button className="btn btn-ghost btn-sm flex-1" onClick={() => setTab('incidents')} aria-label={`View all incidents for ${p.name}`}>View Incidents</button>
                      <button className="btn btn-ghost btn-sm flex-1" onClick={() => { setBcProp(p.id); setTab('broadcast') }} aria-label={`Send broadcast to ${p.name}`}>Broadcast</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* INCIDENTS */}
        {tab === 'incidents' && (
          <div className="container-lg" style={{ paddingTop:16 }}>
            <div className="fw-800 text-lg mb-3">All Incidents Across Properties</div>
            {incidents.length === 0 && (<div className="empty-state"><div style={{ fontSize:40 }}>✅</div><div className="fw-600">No incidents on record</div></div>)}
            {incidents.map(inc => {
              const prop = properties.find(p=>p.id===inc.propertyId)
              const type = TYPE_META[inc.type] || TYPE_META.other
              return (
                <div key={inc.id} className={`incident-card ${inc.severity.toLowerCase()} mb-2`}>
                  <div className="flex items-start gap-3">
                    <div style={{ fontSize:28, flexShrink:0 }}>{type.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="flex gap-2 mb-1 wrap"><SeverityPill sev={inc.severity} /><StatusPill status={inc.status} /></div>
                      <div className="fw-700 text-sm truncate">{type.label} — {inc.location}</div>
                      <div className="text-xs text-tertiary mt-1 flex gap-2 wrap">
                        <span>🏨 {prop?.name}</span><span>⏱ {timeAgo(inc.createdAt)}</span>
                        {inc.assignedTo && <span>👤 {inc.assignedTo}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="btn btn-ghost btn-sm flex-1" onClick={() => { setPmIncident(inc); setPmOpen(true) }} aria-label={`Create postmortem for ${inc.id}`}>📋 Postmortem Draft</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* BROADCAST */}
        {tab === 'broadcast' && (
          <div className="container" style={{ paddingTop:16 }}>
            <div className="fw-800 text-lg mb-3">Broadcast Alert</div>
            <div className="card card-pad mb-4">
              <div className="form-group mb-3">
                <label className="input-label" htmlFor="bc-prop">Target Property</label>
                <select id="bc-prop" className="input" value={bcProp} onChange={e => setBcProp(e.target.value)}>
                  <option value="all">🌐 All Properties</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group mb-3">
                <label className="input-label" htmlFor="bc-msg">Message</label>
                <textarea
                  id="bc-msg"
                  className="input"
                  placeholder="Type your broadcast message to all staff…"
                  value={bcMsg}
                  onChange={e => setBcMsg(e.target.value)}
                  rows={4}
                  aria-label="Broadcast message"
                />
                <span className="form-hint">{bcMsg.length}/500 characters</span>
              </div>
              <button className="btn btn-crisis btn-full" onClick={handleBroadcast} disabled={!bcMsg.trim()} id="broadcast-send-btn" aria-label="Send broadcast alert">
                <Radio size={16} /> Send Broadcast Now
              </button>
            </div>

            <div className="fw-700 mb-3">Recent Broadcasts</div>
            {broadcasts.length === 0 && (<div className="empty-state"><div style={{ fontSize:32 }}>📡</div><div className="text-secondary text-sm">No broadcasts yet.</div></div>)}
            {broadcasts.map(bc => {
              const prop = properties.find(p=>p.id===bc.propertyId)
              return (
                <div key={bc.id} className="card card-pad mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="badge badge-purple">{bc.propertyId === 'all' ? 'All Properties' : prop?.name}</span>
                    <span className="text-xs text-tertiary">{timeAgo(bc.createdAt)}</span>
                  </div>
                  <div className="text-sm lh-normal">{bc.message}</div>
                  <div className="text-xs text-tertiary mt-1">By {bc.author}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div className="container" style={{ paddingTop:16 }}>
            <div className="fw-800 text-lg mb-3">Platform Analytics</div>
            <div className="grid-2 mb-4">
              {[
                { label:'Avg Acknowledge Time', value:'4m 20s', sub:'↓ 12% vs last week', color:'var(--color-safe)' },
                { label:'Avg Resolve Time',      value:'62m',   sub:'↑ 8% needs attention', color:'var(--color-amber)' },
                { label:'SOS Submissions',       value:incidents.length, sub:'Last 30 days', color:'var(--color-blue)' },
                { label:'Resolved Rate',         value:`${incidents.length?Math.round(incidents.filter(i=>i.status==='resolved').length/incidents.length*100):0}%`, sub:'This month', color:'var(--color-safe)' },
              ].map(s => (
                <div key={s.label} className="card card-pad" style={{ textAlign:'center' }}>
                  <div className="fw-900 text-2xl" style={{ color:s.color, letterSpacing:'-0.03em' }}>{s.value}</div>
                  <div className="text-xs text-tertiary fw-600 uppercase mt-1" style={{ lineHeight:1.4 }}>{s.label}</div>
                  <div className="text-xs mt-1" style={{ color: s.sub.includes('↓')?'var(--color-safe)':s.sub.includes('↑')?'var(--color-amber)':'var(--text-tertiary)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="card card-pad" style={{ background:'rgba(10,132,255,0.04)' }}>
              <div className="fw-700 mb-2">Incident Distribution by Type</div>
              {Object.entries(TYPE_META).map(([key, meta]) => {
                const count = incidents.filter(i=>i.type===key).length
                if (!count) return null
                const pct = Math.round(count/Math.max(incidents.length,1)*100)
                return (
                  <div key={key} className="mb-2">
                    <div className="flex justify-between text-xs mb-1"><span>{meta.icon} {meta.label}</span><span>{count} ({pct}%)</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width:`${pct}%` }} /></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Postmortem Modal */}
      <Modal open={pmOpen} onClose={() => { setPmOpen(false); setPmNotes(''); setPmSaved(false) }} title={`Postmortem — ${pmIncident?.id}`}
        footer={[
          <button key="save" className="btn btn-primary btn-full" onClick={handleSavePostmortem} disabled={!pmNotes.trim() || pmSaved}>{pmSaved ? '✅ Saved!' : '💾 Save Draft'}</button>,
          <button key="cancel" className="btn btn-ghost btn-full" onClick={() => setPmOpen(false)}>Cancel</button>,
        ]}
      >
        <div className="alert alert-info mb-3">
          <span className="text-sm">This postmortem draft will be linked to {pmIncident?.id} and shared with all stakeholders.</span>
        </div>
        {[
          { label:'What happened?', ph:'Describe the incident from start to finish…' },
          { label:'What went well?', ph:'Response time, team coordination…' },
          { label:'What needs improvement?', ph:'Communication gaps, missing SOP steps…' },
        ].map((f, i) => (
          <div key={f.label} className="form-group mb-3">
            <label className="input-label">{f.label}</label>
            <textarea
              className="input"
              placeholder={f.ph}
              rows={3}
              onChange={() => { if (!pmNotes) setPmNotes(' ') }}
            />
          </div>
        ))}
        <div className="form-group">
          <label className="input-label">Action Items</label>
          <textarea className="input" placeholder="List specific action items with owners and deadlines…" rows={3}
            onChange={e => setPmNotes(e.target.value || ' ')} />
        </div>
      </Modal>
    </div>
  )
}

// ─── Page wrapper (handles auth) ──────────────────────────────────────────────
export default function CommandPage() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem('command_user') || 'null')
      if (u) setUser(u)
    } catch {}
    setChecking(false)
  }, [])

  if (checking) return <div className="full-center bg-animated"><div style={{ fontSize:32 }}>⚡</div></div>

  return (
    <>
      <Head>
        <title>Command Center — Rapid Crisis Response</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      {user ? <CommandDashboard user={user} /> : <CommandLogin onLogin={setUser} />}
    </>
  )
}
