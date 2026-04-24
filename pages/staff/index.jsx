import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { ArrowLeft, Search, CheckCircle, Send, Phone, Zap, Radio, User } from 'lucide-react'
import useStore from '../../store/useStore'
import { useToast } from '../../components/shared/ToastProvider'
import { SeverityPill, StatusPill, TYPE_META } from '../../components/shared/SeverityPill'
import Modal from '../../components/shared/Modal'

function timeAgo(ts) {
  const d = Date.now() - ts
  const m = Math.floor(d / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m/60)}h ${m%60}m ago`
}

// ─── Incident Detail ──────────────────────────────────────────────────────────
function IncidentDetail({ incident, onBack }) {
  const toast = useToast()
  const { acknowledgeIncident, assignToMe, addTimelineEvent, resolveIncident, toggleTask, getIncidentEvents, getIncidentTasks } = useStore()
  const events = useStore(() => getIncidentEvents(incident.id))
  const tasks  = useStore(() => getIncidentTasks(incident.id))

  const [tab, setTab]           = useState('timeline')
  const [update, setUpdate]     = useState('')
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resNote, setResNote]   = useState('')
  const [escalateOpen, setEscalateOpen] = useState(false)

  const completedTasks = tasks.filter(t => t.done).length
  const progress       = tasks.length ? (completedTasks / tasks.length) * 100 : 0
  const type           = TYPE_META[incident.type] || TYPE_META.other
  const isResolved     = incident.status === 'resolved'

  const handleAck = () => {
    acknowledgeIncident(incident.id)
    toast({ type:'info', title:'Acknowledged', message:`You are now responding to ${incident.id}` })
  }
  const handleAssign = () => {
    assignToMe(incident.id)
    toast({ type:'success', title:'Assigned to you', message:`${incident.id} is now your responsibility.` })
  }
  const handleUpdate = () => {
    if (!update.trim()) return
    addTimelineEvent(incident.id, update)
    toast({ type:'info', title:'Update logged', message:'Timeline updated.' })
    setUpdate('')
  }
  const handleResolve = () => {
    if (!resNote.trim()) return
    resolveIncident(incident.id, resNote)
    toast({ type:'success', title:'Incident resolved', message:`${incident.id} closed successfully.` })
    setResolveOpen(false)
    onBack()
  }

  return (
    <div className="flex-col" style={{ flex:1, overflow:'hidden' }}>
      {/* Header */}
      <div className="card" style={{ borderRadius:0, borderLeft:'none', borderRight:'none', borderTop:'none', padding:'12px 16px' }}>
        <div className="flex items-center gap-3 mb-2">
          <button className="btn btn-icon btn-ghost btn-icon-sm" onClick={onBack} aria-label="Back to feed"><ArrowLeft size={16} /></button>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="flex items-center gap-2 mb-1 wrap">
              <SeverityPill sev={incident.severity} />
              <StatusPill status={incident.status} />
              <span className="text-xs text-tertiary mono">{incident.id}</span>
            </div>
            <div className="fw-800 text-base truncate">{incident.title || `${type.label} — ${incident.location}`}</div>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-tertiary wrap mb-2">
          <span>📍 {incident.location}</span>
          <span>⏱ {timeAgo(incident.createdAt)}</span>
          {incident.assignedTo && <span>👤 {incident.assignedTo}</span>}
        </div>

        {/* Action buttons */}
        {!isResolved && (
          <div className="flex gap-2 wrap">
            {incident.status === 'active' && (
              <button className="btn btn-crisis" style={{ flex:1 }} onClick={handleAck} id="ack-btn"><CheckCircle size={14} />Acknowledge</button>
            )}
            {!incident.assignedTo && (
              <button className="btn btn-primary" style={{ flex:1 }} onClick={handleAssign} id="assign-btn"><User size={14} />Assign to me</button>
            )}
            <button className="btn btn-safe" style={{ flex:1 }} onClick={() => setResolveOpen(true)} id="resolve-btn"><CheckCircle size={14} />Resolve</button>
            <button className="btn btn-ghost btn-icon" onClick={() => setEscalateOpen(true)} aria-label="Escalate incident"><Zap size={16} /></button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs px-4">
        {[['timeline','Timeline'], ['tasks',`Tasks (${completedTasks}/${tasks.length})`], ['comms','Comms']].map(([id, label]) => (
          <button key={id} className={`tab ${tab===id?'active':''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>

        {/* TIMELINE */}
        {tab === 'timeline' && (
          <div>
            <div className="timeline mb-4">
              {events.length === 0 && (<div className="empty-state"><div style={{ fontSize:32 }}>📋</div><div className="text-secondary text-sm">No events yet</div></div>)}
              {events.map((ev) => (
                <div key={ev.id} className="timeline-item">
                  <div className="timeline-dot" style={{ background: ev.type==='report'?'var(--color-crisis)':ev.type==='ack'?'var(--color-blue)':ev.type==='resolve'?'var(--color-safe)':ev.type==='assign'?'var(--color-purple)':'var(--color-blue)' }} />
                  <div className="timeline-content">
                    <div className="text-sm fw-500" style={{ lineHeight:1.5 }}>{ev.message}</div>
                    <div className="text-xs text-tertiary flex gap-2 mt-1"><span>{timeAgo(ev.createdAt)}</span><span>·</span><span>{ev.actor}</span></div>
                  </div>
                </div>
              ))}
            </div>
            {!isResolved && (
              <div className="card card-pad">
                <div className="fw-700 text-sm mb-2">Add timeline update</div>
                <textarea className="input mb-2" placeholder="Log an update, observation, or action taken…" value={update} onChange={e => setUpdate(e.target.value)} rows={3} />
                <button className="btn btn-primary btn-full" onClick={handleUpdate} disabled={!update.trim()}>
                  <Send size={14} /> Log Update
                </button>
              </div>
            )}
          </div>
        )}

        {/* TASKS */}
        {tab === 'tasks' && (
          <div>
            {tasks.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm fw-600">Checklist Progress</span>
                  <span className="text-sm text-tertiary">{completedTasks}/{tasks.length}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${progress}%`, background: progress===100?'var(--color-safe)':'var(--color-blue)' }} />
                </div>
              </div>
            )}
            {tasks.length === 0 && <div className="empty-state"><div style={{ fontSize:32 }}>✅</div><div className="text-secondary text-sm">No tasks for this incident</div></div>}
            {tasks.map(task => (
              <div
                key={task.id}
                className={`checklist-item ${task.done?'done':''}`}
                onClick={() => toggleTask(task.id)}
                role="checkbox"
                aria-checked={task.done}
                tabIndex={0}
                onKeyDown={e => e.key==='Enter' && toggleTask(task.id)}
              >
                <div className={`checkbox ${task.done?'checked':''}`}>
                  {task.done && <CheckCircle size={12} style={{ color:'#fff' }} />}
                </div>
                <span className="text-sm flex-1" style={{ textDecoration: task.done?'line-through':'none' }}>{task.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* COMMS */}
        {tab === 'comms' && (
          <div>
            <div className="alert alert-info mb-4">
              <Radio size={16} style={{ color:'var(--color-blue)', flexShrink:0 }} />
              <div className="text-sm">Team channel for <strong>{incident.id}</strong>. All messages logged to timeline.</div>
            </div>
            <div className="card card-pad mb-4">
              <div className="fw-700 text-sm mb-3">Emergency Script</div>
              <div style={{ background:'var(--bg-glass)', border:'1px solid var(--border-subtle)', borderRadius:'var(--r-md)', padding:'12px', fontSize:12, lineHeight:1.7, color:'var(--text-secondary)', fontFamily:'var(--font-mono)' }}>
                &quot;This is The Grand Meridian. We have a {incident.type} emergency at {incident.location}.
                Incident ref: {incident.id}. Ingress via main vehicle gate. Please proceed.&quot;
              </div>
              <button className="btn btn-crisis btn-full mt-3" onClick={() => { if(typeof window!=='undefined') window.location.href='tel:112' }} aria-label="Call emergency services">
                <Phone size={14} /> Call 112 — Emergency Services
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      <Modal open={resolveOpen} onClose={() => setResolveOpen(false)} title="Resolve Incident"
        footer={[
          <button key="resolve" className="btn btn-safe btn-full" onClick={handleResolve} disabled={!resNote.trim()}>✅ Confirm Resolution</button>,
          <button key="cancel"  className="btn btn-ghost btn-full" onClick={() => setResolveOpen(false)}>Cancel</button>,
        ]}
      >
        <p className="text-sm text-secondary mb-3 lh-normal">Provide a resolution note before closing this incident. This will be recorded in the postmortem log.</p>
        <textarea className="input" placeholder="Describe what happened and how it was resolved…" value={resNote} onChange={e => setResNote(e.target.value)} rows={4} />
      </Modal>

      {/* Escalate Modal */}
      <Modal open={escalateOpen} onClose={() => setEscalateOpen(false)} title="Escalate Incident">
        <div className="flex-col gap-2">
          {[
            { label:'🔴 Upgrade to S0 — Critical', action:() => { const u = useStore.getState(); u.acknowledgeIncident && u.addTimelineEvent(incident.id,'Severity upgraded to S0 — Critical.'); toast({ type:'crisis', title:'Upgraded to S0', message:'All command staff notified.' }) } },
            { label:'👔 Notify Manager on Duty', action:() => { toast({ type:'info', title:'Manager notified', message:'Priya Singh has been paged.' }) } },
            { label:'📡 Alert Command Center', action:() => { toast({ type:'info', title:'Command notified', message:'Corporate command center has been alerted.' }) } },
            { label:'🚒 Call Emergency Services — 112', action:() => { if(typeof window!=='undefined') window.location.href='tel:112' } },
            { label:'📢 Issue Zone Evacuation Alert', action:() => { toast({ type:'crisis', title:'Evacuation broadcast sent', message:'Zone broadcast active for all staff.' }) } },
          ].map(btn => (
            <button key={btn.label} className="btn btn-ghost" style={{ justifyContent:'flex-start', fontSize:13 }} onClick={() => { btn.action(); setEscalateOpen(false) }}>
              {btn.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}

// ─── Incident Feed ────────────────────────────────────────────────────────────
function IncidentFeed({ incidents, onSelect }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = incidents.filter(inc => {
    if (filter !== 'all' && inc.status !== filter) return false
    const q = search.toLowerCase()
    if (q && !inc.location.toLowerCase().includes(q) && !inc.type.toLowerCase().includes(q) && !inc.id.toLowerCase().includes(q)) return false
    return true
  })

  return (
    <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border-subtle)' }}>
        <div className="search-wrap mb-3">
          <Search size={16} className="search-icon" />
          <input className="input search-input" placeholder="Search incidents…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search incidents" />
        </div>
        <div className="flex gap-2" style={{ overflowX:'auto', paddingBottom:2 }}>
          {['all','active','acknowledged','responding','investigating','resolved'].map(f => (
            <button key={f} className={`chip ${filter===f?'active':''}`} onClick={() => setFilter(f)} aria-pressed={filter===f}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize:40 }}>✅</div>
            <div className="fw-600 text-base">No incidents match this filter</div>
            <div className="text-secondary text-sm">The queue is clear — great work, team.</div>
          </div>
        )}
        {filtered.map(inc => {
          const type = TYPE_META[inc.type] || TYPE_META.other
          return (
            <button
              key={inc.id}
              className={`incident-card ${inc.severity.toLowerCase()}`}
              onClick={() => onSelect(inc)}
              aria-label={`View incident ${inc.id}: ${type.label} at ${inc.location}`}
            >
              <div className="flex items-start gap-3">
                <div style={{ width:40, height:40, borderRadius:'var(--r-md)', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{type.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="flex gap-2 mb-1 wrap"><SeverityPill sev={inc.severity} /><StatusPill status={inc.status} /></div>
                  <div className="fw-700 text-sm truncate">{type.label} — {inc.location}</div>
                  <div className="text-xs text-tertiary mt-1 flex gap-2">
                    <span>📍 {inc.location}</span><span>⏱ {timeAgo(inc.createdAt)}</span>
                    {inc.assignedTo && <span>👤 {inc.assignedTo}</span>}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StaffDashboard() {
  const router = useRouter()
  const incidents = useStore(s => s.incidents)
  const [user, setUser] = useState(null)
  const [selected, setSelected] = useState(null)
  const [nav, setNav] = useState('feed')
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem('staff_user') || 'null')
      if (!u) { router.replace('/staff/login'); return }
      setUser(u)
    } catch { router.replace('/staff/login') }
    setAuthLoading(false)
  }, [router])

  const activeCount = incidents.filter(i => i.status !== 'resolved').length

  const handleLogout = () => {
    sessionStorage.removeItem('staff_user')
    router.push('/')
  }

  if (authLoading) return (
    <div className="full-center bg-animated">
      <div style={{ fontSize:32 }}>⚡</div>
      <div className="text-secondary text-sm mt-2">Loading staff dashboard…</div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Staff Dashboard — Rapid Crisis Response</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <div className="page bg-animated" style={{ maxWidth:640, margin:'0 auto' }}>
        {/* Topbar */}
        <header className="topbar" style={{ justifyContent:'space-between' }}>
          <div className="flex items-center gap-3">
            <button className="btn btn-icon btn-ghost btn-icon-sm" onClick={handleLogout} aria-label="Logout and go home"><ArrowLeft size={16} /></button>
            <div>
              <div className="fw-800 text-base">Staff Dashboard</div>
              {user && <div className="text-xs text-tertiary">{user.name} · {user.role}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <div style={{ background:'var(--color-crisis)', color:'#fff', borderRadius:'var(--r-full)', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, animation:'pulse-crisis 2s infinite' }}>
                {activeCount}
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className="live-dot" />
              <span className="text-xs fw-700 text-safe">LIVE</span>
            </div>
          </div>
        </header>

        {/* Role + shift banner */}
        <div style={{ padding:'8px 16px', background:'rgba(10,132,255,0.08)', borderBottom:'1px solid rgba(10,132,255,0.15)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div className="flex gap-2 items-center wrap">
            <span className="badge badge-blue">{user?.role || 'Staff'}</span>
            <span className="text-xs text-tertiary">The Grand Meridian · Night Shift</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
        </div>

        {/* Content */}
        {selected && nav === 'feed' ? (
          <IncidentDetail incident={selected} onBack={() => setSelected(null)} />
        ) : nav === 'feed' ? (
          <IncidentFeed incidents={incidents} onSelect={inc => { setSelected(inc); setNav('feed') }} />
        ) : (
          <div className="empty-state">
            <div style={{ fontSize:40 }}>🗺️</div>
            <div className="fw-600">Floor Map</div>
            <div className="text-secondary text-sm">Interactive floor maps coming in next release.</div>
            <button className="btn btn-ghost mt-2" onClick={() => setNav('feed')}>← Back to Feed</button>
          </div>
        )}

        {/* Bottom nav */}
        <div className="bottom-bar">
          <button className={`btn ${nav==='feed'?'btn-primary':'btn-ghost'} flex-1`} onClick={() => { setSelected(null); setNav('feed') }} aria-pressed={nav==='feed'}>
            📋 Incidents {activeCount > 0 && `(${activeCount})`}
          </button>
          <button className={`btn ${nav==='map'?'btn-primary':'btn-ghost'} flex-1`} onClick={() => setNav('map')} aria-pressed={nav==='map'}>
            🗺️ Map
          </button>
          <button
            className="btn btn-crisis flex-1"
            onClick={() => router.push('/guest')}
            aria-label="Submit a new incident report"
          >
            🆘 New SOS
          </button>
        </div>
      </div>
    </>
  )
}
