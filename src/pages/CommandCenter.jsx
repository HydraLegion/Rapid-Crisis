import { useState } from 'react'
import { ArrowLeft, Building2, TrendingUp, Radio, BookOpen, BarChart2, AlertTriangle, CheckCircle, Clock, ChevronRight, Search, Download, Plus, Zap, Shield, X, FileText } from 'lucide-react'
const ClipboardList = FileText
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PROPERTIES, MOCK_INCIDENTS, ANALYTICS_DATA, SEVERITY_LABELS, STAFF_MEMBERS, PLAYBOOKS, RBAC_MATRIX, SLA_MATRIX } from '../data/mockData'

function timeAgo(date) {
  if (!date) return '—'
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

const CUSTOM_TOOLTIP_STYLE = {
  background: 'rgba(21, 21, 40, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  color: '#F5F5FA',
}

// ---- OVERVIEW DASHBOARD ----
function OverviewDashboard({ onSelectProperty }) {
  const { kpis, responseTimeTrend, incidentsByType } = ANALYTICS_DATA

  return (
    <div style={{ padding: 'var(--space-5)', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Active Alert Banner */}
      {kpis.activeIncidents > 0 && (
        <div className="broadcast-banner animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ fontSize: 24, animation: 'heartbeat 1.5s infinite' }}>🚨</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-crisis)' }}>
                  {kpis.activeIncidents} ACTIVE INCIDENTS ACROSS PROPERTIES
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  S0: 1 · S1: 2 · All others monitored
                </div>
              </div>
            </div>
            <button className="btn btn-crisis btn-sm">View All</button>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {[
          { label: 'Active Incidents', value: kpis.activeIncidents, color: 'var(--color-crisis)', icon: '🚨', delta: null },
          { label: 'Avg Response', value: kpis.avgResponseTime, color: 'var(--color-safe)', icon: '⚡', delta: '↓ 12% vs last month' },
          { label: 'Avg Ack Time', value: kpis.avgAckTime, color: 'var(--color-blue)', icon: '✅', delta: '↓ 8%' },
          { label: 'False Alarm Rate', value: kpis.falseAlarmRate, color: 'var(--color-amber)', icon: '⚠️', delta: '↓ 2.1%' },
          { label: 'Staff Adoption', value: kpis.staffAdoption, color: 'var(--color-safe)', icon: '👥', delta: '↑ 4%' },
          { label: 'NPS Score', value: kpis.npsScore, color: 'var(--color-purple)', icon: '⭐', delta: '↑ 6 pts' },
          { label: 'This Month', value: kpis.totalThisMonth, color: 'var(--text-secondary)', icon: '📊', delta: `${kpis.escalatedToEmergency} escalated` },
          { label: 'Resolution Rate', value: kpis.resolutionRate, color: 'var(--color-safe)', icon: '💚', delta: 'On target' },
        ].map((kpi, i) => (
          <div key={kpi.label} className={`metric-card animate-fade-in delay-${Math.min(i + 1, 5)}`}>
            <div style={{ fontSize: 20 }}>{kpi.icon}</div>
            <div className="metric-value" style={{ color: kpi.color, fontSize: 'var(--text-2xl)' }}>{kpi.value}</div>
            <div className="metric-label">{kpi.label}</div>
            {kpi.delta && <div className="metric-delta metric-delta-up" style={{ color: 'var(--text-tertiary)' }}>{kpi.delta}</div>}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Response Time Trend */}
        <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Avg Response Time (min)</span>
            <span className="badge badge-safe">↓ Improving</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={responseTimeTrend}>
              <defs>
                <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0A84FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#30D158" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#30D158" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(245,245,250,0.38)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(245,245,250,0.38)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="target" stroke="#30D158" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#targetGrad)" name="Target" />
              <Area type="monotone" dataKey="avgMin" stroke="#0A84FF" strokeWidth={2} fill="url(#respGrad)" name="Avg Response" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Types */}
        <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Incidents by Type (this month)</div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={incidentsByType} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="count" strokeWidth={0}>
                  {incidentsByType.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {incidentsByType.map(item => (
                <div key={item.type} className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>{item.type}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties */}
      <div>
        <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.02em', marginBottom: 'var(--space-4)' }}>
          Properties Overview
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
          {PROPERTIES.map((prop, i) => (
            <div
              key={prop.id}
              className={`glass-card animate-fade-in delay-${i + 1}`}
              style={{
                padding: 'var(--space-4)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                borderColor: prop.activeIncidents > 0 ? 'rgba(255,45,85,0.3)' : 'var(--border-subtle)',
              }}
              onClick={() => onSelectProperty(prop)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{prop.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{prop.city}, {prop.country}</div>
                </div>
                {prop.activeIncidents > 0 ? (
                  <span className="badge sev-s0" style={{ animation: 'pulseCrisis 2s infinite' }}>
                    {prop.activeIncidents} ACTIVE
                  </span>
                ) : (
                  <span className="badge badge-safe">ALL CLEAR</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 'var(--space-3)' }}>
                {[
                  { label: 'Rooms', value: prop.rooms },
                  { label: 'Floors', value: prop.floors },
                  { label: 'Staff', value: prop.staffOnDuty },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.02em' }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Readiness */}
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Readiness</span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: prop.readinessScore >= 90 ? 'var(--color-safe)' : 'var(--color-amber)' }}>
                  {prop.readinessScore}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${prop.readinessScore}%`,
                    background: prop.readinessScore >= 90 ? 'var(--color-safe)' : 'var(--color-amber)',
                  }}
                />
              </div>

              <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', gap: 4, alignItems: 'center' }}>
                <ChevronRight size={10} />
                View property details
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- BROADCAST ALERT ----
function BroadcastCenter({ addToast }) {
  const [message, setMessage] = useState('')
  const [selectedZones, setSelectedZones] = useState([])
  const [severity, setSeverity] = useState('S2')
  const [channel, setChannel] = useState(['push', 'sms'])
  const [sent, setSent] = useState(false)

  const zones = [
    'All Properties', 'The Grand Meridian', 'Azure Bay Resort', 'Skyline Heights', 'Harbor View',
    'Lobby', 'Pool Area', 'Parking', 'Restaurant', 'All Guest Rooms', 'Back of House',
  ]

  const toggleZone = (z) => setSelectedZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z])
  const toggleChannel = (c) => setChannel(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const handleSend = () => {
    if (!message.trim() || selectedZones.length === 0) return
    setSent(true)
    addToast({ type: 'crisis', title: 'Broadcast Sent', message: `Alert sent to: ${selectedZones.join(', ')}`, icon: '📡', duration: 6000 })
  }

  if (sent) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 'var(--space-4)' }}>📡</div>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>Broadcast Sent!</div>
        <div style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Alert delivered to {selectedZones.length} zone(s) via {channel.join(' + ').toUpperCase()}
        </div>
        <div className="glass-card" style={{ padding: 'var(--space-4)', width: '100%', maxWidth: 400, textAlign: 'left', marginBottom: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Delivery Status</div>
          {[['Push', '✅ 48/48 delivered'], ['SMS', '✅ 23/23 sent'], ['Voice', 'Not selected']].map(([ch, status]) => (
            <div key={ch} className="flex justify-between" style={{ fontSize: 'var(--text-sm)', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{ch}</span>
              <span style={{ fontWeight: 600 }}>{status}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={() => setSent(false)}>Send Another Broadcast</button>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', letterSpacing: '-0.02em' }}>Broadcast Alert</div>

      {/* Severity */}
      <div>
        <div className="form-label" style={{ marginBottom: 'var(--space-2)' }}>Alert Severity</div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {['S0', 'S1', 'S2', 'S3'].map(s => (
            <button
              key={s}
              className={`chip ${severity === s ? 'selected' : ''}`}
              style={severity === s ? {
                background: `${SEVERITY_LABELS[s].color}20`,
                borderColor: `${SEVERITY_LABELS[s].color}50`,
                color: SEVERITY_LABELS[s].color,
              } : {}}
              onClick={() => setSeverity(s)}
            >
              {s} · {SEVERITY_LABELS[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="form-group">
        <label className="form-label">Alert Message</label>
        <textarea
          className="input"
          placeholder="e.g., Attention all guests: Please proceed to the nearest emergency exit using stairwells. Do not use elevators. This is not a drill."
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{ minHeight: 100 }}
        />
        <span className="form-hint">{message.length}/280 characters</span>
      </div>

      {/* Zones */}
      <div>
        <div className="form-label" style={{ marginBottom: 'var(--space-2)' }}>Target Zones</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {zones.map(z => (
            <button key={z} className={`zone-pill ${selectedZones.includes(z) ? 'selected' : ''}`} onClick={() => toggleZone(z)}>
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Channels */}
      <div>
        <div className="form-label" style={{ marginBottom: 'var(--space-2)' }}>Delivery Channels</div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {[
            { id: 'push', label: '📱 Push Notification' },
            { id: 'sms', label: '💬 SMS' },
            { id: 'voice', label: '📞 Voice Call' },
            { id: 'tv', label: '📺 In-Room TV' },
            { id: 'radio', label: '📡 Radio / PA' },
          ].map(ch => (
            <button key={ch.id} className={`chip ${channel.includes(ch.id) ? 'selected' : ''}`} onClick={() => toggleChannel(ch.id)}>
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview + Send */}
      {message && selectedZones.length > 0 && (
        <div className="glass-card-crisis" style={{ padding: 'var(--space-4)', animation: 'none' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-crisis)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
            PREVIEW
          </div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>🚨 Emergency Alert — {SEVERITY_LABELS[severity].label}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 8 }}>
            → Zones: {selectedZones.join(', ')} · Via: {channel.join(', ')}
          </div>
        </div>
      )}

      <button
        className="btn btn-crisis btn-lg w-full"
        onClick={handleSend}
        disabled={!message.trim() || selectedZones.length === 0}
        id="send-broadcast-btn"
      >
        <Radio size={16} />
        Send Broadcast Alert
      </button>

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Broadcasts are logged, timestamped, and attributed to your account. This action is irreversible.
      </div>
    </div>
  )
}

// ---- ANALYTICS VIEW ----
function AnalyticsView() {
  const { heatmapData, drillCompliance } = ANALYTICS_DATA

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getHeatColor = (val) => {
    if (val === 0) return 'rgba(255,255,255,0.04)'
    if (val <= 1) return 'rgba(255,214,10,0.2)'
    if (val <= 2) return 'rgba(255,159,10,0.35)'
    if (val <= 3) return 'rgba(255,107,53,0.45)'
    return 'rgba(255,45,85,0.55)'
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', letterSpacing: '-0.02em' }}>Analytics & Hotspots</div>

      {/* Heatmap */}
      <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Incident Heatmap — Zone × Day (Last 30 Days)</div>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          <div />
          {days.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.03em' }}>{d}</div>
          ))}
        </div>
        {heatmapData.map(row => (
          <div key={row.zone} style={{ display: 'grid', gridTemplateColumns: '100px repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center' }}>{row.zone}</div>
            {[row.mon, row.tue, row.wed, row.thu, row.fri, row.sat, row.sun].map((val, i) => (
              <div
                key={i}
                className="heatmap-cell"
                style={{
                  height: 32,
                  background: getHeatColor(val),
                  color: val >= 3 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  border: val >= 4 ? '1px solid rgba(255,45,85,0.4)' : '1px solid transparent',
                }}
                title={`${row.zone} · ${days[i]}: ${val} incidents`}
              >
                {val || ''}
              </div>
            ))}
          </div>
        ))}
        {/* Legend */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', fontSize: 10, color: 'var(--text-tertiary)' }}>
          <span>Intensity:</span>
          {[0, 1, 2, 3, 5].map(v => (
            <div key={v} style={{ width: 16, height: 16, borderRadius: 3, background: getHeatColor(v) }} title={`${v}`} />
          ))}
          <span>→ High</span>
        </div>
      </div>

      {/* Response Time Bar Chart */}
      <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Response Time vs Target (minutes)</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ANALYTICS_DATA.responseTimeTrend} barSize={16}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(245,245,250,0.38)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'rgba(245,245,250,0.38)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: 'rgba(245,245,250,0.5)' }} />
            <Bar dataKey="avgMin" name="Avg Response (min)" fill="#0A84FF" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" name="Target (min)" fill="rgba(48,209,88,0.5)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Drill Compliance */}
      <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Drill Compliance by Property</div>
        {drillCompliance.map(item => (
          <div key={item.property} style={{ marginBottom: 'var(--space-4)' }}>
            <div className="flex justify-between items-center mb-1">
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{item.property}</span>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Last drill: {item.lastDrill}</span>
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: item.score >= 90 ? 'var(--color-safe)' : 'var(--color-amber)',
                }}>{item.score}%</span>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${item.score}%`,
                  height: 6,
                  background: item.score >= 90 ? 'var(--color-safe)' : 'var(--color-amber)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- PLAYBOOKS ----
function PlaybooksView() {
  const [selected, setSelected] = useState(null)

  if (selected) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="flex items-center gap-3">
          <button className="btn btn-icon btn-ghost" onClick={() => setSelected(null)}><ArrowLeft size={16} /></button>
          <div>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>{selected.title}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Version {selected.version} · Last updated</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
          {selected.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3" style={{ padding: 'var(--space-3) 0', borderBottom: i < selected.steps.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--color-blue-dim)',
                border: '1px solid rgba(10,132,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--color-blue)',
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{step}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-ghost flex-1"><Download size={14} /> Export PDF</button>
          <button className="btn btn-primary flex-1">Activate Playbook</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', letterSpacing: '-0.02em' }}>SOPs & Playbooks</div>
      {PLAYBOOKS.map(pb => {
        const icons = { medical: '🏥', fire: '🔥', threat: '🛡️', harassment: '⚠️' }
        return (
          <div
            key={pb.id}
            className="glass-card"
            style={{ padding: 'var(--space-4)', cursor: 'pointer' }}
            onClick={() => setSelected(pb)}
          >
            <div className="flex items-center gap-3">
              <div style={{ fontSize: 28 }}>{icons[pb.type]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{pb.title}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {pb.steps.length} steps · v{pb.version}
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
            </div>
          </div>
        )
      })}

      {/* RBAC Table */}
      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', letterSpacing: '-0.02em', marginTop: 'var(--space-4)' }}>RBAC Permissions Matrix</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)' }}>
              {['Permission', 'Guest', 'Front Desk', 'Security', 'Housekeeping', 'Manager', 'Command', 'Responder'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RBAC_MATRIX.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{row.permission}</td>
                {[row.guest, row.frontDesk, row.security, row.housekeeping, row.manager, row.command, row.responder].map((val, j) => (
                  <td key={j} style={{ padding: '8px 12px', textAlign: 'center', fontSize: 13 }}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SLA Matrix */}
      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', letterSpacing: '-0.02em', marginTop: 'var(--space-4)' }}>SLA & Escalation Matrix</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)' }}>
              {['Severity', 'Criteria', 'Ack SLA', 'Dispatch SLA', 'Resolution Target', 'Escalation'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLA_MATRIX.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <td style={{ padding: '8px 12px', fontWeight: 800, color: ['var(--sev-s0)', 'var(--sev-s1)', 'var(--sev-s2)', 'var(--sev-s3)', 'var(--sev-s4)'][i], whiteSpace: 'nowrap' }}>{row.severity}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{row.criteria}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.ackSLA}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.dispatchSLA}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.resolutionTarget}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontSize: 10 }}>{row.escalation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- POSTMORTEM BUILDER ----
function PostmortemBuilder({ addToast }) {
  const [incident, setIncident] = useState(MOCK_INCIDENTS[3])
  const [sections, setSections] = useState({
    summary: '',
    timeline: '',
    rootCause: '',
    impact: '',
    whatWorked: '',
    whatFailed: '',
    actions: '',
  })

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', letterSpacing: '-0.02em' }}>Postmortem Generator</div>

      <div className="glass-card" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        <div style={{ fontSize: 24 }}>📋</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>{incident.title}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            {incident.id} · Resolved {timeAgo(incident.resolvedAt)}
          </div>
        </div>
        <span className="badge badge-muted">RESOLVED</span>
      </div>

      <div className="alert-banner alert-banner-info">
        <Zap size={16} style={{ flexShrink: 0, color: 'var(--color-blue)' }} />
        <div className="text-sm">AI-assisted template pre-filled from incident timeline. Review and complete each section.</div>
      </div>

      {[
        { key: 'summary', label: 'Executive Summary', placeholder: 'Brief description of what happened, when, where, and the outcome...' },
        { key: 'timeline', label: 'Incident Timeline', placeholder: 'Key events with timestamps (auto-populated from incident record)...' },
        { key: 'rootCause', label: 'Root Cause Analysis', placeholder: 'What was the underlying cause? Were there contributing factors?' },
        { key: 'impact', label: 'Impact Assessment', placeholder: 'Guest impact, business impact, financial impact, reputational risk...' },
        { key: 'whatWorked', label: 'What Worked Well ✅', placeholder: 'Staff response, processes, tools, or communications that worked effectively...' },
        { key: 'whatFailed', label: 'What Failed / Can Improve ⚠️', placeholder: 'Gaps in processes, communication failures, missing tools or training...' },
        { key: 'actions', label: 'Corrective Action Items', placeholder: 'Specific, assigned, time-bound actions to prevent recurrence...' },
      ].map(section => (
        <div key={section.key} className="form-group">
          <label className="form-label">{section.label}</label>
          <textarea
            className="input"
            placeholder={section.placeholder}
            value={sections[section.key]}
            onChange={e => setSections(prev => ({ ...prev, [section.key]: e.target.value }))}
            style={{ minHeight: 85 }}
          />
        </div>
      ))}

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button className="btn btn-ghost flex-1"><Download size={14} /> Export PDF</button>
        <button
          className="btn btn-primary flex-1"
          onClick={() => addToast({ type: 'success', title: 'Postmortem Saved', message: 'Report filed and shared with command center.', icon: '📋' })}
        >
          <CheckCircle size={14} />
          Save & Publish Report
        </button>
      </div>
    </div>
  )
}

// ---- PROPERTY DETAIL ----
function PropertyDetail({ property, onBack }) {
  const incidents = MOCK_INCIDENTS.filter(i => i.propertyId === property.id)
  const activeIncidents = incidents.filter(i => i.status !== 'resolved')

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div className="flex items-center gap-3">
        <button className="btn btn-icon btn-ghost" onClick={onBack}><ArrowLeft size={16} /></button>
        <div>
          <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>{property.name}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{property.city}, {property.country} · {property.rooms} rooms · {property.floors} floors</div>
        </div>
      </div>

      {/* Active incidents */}
      {activeIncidents.length > 0 ? (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>Active Incidents</div>
          {activeIncidents.map(inc => (
            <div key={inc.id} className="glass-card-crisis" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <div style={{ fontWeight: 700 }}>{inc.title}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
                {inc.location} · {timeAgo(inc.reportedAt)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert-banner alert-banner-safe">
          <CheckCircle size={16} style={{ color: 'var(--color-safe)' }} />
          <div className="text-sm font-bold">All Clear — No active incidents at this property</div>
        </div>
      )}

      {/* Staff */}
      <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>Staff On Duty ({property.staffOnDuty})</div>
        {STAFF_MEMBERS.filter(s => s.propertyId === property.id).map(m => (
          <div key={m.id} className="flex justify-between items-center" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <div className="avatar avatar-sm">{m.avatar}</div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{m.role}</div>
              </div>
            </div>
            <span className={`badge ${m.status === 'on-duty' ? 'badge-safe' : 'badge-muted'}`}>{m.status}</span>
          </div>
        ))}
      </div>

      {/* Zones */}
      <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>Zones</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {property.zones.map(z => <span key={z} className="chip">{z}</span>)}
        </div>
      </div>
    </div>
  )
}

// ---- MAIN COMMAND CENTER ----
export default function CommandCenter({ onBack, addToast, isOnline }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProperty, setSelectedProperty] = useState(null)

  const TABS = [
    { id: 'overview', label: '🏢 Overview', icon: Building2 },
    { id: 'broadcast', label: '📡 Broadcast', icon: Radio },
    { id: 'analytics', label: '📊 Analytics', icon: BarChart2 },
    { id: 'playbooks', label: '📖 Playbooks', icon: BookOpen },
    { id: 'postmortem', label: '📋 Postmortem', icon: ClipboardList },
  ]

  return (
    <div className="bg-animated-command min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="topbar" style={{ justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3">
          <button className="btn btn-icon btn-ghost" onClick={onBack} aria-label="Exit command center">
            <ArrowLeft size={16} />
          </button>
          <div className="logo-mark">
            <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #BF5AF2, #9030D0)' }}>🏢</div>
            <div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, letterSpacing: '-0.03em' }}>Command Center</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Multi-Property Operations</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-crisis)' }}>
              3 ACTIVE INCIDENTS
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>4 properties · 48 staff</div>
          </div>
          <div className="avatar" style={{ background: 'linear-gradient(135deg, #BF5AF2, #9030D0)' }}>CC</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ paddingLeft: 'var(--space-4)', overflowX: 'auto', flexShrink: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setSelectedProperty(null) }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'overview' && !selectedProperty && (
          <OverviewDashboard onSelectProperty={setSelectedProperty} />
        )}
        {activeTab === 'overview' && selectedProperty && (
          <PropertyDetail property={selectedProperty} onBack={() => setSelectedProperty(null)} />
        )}
        {activeTab === 'broadcast' && <BroadcastCenter addToast={addToast} />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'playbooks' && <PlaybooksView />}
        {activeTab === 'postmortem' && <PostmortemBuilder addToast={addToast} />}
      </div>
    </div>
  )
}
