import { useState, useEffect } from 'react'
import { ArrowLeft, Bell, Map, ClipboardList, MessageSquare, Home, Search, ChevronRight, CheckCircle, Clock, User, Phone, Upload, Shield, AlertTriangle, Zap, ChevronDown, Radio, Send, RefreshCw } from 'lucide-react'
import { MOCK_INCIDENTS, STAFF_MEMBERS, SEVERITY_LABELS, INCIDENT_TYPES } from '../data/mockData'

function timeAgo(date) {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

function SeverityBadge({ sev }) {
  const info = SEVERITY_LABELS[sev] || SEVERITY_LABELS.S4
  return <span className={`badge ${info.className}`}>{sev} · {info.label}</span>
}

function StaffAvatar({ member }) {
  return (
    <div className="flex items-center gap-2">
      <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)' }}>
        {member.avatar}
      </div>
      <div>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{member.name}</div>
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{member.role}</div>
      </div>
    </div>
  )
}

// ---- INCIDENT FEED ----
function IncidentFeed({ incidents, onSelect }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = incidents.filter(inc => {
    if (filter !== 'all' && inc.status !== filter) return false
    if (search && !inc.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Search + Filter */}
      <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="search-bar" style={{ marginBottom: 'var(--space-3)' }}>
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="Search incidents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflow: 'auto' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'responding', label: 'Responding' },
            { key: 'active', label: 'Active' },
            { key: 'investigating', label: 'Investigating' },
            { key: 'resolved', label: 'Resolved' },
          ].map(f => (
            <button
              key={f.key}
              className={`chip ${filter === f.key ? 'selected' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents */}
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-10) 0', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>✅</div>
            <div style={{ fontWeight: 600 }}>No incidents match this filter</div>
          </div>
        )}

        {filtered.map((inc, i) => {
          const type = INCIDENT_TYPES.find(t => t.id === inc.type)
          const sevInfo = SEVERITY_LABELS[inc.severity]
          const isActive = inc.status !== 'resolved'
          return (
            <div
              key={inc.id}
              className={`incident-card ${inc.severity.toLowerCase()} ${isActive && inc.severity === 'S0' ? 'active-incident' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => onSelect(inc)}
              role="button"
              tabIndex={0}
              aria-label={`View incident: ${inc.title}`}
            >
              <div className="flex items-start gap-3">
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: `${type?.color}20`,
                  border: `1px solid ${type?.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  {type?.icon || '📣'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <SeverityBadge sev={inc.severity} />
                    <span className={`badge ${inc.status === 'resolved' ? 'badge-muted' : inc.status === 'responding' ? 'badge-crisis' : 'badge-amber'}`}>
                      {inc.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 2, lineHeight: 1.4 }} className="truncate">
                    {inc.title}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span>📍 {inc.location}</span>
                    <span>⏱ {timeAgo(inc.reportedAt)}</span>
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              </div>

              {inc.assignedTo?.length > 0 && (
                <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={11} /> {inc.assignedTo.join(' · ')}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---- INCIDENT DETAIL ----
function IncidentDetail({ incident, onBack, addToast }) {
  const [tasks, setTasks] = useState(incident.tasks)
  const [activeTab, setActiveTab] = useState('timeline')
  const [update, setUpdate] = useState('')
  const [showEscalate, setShowEscalate] = useState(false)
  const [isAcknowledged, setIsAcknowledged] = useState(incident.status !== 'active')

  const type = INCIDENT_TYPES.find(t => t.id === incident.type)

  const handleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    addToast({ type: 'success', title: 'Task Updated', message: 'Checklist item saved to incident timeline.', icon: '✅', duration: 2500 })
  }

  const handleAcknowledge = () => {
    setIsAcknowledged(true)
    addToast({ type: 'success', title: 'Acknowledged', message: `You are now responding to ${incident.id}`, icon: '👮', duration: 3000 })
  }

  const handleSendUpdate = () => {
    if (!update.trim()) return
    addToast({ type: 'info', title: 'Update Logged', message: 'Incident timeline updated and team notified.', icon: '📝', duration: 3000 })
    setUpdate('')
  }

  const completedCount = tasks.filter(t => t.completed).length
  const progressPct = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div
        className="glass-card"
        style={{
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          padding: 'var(--space-4) var(--space-5)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button className="btn btn-icon btn-ghost" onClick={onBack} aria-label="Back to feed">
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <SeverityBadge sev={incident.severity} />
              <span className={`badge ${incident.status === 'resolved' ? 'badge-muted' : 'badge-crisis'}`}>
                {incident.status.toUpperCase()}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{incident.id}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', lineHeight: 1.3 }}>{incident.title}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
          <span>📍 {incident.location}</span>
          <span>🏨 {incident.property}</span>
          <span>⏱ {timeAgo(incident.reportedAt)}</span>
        </div>

        {!isAcknowledged && (
          <div style={{ marginTop: 'var(--space-3)' }}>
            <button className="btn btn-crisis w-full" onClick={handleAcknowledge} id="ack-btn">
              <Shield size={16} />
              Acknowledge — I'm Responding
            </button>
          </div>
        )}

        {isAcknowledged && incident.status !== 'resolved' && (
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className="btn btn-safe"
              style={{ flex: 1 }}
              onClick={() => addToast({ type: 'success', title: 'Marked Resolved', message: 'Incident closed. Post-incident report required.', icon: '✅' })}
            >
              <CheckCircle size={14} />
              Mark Resolved
            </button>
            <button className="btn btn-amber" style={{ flex: 1 }} onClick={() => setShowEscalate(true)}>
              <Zap size={14} />
              Escalate
            </button>
            <button className="btn btn-ghost btn-icon" aria-label="Call emergency services">
              <Phone size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ paddingLeft: 'var(--space-4)', flexShrink: 0 }}>
        {[
          { id: 'timeline', label: 'Timeline' },
          { id: 'tasks', label: `Tasks (${completedCount}/${tasks.length})` },
          { id: 'map', label: 'Floor Map' },
          { id: 'comms', label: 'Comms' },
        ].map(t => (
          <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>

        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <div>
            <div className="timeline" style={{ marginBottom: 'var(--space-4)' }}>
              {incident.timeline.map((event, i) => (
                <div key={i} className="timeline-item animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div
                    className="timeline-dot"
                    style={{
                      background: event.type === 'report' ? 'var(--color-crisis)' :
                        event.type === 'ack' ? 'var(--color-blue)' :
                        event.type === 'dispatch' ? 'var(--color-amber)' :
                        event.type === 'resolve' ? 'var(--color-safe)' :
                        event.type === 'merge' ? 'var(--color-purple)' :
                        'var(--color-blue)',
                    }}
                  />
                  <div className="timeline-content">
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, lineHeight: 1.4 }}>{event.event}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', gap: 8 }}>
                      <span>{timeAgo(event.time)}</span>
                      <span>·</span>
                      <span>{event.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add update */}
            <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Add Timeline Update</div>
              <textarea
                className="input"
                placeholder="Log an update, observation, or action taken..."
                value={update}
                onChange={e => setUpdate(e.target.value)}
                style={{ marginBottom: 'var(--space-2)' }}
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSendUpdate}>
                  <Send size={14} />
                  Log Update
                </button>
                <button className="btn btn-ghost" style={{ position: 'relative' }}>
                  <Upload size={14} />
                  Evidence
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TASKS */}
        {activeTab === 'tasks' && (
          <div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Checklist Progress</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{completedCount}/{tasks.length}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progressPct}%`, background: progressPct === 100 ? 'var(--color-safe)' : 'var(--color-blue)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {tasks.map((task, i) => (
                <div
                  key={task.id}
                  className={`checklist-item ${task.completed ? 'completed' : ''} animate-fade-in`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => handleTask(task.id)}
                  role="checkbox"
                  aria-checked={task.completed}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleTask(task.id)}
                >
                  <div className={`checklist-checkbox ${task.completed ? 'checked' : ''}`}>
                    {task.completed && <CheckCircle size={12} style={{ color: 'white' }} />}
                  </div>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    flex: 1,
                  }}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              Checklist auto-generated from SOP for {INCIDENT_TYPES.find(t => t.id === incident.type)?.label}
            </div>
          </div>
        )}

        {/* MAP */}
        {activeTab === 'map' && (
          <div>
            <div
              className="map-placeholder"
              style={{ height: 280, marginBottom: 'var(--space-4)', flexDirection: 'column', gap: 'var(--space-3)' }}
            >
              <div className="map-grid-bg" />
              {/* Simulated floor plan */}
              <div style={{ position: 'relative', width: '90%', height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                {/* Incident pin */}
                <div style={{ position: 'absolute', top: '30%', left: '60%', textAlign: 'center' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--color-crisis)',
                      boxShadow: 'var(--shadow-crisis)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      animation: 'pulseCrisis 2s infinite',
                    }}
                  >
                    {INCIDENT_TYPES.find(t => t.id === incident.type)?.icon}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--color-crisis)', fontWeight: 700, marginTop: 2, whiteSpace: 'nowrap' }}>
                    INCIDENT
                  </div>
                </div>
                {/* AED Pin */}
                <div style={{ position: 'absolute', top: '50%', left: '30%', textAlign: 'center' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-safe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>❤️</div>
                  <div style={{ fontSize: 8, color: 'var(--color-safe)', fontWeight: 700, marginTop: 1 }}>AED</div>
                </div>
                {/* Exit Pin */}
                <div style={{ position: 'absolute', bottom: '15%', left: '10%', textAlign: 'center' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-safe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🚪</div>
                  <div style={{ fontSize: 8, color: 'var(--color-safe)', fontWeight: 700, marginTop: 1 }}>EXIT</div>
                </div>
                {/* Elevator Pin */}
                <div style={{ position: 'absolute', top: '10%', right: '15%', textAlign: 'center' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🛗</div>
                  <div style={{ fontSize: 8, color: 'var(--color-amber)', fontWeight: 700, marginTop: 1 }}>LIFT</div>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center', position: 'absolute', bottom: 4 }}>
                  Floor Plan — Floor 12 · {incident.property}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              {[
                { icon: '🆘', label: 'Incident', color: 'var(--color-crisis)' },
                { icon: '❤️', label: 'AED', color: 'var(--color-safe)' },
                { icon: '🚪', label: 'Emergency Exit', color: 'var(--color-safe)' },
                { icon: '🛗', label: 'Elevator', color: 'var(--color-amber)' },
                { icon: '🧯', label: 'Fire Ext.', color: 'var(--color-amber)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMS */}
        {activeTab === 'comms' && (
          <div>
            <div className="alert-banner alert-banner-info mb-4">
              <Radio size={16} style={{ flexShrink: 0, color: 'var(--color-blue)' }} />
              <div className="text-sm">Team channel for <strong>{incident.id}</strong>. All messages logged to incident timeline.</div>
            </div>

            {/* Team Members */}
            <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>Responding Team</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {STAFF_MEMBERS.filter(s => incident.assignedTo.some(a => a.includes(s.name))).map(member => (
                  <div key={member.id} className="flex justify-between items-center">
                    <StaffAvatar member={member} />
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <button className="btn btn-ghost btn-icon-sm"><Phone size={12} /></button>
                      <button className="btn btn-ghost btn-icon-sm"><Radio size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scripted Escalation Summary */}
            <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Emergency Services Script</div>
              <div
                style={{
                  background: 'var(--bg-glass-active)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                "This is {'{Property Name}'}, {incident.property}. We have a {incident.type} emergency at {incident.location}. 
                Address: [Hotel Address, Mumbai]. Ingress via main vehicle gate. 
                Incident ref: {incident.id}. 
                {incident.assignedTo[0]} is the incident commander. Call: [number]."
              </div>
              <button className="btn btn-crisis w-full">
                <Phone size={14} />
                Call 112 — Emergency Services
              </button>
            </div>

            {/* Notes */}
            {incident.notes && (
              <div className="alert-banner alert-banner-amber">
                <AlertTriangle size={16} style={{ flexShrink: 0, color: 'var(--color-amber)' }} />
                <div>
                  <div className="font-bold text-xs mb-1">RESTRICTED ACCESS NOTE</div>
                  <div className="text-xs">{incident.notes}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Escalate Modal */}
      {showEscalate && (
        <div className="modal-overlay" onClick={() => setShowEscalate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Escalate Incident</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              {[
                { label: '🔴 Upgrade to S0 — Critical', action: () => {} },
                { label: '👔 Notify Manager on Duty', action: () => {} },
                { label: '📡 Notify Corporate Command Center', action: () => {} },
                { label: '🚒 Alert Emergency Services (112)', action: () => {} },
                { label: '📢 Trigger Zone Evacuation Broadcast', action: () => {} },
              ].map(btn => (
                <button
                  key={btn.label}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', fontSize: 'var(--text-sm)' }}
                  onClick={() => { btn.action(); setShowEscalate(false); addToast({ type: 'crisis', title: 'Action Triggered', message: btn.label, icon: '🚨' }) }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <button className="btn btn-ghost w-full" onClick={() => setShowEscalate(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- STAFF MAP VIEW ----
function StaffMapView() {
  return (
    <div style={{ flex: 1, padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.02em' }}>Property Floor Map</div>

      <div className="glass-card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto' }}>
          {['B1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(f => (
            <button key={f} className={`chip ${f === '12' ? 'selected' : ''}`} style={{ flexShrink: 0 }}>
              {f === 'B1' ? 'B1' : `L${f}`}
            </button>
          ))}
        </div>
      </div>

      <div className="map-placeholder" style={{ flex: 1, minHeight: 360, borderRadius: 'var(--radius-xl)', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'stretch' }}>
        <div className="map-grid-bg" />
        <div style={{ position: 'relative', width: '100%', height: '100%', padding: 'var(--space-5)' }}>
          {/* Corridor */}
          <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: 2, background: 'rgba(255,255,255,0.1)', transform: 'translateY(-50%)' }} />
          {/* Rooms */}
          {['1201', '1202', '1203', '1204\n🆘', '1205', '1206'].map((r, i) => (
            <div
              key={r}
              style={{
                position: 'absolute',
                top: r.includes('🆘') ? '15%' : '60%',
                left: `${10 + i * 15}%`,
                width: 50,
                height: 40,
                border: `1px solid ${r.includes('🆘') ? 'var(--color-crisis)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                color: r.includes('🆘') ? 'var(--color-crisis)' : 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
                fontWeight: r.includes('🆘') ? 700 : 400,
                background: r.includes('🆘') ? 'var(--color-crisis-dim)' : 'transparent',
                boxShadow: r.includes('🆘') ? 'var(--shadow-crisis)' : 'none',
                animation: r.includes('🆘') ? 'pulseCrisis 2s infinite' : 'none',
                whiteSpace: 'pre',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {r}
            </div>
          ))}

          {/* Labels */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Floor 12 · The Grand Meridian
          </div>
          <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 8 }}>
            {[['🆘', 'Incident'], ['❤️', 'AED'], ['🚪', 'Exit']].map(([icon, label]) => (
              <span key={label} style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{icon} {label}</span>
            ))}
          </div>

          {/* AED */}
          <div style={{ position: 'absolute', top: '40%', left: '45%' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-safe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: '2px solid rgba(255,255,255,0.2)' }}>❤️</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
          {[
            { icon: '🆘', label: '1 Active Incident', color: 'var(--color-crisis)' },
            { icon: '❤️', label: '2 AED Stations', color: 'var(--color-safe)' },
            { icon: '🚪', label: '4 Emergency Exits', color: 'var(--color-safe)' },
            { icon: '🧯', label: '6 Fire Extinguishers', color: 'var(--color-amber)' },
            { icon: '🛗', label: '3 Elevators', color: 'var(--color-amber)' },
            { icon: '📹', label: '12 CCTV Active', color: 'var(--color-blue)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)' }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- SHIFT HANDOVER ----
function ShiftHandover({ onBack, addToast }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div className="flex items-center gap-3">
        <button className="btn btn-icon btn-ghost" onClick={onBack}><ArrowLeft size={16} /></button>
        <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.02em' }}>Shift Handover</div>
      </div>

      <div className="alert-banner alert-banner-amber">
        <Clock size={16} style={{ flexShrink: 0, color: 'var(--color-amber)' }} />
        <div>
          <div className="font-bold text-sm">Shift Change in 22 min</div>
          <div className="text-xs">Complete handover notes before signing off.</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>Active Incidents to Handover</div>
        {MOCK_INCIDENTS.filter(i => i.status !== 'resolved').map(inc => (
          <div key={inc.id} className="flex items-center gap-3" style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <SeverityBadge sev={inc.severity} />
            <div style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 500 }} className="truncate">{inc.title}</div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{inc.status}</span>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>Handover Notes</div>
        <textarea
          className="input"
          placeholder="Add any outstanding tasks, context, or cautions for the incoming shift..."
          style={{ minHeight: 120 }}
        />
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>Incoming Staff</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {STAFF_MEMBERS.slice(0, 3).map(m => (
            <div key={m.id} className="flex justify-between items-center">
              <StaffAvatar member={m} />
              <span className="badge badge-safe">On Time</span>
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg w-full"
        onClick={() => addToast({ type: 'success', title: 'Handover Complete', message: 'Shift handover logged and confirmed.', icon: '🤝' })}
      >
        <CheckCircle size={16} />
        Complete Handover & Sign Off
      </button>
    </div>
  )
}

// ---- MAIN STAFF DASHBOARD ----
export default function StaffDashboard({ onBack, addToast, isOnline }) {
  const [activeNav, setActiveNav] = useState('feed')
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS)
  const [staffRole, setStaffRole] = useState('security')

  useEffect(() => {
    // Simulate real-time incoming incident
    const timer = setTimeout(() => {
      const newInc = {
        id: 'INC-2024-005',
        type: 'threat',
        title: 'Suspicious individual in Parking Level B1',
        severity: 'S1',
        status: 'active',
        propertyId: 'prop-001',
        property: 'The Grand Meridian',
        location: 'Parking Level B1',
        zone: 'Parking',
        reportedAt: new Date(),
        acknowledgedAt: null,
        reportedBy: 'guest',
        guestId: 'G-3311',
        assignedTo: [],
        description: 'Guest reported suspicious individual near vehicles.',
        timeline: [
          { time: new Date(), event: 'Incident reported via guest app', actor: 'System', type: 'report' },
        ],
        tasks: [
          { id: 't1', text: 'Acknowledge + dispatch security', completed: false },
          { id: 't2', text: 'Review parking CCTV footage', completed: false },
          { id: 't3', text: 'Do not engage — call police if confirmed threat', completed: false },
          { id: 't4', text: 'Notify manager on duty', completed: false },
        ],
        emergencyRef: null,
        notes: '',
      }
      setIncidents(prev => [newInc, ...prev])
      addToast({ type: 'crisis', title: 'NEW INCIDENT — INC-2024-005', message: 'S1: Suspicious individual in Parking B1', icon: '⚠️', duration: 8000 })
    }, 15000)
    return () => clearTimeout(timer)
  }, [])

  const activeCount = incidents.filter(i => i.status !== 'resolved').length

  const renderContent = () => {
    if (selectedIncident && activeNav === 'feed') {
      return <IncidentDetail incident={selectedIncident} onBack={() => setSelectedIncident(null)} addToast={addToast} />
    }
    if (activeNav === 'map') return <StaffMapView />
    if (activeNav === 'handover') return <ShiftHandover onBack={() => setActiveNav('feed')} addToast={addToast} />
    return (
      <IncidentFeed
        incidents={incidents}
        onSelect={(inc) => { setSelectedIncident(inc); setActiveNav('feed') }}
      />
    )
  }

  return (
    <div className="bg-animated-staff min-h-screen flex flex-col" style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Top Bar */}
      <div className="topbar" style={{ justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3">
          <button className="btn btn-icon btn-ghost" onClick={onBack} aria-label="Exit staff dashboard">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="logo-mark" style={{ fontSize: 'var(--text-base)' }}>
              <div className="logo-icon" style={{ width: 28, height: 28, fontSize: 13 }}>🛡️</div>
              Staff Dashboard
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <div
              style={{
                background: 'var(--color-crisis)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                animation: 'pulseCrisis 2s infinite',
              }}
            >
              {activeCount}
            </div>
          )}
          <div className="avatar" style={{ background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)' }}>RK</div>
        </div>
      </div>

      {/* Role + Property Banner */}
      <div style={{ padding: 'var(--space-3) var(--space-5)', background: 'rgba(10,132,255,0.08)', borderBottom: '1px solid rgba(10,132,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span className="badge badge-blue">Security Officer</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>The Grand Meridian · Shift: 22:00–06:00</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="live-dot" />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-safe)', fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: 72 }}>
        {renderContent()}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        {[
          { id: 'feed', icon: '📋', label: 'Incidents', badge: activeCount > 0 ? activeCount : null },
          { id: 'map', icon: '🗺️', label: 'Map' },
          { id: 'handover', icon: '🔄', label: 'Handover' },
          { id: 'quick', icon: '🆘', label: 'Report', isAction: true },
        ].map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activeNav === item.id ? 'active' : ''} ${item.isAction ? 'btn-crisis' : ''}`}
            style={item.isAction ? {
              background: 'var(--color-crisis)',
              borderRadius: 'var(--radius-lg)',
              color: 'white',
              padding: 'var(--space-2) var(--space-3)',
            } : {}}
            onClick={() => {
              if (item.isAction) {
                addToast({ type: 'crisis', title: 'Quick Report', message: 'Tap to open staff incident report form', icon: '🆘' })
              } else {
                setActiveNav(item.id)
                setSelectedIncident(null)
              }
            }}
            aria-label={item.label}
          >
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.badge && (
                <div style={{
                  position: 'absolute',
                  top: -6,
                  right: -8,
                  background: 'var(--color-crisis)',
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 800,
                }}>
                  {item.badge}
                </div>
              )}
            </div>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
