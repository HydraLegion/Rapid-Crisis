const SEV_MAP = {
  S0: { label: 'Critical', cls: 'sev-pill-s0' },
  S1: { label: 'High',     cls: 'sev-pill-s1' },
  S2: { label: 'Medium',   cls: 'sev-pill-s2' },
  S3: { label: 'Low',      cls: 'sev-pill-s3' },
  S4: { label: 'Info',     cls: 'sev-pill-s4' },
}

const STATUS_MAP = {
  active:         { label: 'Active',         cls: 'status-active' },
  acknowledged:   { label: 'Acknowledged',   cls: 'status-acknowledged' },
  responding:     { label: 'Responding',      cls: 'status-responding' },
  investigating:  { label: 'Investigating',   cls: 'status-investigating' },
  resolved:       { label: 'Resolved',        cls: 'status-resolved' },
}

export function SeverityPill({ sev }) {
  const info = SEV_MAP[sev] || SEV_MAP.S4
  return <span className={`badge ${info.cls}`}>{sev} · {info.label}</span>
}

export function StatusPill({ status }) {
  const info = STATUS_MAP[status] || { label: status, cls: 'badge-muted' }
  return <span className={`badge ${info.cls}`}>{info.label}</span>
}

export const TYPE_META = {
  medical:        { label: 'Medical Emergency', icon: '🚑', sev: 'S0' },
  fire:           { label: 'Fire / Smoke',       icon: '🔥', sev: 'S0' },
  threat:         { label: 'Security Threat',    icon: '⚠️', sev: 'S1' },
  harassment:     { label: 'Harassment',         icon: '🛡️', sev: 'S1' },
  missing:        { label: 'Missing Person',     icon: '👤', sev: 'S1' },
  infrastructure: { label: 'Infrastructure',    icon: '⚡', sev: 'S2' },
  other:          { label: 'Other',              icon: '📣', sev: 'S2' },
}
