import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, CheckCircle, Phone, EyeOff, Eye, Send, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import useStore from '../../store/useStore'
import { useToast } from '../../components/shared/ToastProvider'
import OfflineBanner from '../../components/shared/OfflineBanner'

// Incident types for selection
const TYPES = [
  { id:'medical',        label:'Medical',      icon:'🚑', sev:'S0', desc:'Injury, illness, chest pain' },
  { id:'fire',           label:'Fire / Smoke',  icon:'🔥', sev:'S0', desc:'Fire, smoke, alarm' },
  { id:'threat',         label:'Security',      icon:'⚠️', sev:'S1', desc:'Threat, violence, intrusion' },
  { id:'harassment',     label:'Harassment',    icon:'🛡️', sev:'S1', desc:'Verbal or physical abuse' },
  { id:'missing',        label:'Missing Person',icon:'👤', sev:'S1', desc:'Child or vulnerable guest' },
  { id:'infrastructure', label:'Facility Issue',icon:'⚡', sev:'S2', desc:'Power, water, elevator' },
  { id:'other',          label:'Other',         icon:'📣', sev:'S2', desc:'Anything else' },
]

const LOCATIONS = ['Room 101','Room 202','Room 301','Room 1204','Lobby','Pool Area','Restaurant','Parking','Elevator','Gym','Conference Room A','Corridor L3']

const TRIAGE_QUESTIONS = [
  { id:'conscious', q:'Is the person conscious and breathing normally?', yes:'good', no:'critical' },
  { id:'bleeding',  q:'Is there severe bleeding or visible injury?',      yes:'critical', no:'good' },
  { id:'chest',     q:'Is there chest pain or difficulty breathing?',     yes:'critical', no:'good' },
]

const STEPS = ['type','location','triage','submitting','status']

function StepDots({ step }) {
  const steps = ['type','location','triage']
  const idx = steps.indexOf(step)
  if (idx < 0) return null
  return (
    <div className="flex justify-center gap-2" style={{ padding:'8px 0' }}>
      {steps.map((_, i) => (
        <div key={i} style={{ width: i===idx?24:8, height:8, borderRadius:4, background: i<=idx ? 'var(--color-crisis)' : 'var(--border-medium)', transition:'all 0.3s' }} />
      ))}
    </div>
  )
}

export default function GuestSOS() {
  const router = useRouter()
  const toast = useToast()
  const submitSOS = useStore(s => s.submitSOS)

  const [step, setStep] = useState('type')
  const [type, setType] = useState(null)
  const [silent, setSilent] = useState(false)
  const [location, setLocation] = useState('')
  const [customLoc, setCustomLoc] = useState('')
  const [locSearch, setLocSearch] = useState('')
  const [triageIdx, setTriageIdx] = useState(0)
  const [triageAnswers, setTriageAnswers] = useState({})
  const [incidentId, setIncidentId] = useState(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const u = () => setIsOnline(navigator.onLine)
    u(); window.addEventListener('online', u); window.addEventListener('offline', u)
    return () => { window.removeEventListener('online', u); window.removeEventListener('offline', u) }
  }, [])

  const filtered = LOCATIONS.filter(l => l.toLowerCase().includes(locSearch.toLowerCase()))
  const selectedLoc = location || customLoc

  const doSubmit = () => {
    const meta = TYPES.find(t => t.id === type)
    const id = submitSOS({
      type,
      severity: meta?.sev || 'S2',
      location: selectedLoc || 'Unknown',
      silentMode: silent,
      description: silent
        ? 'Silent SOS — no details provided.'
        : `Guest reported ${meta?.label}. Location: ${selectedLoc || 'Unknown'}.`,
    })
    setIncidentId(id)
    setStep('status')
    toast({ type:'info', title:'SOS sent', message:'Staff are being notified now.' })
  }

  // ── STEP: type ──────────────────────────────────────────────────────────────
  const renderType = () => (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <div className="fw-800 text-xl mb-1">What&apos;s happening?</div>
        <div className="text-sm text-secondary">Tap the type that best matches. Don&apos;t overthink it.</div>
      </div>

      {/* Silent mode toggle */}
      <button
        onClick={() => setSilent(v => !v)}
        className={`btn ${silent ? 'btn-amber' : 'btn-ghost'} btn-full mb-4`}
        style={{ justifyContent:'space-between' }}
        aria-pressed={silent}
      >
        <span className="flex items-center gap-2">
          {silent ? <EyeOff size={18} /> : <Eye size={18} />}
          <span>
            <span className="fw-700">Silent Mode</span>
            <span className="text-xs text-secondary" style={{ display:'block', lineHeight:1.3 }}>
              {silent ? 'ON — no alerts visible to others' : 'Cannot speak? Tap to hide alerts.'}
            </span>
          </span>
        </span>
        <div style={{ width:36, height:22, borderRadius:11, background: silent ? 'var(--color-amber)' : 'var(--border-medium)', transition:'background 0.2s', position:'relative', flexShrink:0 }}>
          <div style={{ position:'absolute', top:3, left: silent ? 17 : 3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
        </div>
      </button>

      {silent && (
        <div className="alert alert-amber mb-4">
          <EyeOff size={16} style={{ flexShrink:0, color:'var(--color-amber)' }} />
          <div className="text-sm">Silent mode is ON — security will be alerted without any visible or audible alerts from your device.</div>
        </div>
      )}

      <div className="grid-2" style={{ gap:12 }}>
        {TYPES.map(t => (
          <button
            key={t.id}
            className={`type-card ${type===t.id ? 'selected' : ''}`}
            onClick={() => setType(t.id)}
            aria-pressed={type===t.id}
          >
            <span style={{ fontSize:32 }}>{t.icon}</span>
            <span className="fw-700 text-sm lh-tight">{t.label}</span>
            <span className="text-xs text-secondary">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )

  // ── STEP: location ──────────────────────────────────────────────────────────
  const renderLocation = () => (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <div className="fw-800 text-xl mb-1">Where are you?</div>
        <div className="text-sm text-secondary">Pick a room or area. Approximate is fine.</div>
      </div>

      <div className="form-group mb-3">
        <div className="search-wrap">
          <MapPin size={16} className="search-icon" />
          <input
            className="input search-input"
            placeholder="Search room or area…"
            value={locSearch}
            onChange={e => { setLocSearch(e.target.value); setLocation('') }}
            aria-label="Search location"
            autoFocus
          />
        </div>
      </div>

      <div style={{ maxHeight:220, overflowY:'auto', display:'flex', flexDirection:'column', gap:4, marginBottom:16 }}>
        {filtered.slice(0, 10).map(l => (
          <button
            key={l}
            className="btn btn-ghost"
            style={{ justifyContent:'space-between', background: location===l ? 'var(--color-blue-dim)' : undefined, borderColor: location===l ? 'rgba(10,132,255,0.4)' : undefined }}
            onClick={() => { setLocation(l); setLocSearch(l) }}
            aria-pressed={location===l}
          >
            <span className="flex items-center gap-2"><MapPin size={14} />{l}</span>
            {location===l && <CheckCircle size={14} style={{ color:'var(--color-blue)' }} />}
          </button>
        ))}
        {filtered.length === 0 && <div className="text-secondary text-sm text-center" style={{ padding:16 }}>No match. Use text below.</div>}
      </div>

      <div className="divider mb-3" />

      <div className="form-group mb-3">
        <label className="input-label">Or describe your location</label>
        <input
          className="input"
          placeholder="e.g., near the pool entrance, stairwell level 3…"
          value={customLoc}
          onChange={e => { setCustomLoc(e.target.value); setLocation('') }}
          aria-label="Describe location"
        />
      </div>

      <button
        className="btn btn-ghost btn-full"
        onClick={() => { setLocation("I don't know"); setCustomLoc('') }}
        aria-pressed={location === "I don't know"}
      >
        I&apos;m not sure of my location
      </button>
    </div>
  )

  // ── STEP: triage (medical only) ─────────────────────────────────────────────
  const renderTriage = () => {
    const q = TRIAGE_QUESTIONS[triageIdx]
    const critical = Object.values(triageAnswers).some(a => a === 'critical')
    return (
      <div className="animate-fade-in-up">
        <div className="text-xs fw-700 uppercase text-tertiary mb-3">
          Medical quick-check {triageIdx + 1} of {TRIAGE_QUESTIONS.length}
        </div>
        {critical && (
          <div className="alert alert-crisis mb-4">
            <AlertTriangle size={16} style={{ color:'var(--color-crisis)', flexShrink:0 }} />
            <div className="text-sm fw-700" style={{ color:'var(--color-crisis)' }}>Emergency services being dispatched. Continue answering.</div>
          </div>
        )}
        <div className="card card-pad-lg mb-4" style={{ textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🏥</div>
          <div className="fw-700 text-lg lh-tight mb-2">{q.q}</div>
          <div className="text-xs text-secondary">Answer as best you can — helps us prepare the right response.</div>
        </div>
        <div className="grid-2" style={{ gap:12 }}>
          <button className="btn btn-safe" style={{ height:72, fontSize:20 }} onClick={() => { setTriageAnswers(a => ({...a, [q.id]:'good'})); triageIdx < TRIAGE_QUESTIONS.length-1 ? setTriageIdx(i=>i+1) : doSubmit() }}>✅ YES</button>
          <button className="btn btn-crisis" style={{ height:72, fontSize:20 }} onClick={() => { setTriageAnswers(a => ({...a, [q.id]:'critical'})); triageIdx < TRIAGE_QUESTIONS.length-1 ? setTriageIdx(i=>i+1) : doSubmit() }}>❌ NO</button>
        </div>
        <button className="btn btn-ghost btn-full mt-3" onClick={doSubmit}>Skip — send SOS now</button>
      </div>
    )
  }

  // ── STEP: submitting ────────────────────────────────────────────────────────
  const renderSubmitting = () => (
    <div className="full-center animate-fade-in" style={{ flex:1 }}>
      <div style={{ fontSize:64, marginBottom:16 }}>📡</div>
      <div className="fw-800 text-xl mb-2">Sending your alert…</div>
      <div className="text-secondary text-sm">
        {isOnline ? 'Notifying security team now.' : 'Queued — will send when network is restored.'}
      </div>
    </div>
  )

  // ── STEP: status ────────────────────────────────────────────────────────────
  const renderStatus = () => (
    <div className="animate-fade-in-up flex-col gap-4">
      <div className="card card-pad-lg" style={{ background:'var(--color-safe-dim)', border:'1px solid rgba(48,209,88,0.3)', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:8 }}>✅</div>
        <div className="fw-900 text-xl text-safe mb-1">Help is on the way</div>
        <div className="text-secondary text-sm">Security staff have been alerted and are responding.</div>
        {incidentId && <div className="text-xs text-tertiary mono mt-2">Ref: {incidentId}</div>}
      </div>

      <div className="card card-pad">
        <div className="fw-700 mb-3">While you wait</div>
        {(TYPES.find(t=>t.id===type)?.id === 'medical' ? [
          '🧘 Stay calm and breathe slowly',
          '🛏️ Keep the person still and comfortable',
          '🚪 Unlock or keep the door ajar for staff',
          '📱 Keep this screen open',
        ] : type === 'fire' ? [
          '🚪 Feel the door before opening',
          '🪜 Use stairs only — avoid elevators',
          '📍 Go to muster point: Main Entrance',
          '🙅 Do not re-enter until cleared',
        ] : [
          '📱 Stay on this screen for updates',
          '🔒 Lock your door if threatened',
          '📞 Call 112 if in immediate danger',
          '🏨 Staff will arrive within ETA',
        ]).map(i => <div key={i} className="text-sm lh-normal" style={{ padding:'6px 0', borderBottom:'1px solid var(--border-subtle)' }}>{i}</div>)}
      </div>

      <button
        className="btn btn-crisis btn-full"
        onClick={() => { if(typeof window !== 'undefined') window.location.href = 'tel:112' }}
        aria-label="Call emergency services 112"
      >
        <Phone size={18} /> Call 112 — Emergency Services
      </button>

      <button className="btn btn-ghost btn-full" onClick={() => router.push('/')}>← Back to Home</button>
    </div>
  )

  const canProceedFromType = !!type
  const canProceedFromLoc  = !!(location || customLoc.trim())

  const stepMap = {
    type:       { render: renderType,       next: () => setStep('location') },
    location:   { render: renderLocation,   next: () => type==='medical' ? setStep('triage') : (setStep('submitting'), setTimeout(doSubmit, 1200)) },
    triage:     { render: renderTriage,     next: null },
    submitting: { render: renderSubmitting, next: null },
    status:     { render: renderStatus,     next: null },
  }
  const current = stepMap[step]
  const showBack = step !== 'status' && step !== 'submitting'
  const showNext = step === 'type' || step === 'location'
  const canNext = step === 'type' ? canProceedFromType : canProceedFromLoc

  return (
    <>
      <Head>
        <title>Guest SOS — Rapid Crisis Response</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <OfflineBanner />

      <div className="page bg-animated" style={{ maxWidth:480, margin:'0 auto' }}>
        {/* Header */}
        <header className="topbar">
          {showBack ? (
            <button
              className="btn btn-icon btn-ghost"
              onClick={() => {
                const back = { type:'type', location:'type', triage:'location' }
                if (back[step]) setStep(back[step]); else router.push('/')
              }}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          ) : <div style={{ width:48 }} />}

          <div className="topbar-brand" style={{ position:'absolute', left:'50%', transform:'translateX(-50%)' }}>
            <div className="logo-icon">🆘</div>
            <span>Guest SOS</span>
          </div>

          <div className="flex items-center gap-2">
            {isOnline
              ? <Wifi size={16} style={{ color:'var(--color-safe)' }} />
              : <WifiOff size={16} style={{ color:'var(--color-amber)' }} />}
          </div>
        </header>

        {/* Step dots */}
        <StepDots step={step} />

        {/* Content area */}
        <div className="page-content">
          <div className="container" style={{ paddingTop:16, paddingBottom:16 }}>
            {current.render()}
          </div>
        </div>

        {/* Bottom CTA bar */}
        {showNext && (
          <div className="bottom-bar">
            <button
              className="btn btn-crisis btn-lg btn-full"
              disabled={!canNext}
              onClick={current.next}
              id="guest-next-btn"
              aria-label={step === 'type' ? 'Continue with selected incident type' : 'Confirm location and send alert'}
            >
              {step === 'type' ? (
                <>{type ? `Continue — ${TYPES.find(t=>t.id===type)?.label}` : 'Select an incident type'}</>
              ) : (
                <><Send size={18} /> Confirm Location &amp; Send Alert</>
              )}
            </button>
          </div>
        )}

        {/* Fallback SOS on first screen */}
        {step === 'type' && !type && (
          <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', zIndex:5, paddingBottom: 'var(--safe-bottom)' }}>
            <button
              className="sos-btn"
              onClick={() => {
                setType('other'); setSilent(false)
                setStep('location')
              }}
              id="sos-main-btn"
              aria-label="Emergency SOS — press for immediate help"
            >
              <span style={{ fontSize:36 }}>🆘</span>
              <span className="fw-900" style={{ fontSize:18, letterSpacing:'0.05em' }}>SOS</span>
              <span style={{ fontSize:11, opacity:0.8 }}>Press for Help</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
