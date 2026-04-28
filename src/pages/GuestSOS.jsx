import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, MapPin, Phone, MessageSquare, ChevronRight, CheckCircle, Clock, Upload, Volume2, Eye, EyeOff, Send, X, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { INCIDENT_TYPES } from '../data/mockData'

const STEPS = ['entry', 'type', 'location', 'triage', 'submitted', 'status', 'chat', 'followup']

const ROOMS = [
  'Room 101', 'Room 102', 'Room 201', 'Room 202', 'Room 301',
  'Room 302', 'Room 401', 'Room 402', 'Room 503', 'Room 701',
  'Room 804', 'Room 1204', 'Lobby', 'Pool Area', 'Restaurant',
  'Parking', 'Elevator', 'Gym', 'Conference Room A', 'Corridor L3',
]

const MEDICAL_TRIAGE = [
  { id: 'conscious',   question: 'Is the person conscious and breathing?', yes: 'good', no: 'critical' },
  { id: 'bleeding',    question: 'Is there severe bleeding or injury visible?', yes: 'critical', no: 'good' },
  { id: 'allergic',    question: 'Do you suspect an allergic reaction?', yes: 'critical', no: 'good' },
  { id: 'chest',       question: 'Is there chest pain or difficulty breathing?', yes: 'critical', no: 'good' },
]

function StepIndicator({ current, total }) {
  return (
    <div className="step-indicator">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`step-dot ${i === current ? 'active' : i < current ? 'completed' : ''}`}
        />
      ))}
    </div>
  )
}

export default function GuestSOS({ onBack, addToast, isOnline }) {
  const [step, setStep] = useState('entry')
  const [incidentType, setIncidentType] = useState(null)
  const [isSilent, setIsSilent] = useState(false)
  const [location, setLocation] = useState('')
  const [locationSearch, setLocationSearch] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [triageAnswers, setTriageAnswers] = useState({})
  const [currentTriageQ, setCurrentTriageQ] = useState(0)
  const [incidentId, setIncidentId] = useState(null)
  const [eta, setEta] = useState(8)
  const [ackTime, setAckTime] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [uploadConsent, setUploadConsent] = useState(false)
  const [showBotReply, setShowBotReply] = useState(false)
  const chatEndRef = useRef(null)

  const filteredRooms = ROOMS.filter(r =>
    r.toLowerCase().includes(locationSearch.toLowerCase())
  )

  useEffect(() => {
    if (step === 'submitted') {
      const id = `INC-${Date.now().toString().slice(-6)}`
      setIncidentId(id)
      const timer = setTimeout(() => {
        setAckTime(new Date())
        addToast({
          type: 'success',
          title: 'Help is on the way',
          message: `Staff acknowledged. ETA ~${eta} minutes.`,
          icon: '✅',
        })
        setStep('status')
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [step])

  useEffect(() => {
    if (step === 'status' && eta > 0) {
      const interval = setInterval(() => setEta(e => Math.max(0, e - 1)), 60000)
      return () => clearInterval(interval)
    }
  }, [step, eta])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return
    const newMsg = { id: Date.now(), from: 'guest', text: message, time: new Date() }
    setMessages(prev => [...prev, newMsg])
    setMessage('')
    setShowBotReply(false)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'staff',
          text: 'Thank you for the update. Our team is on the way. Please stay calm and stay put if it\'s safe to do so.',
          time: new Date(),
          sender: 'Raj Kumar · Security',
        },
      ])
      setShowBotReply(true)
    }, 2500)
  }

  const handleTriageAnswer = (answer) => {
    const q = MEDICAL_TRIAGE[currentTriageQ]
    setTriageAnswers(prev => ({ ...prev, [q.id]: answer }))
    if (currentTriageQ < MEDICAL_TRIAGE.length - 1) {
      setCurrentTriageQ(c => c + 1)
    } else {
      setStep('submitted')
    }
  }

  const renderEntry = () => (
    <div className="flex flex-col items-center text-center animate-fade-in-up" style={{ padding: 'var(--space-8) var(--space-6)', flex: 1 }}>
      {!isOnline && (
        <div className="alert-banner alert-banner-amber w-full mb-4" style={{ textAlign: 'left' }}>
          <WifiOff size={16} style={{ flexShrink: 0, color: 'var(--color-amber)' }} />
          <div>
            <div className="font-bold text-sm">No network connection</div>
            <div className="text-xs text-secondary">Your SOS will be sent via SMS when network is restored. Hold phone near you.</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
          The Grand Meridian · Mumbai
        </div>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
          Need Emergency Help?
        </div>
        <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Press the button below. Help will arrive in minutes. You don't need to say anything.
        </div>
      </div>

      <div className="sos-btn-container">
        <button
          className="sos-btn"
          onClick={() => setStep('type')}
          aria-label="Press to request emergency help"
          id="sos-main-btn"
        >
          <span style={{ fontSize: 32 }}>🆘</span>
          <span>SOS</span>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, opacity: 0.8 }}>Press for Help</span>
        </button>
      </div>

      <button
        onClick={() => { setIsSilent(true); setStep('type') }}
        className="btn btn-ghost"
        style={{ marginBottom: 'var(--space-3)', width: '100%', maxWidth: 340 }}
        id="silent-mode-btn"
      >
        <EyeOff size={16} />
        Silent Mode — Cannot speak or type?
      </button>

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', maxWidth: 300, lineHeight: 1.7 }}>
        Silent mode sends immediate alert to security without any communication needed. Tap once to confirm.
      </div>

      <div className="divider" style={{ width: '100%', maxWidth: 340, margin: 'var(--space-6) auto' }} />

      {/* Quick actions */}
      <div style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 12, textTransform: 'uppercase' }}>
          Quick Help
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
          {[
            { icon: Phone, label: 'Call Front Desk', action: () => {} },
            { icon: Phone, label: 'Call Security', action: () => {} },
            { icon: AlertTriangle, label: 'View Evacuation Route', action: () => {} },
            { icon: MapPin, label: 'Locate AED / First Aid', action: () => {} },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              className="btn btn-ghost"
              style={{ flexDirection: 'column', gap: 4, padding: 'var(--space-3)', height: 'auto', fontSize: 'var(--text-xs)' }}
              onClick={action}
            >
              <Icon size={16} style={{ color: 'var(--text-secondary)' }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
        Emergency: <strong style={{ color: 'var(--text-secondary)' }}>112</strong> · Police: <strong style={{ color: 'var(--text-secondary)' }}>100</strong> · Ambulance: <strong style={{ color: 'var(--text-secondary)' }}>108</strong>
      </div>
    </div>
  )

  const renderTypeSelector = () => (
    <div className="animate-fade-in-up" style={{ padding: 'var(--space-6)' }}>
      {isSilent && (
        <div className="alert-banner alert-banner-amber mb-4">
          <EyeOff size={16} style={{ flexShrink: 0, color: 'var(--color-amber)' }} />
          <div>
            <div className="font-bold text-sm">Silent Mode Active</div>
            <div className="text-xs">Just tap — we'll handle the rest. No calls or loud alerts.</div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
        What's happening?
      </div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
        Tap the type that best matches your situation. Don't overthink it.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
        {INCIDENT_TYPES.map(type => (
          <button
            key={type.id}
            className={`incident-type-btn ${type.className}`}
            onClick={() => {
              setIncidentType(type)
              if (type.id === 'medical') setStep('location')
              else { setStep('location') }
            }}
            id={`type-${type.id}`}
            aria-label={`Report ${type.label}`}
          >
            <span style={{ fontSize: 32 }}>{type.icon}</span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, lineHeight: 1.3 }}>{type.label}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{type.description}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Your location data and report is end-to-end encrypted. We do not share personal information without your consent.
      </div>
    </div>
  )

  const renderLocation = () => (
    <div className="animate-fade-in-up" style={{ padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        <div style={{ fontSize: 20 }}>{incidentType?.icon}</div>
        <div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>{incidentType?.label}</div>
          <div className={`badge ${incidentType?.severity === 'S0' ? 'sev-s0' : 'sev-s1'}`} style={{ marginTop: 2 }}>
            {incidentType?.severity} · PRIORITY RESPONSE
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-5)', marginTop: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>Where are you?</div>
        <div className="search-bar" style={{ marginBottom: 'var(--space-3)' }}>
          <MapPin size={16} className="search-bar-icon" />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="Search room or area..."
            value={locationSearch}
            onChange={e => setLocationSearch(e.target.value)}
            autoFocus
            aria-label="Search for your location"
          />
        </div>

        <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {filteredRooms.slice(0, 8).map(room => (
            <button
              key={room}
              className="btn btn-ghost"
              style={{
                justifyContent: 'flex-start',
                background: location === room ? 'var(--color-blue-dim)' : undefined,
                borderColor: location === room ? 'rgba(10,132,255,0.4)' : undefined,
                color: location === room ? 'var(--color-blue)' : undefined,
              }}
              onClick={() => setLocation(room)}
            >
              <MapPin size={14} />
              {room}
              {location === room && <CheckCircle size={14} style={{ marginLeft: 'auto', color: 'var(--color-blue)' }} />}
            </button>
          ))}
        </div>

        <div style={{ margin: 'var(--space-3) 0', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>— or describe your location —</div>

        <input
          type="text"
          className="input"
          placeholder="e.g., near the pool entrance, stairwell on level 3..."
          value={customLocation}
          onChange={e => setCustomLocation(e.target.value)}
          aria-label="Describe your location"
        />
      </div>

      <button
        className="btn btn-ghost w-full"
        style={{ marginBottom: 'var(--space-3)' }}
        onClick={() => setLocation("I'm not sure / unknown location")}
      >
        I don't know / unsure of location
      </button>

      <button
        className="btn btn-crisis btn-lg w-full"
        onClick={() => {
          if (incidentType?.id === 'medical') setStep('triage')
          else setStep('submitted')
        }}
        disabled={!location && !customLocation}
        id="confirm-location-btn"
      >
        Confirm Location — Send Alert
        <ChevronRight size={18} />
      </button>
    </div>
  )

  const renderTriage = () => {
    const q = MEDICAL_TRIAGE[currentTriageQ]
    const isCritical = Object.values(triageAnswers).some(a => a === 'critical')

    return (
      <div className="animate-fade-in-up" style={{ padding: 'var(--space-6)' }}>
        {isCritical && (
          <div className="alert-banner alert-banner-crisis mb-4">
            <AlertTriangle size={16} style={{ flexShrink: 0, color: 'var(--color-crisis)' }} />
            <div>
              <div className="font-bold text-sm">Emergency Services Being Dispatched</div>
              <div className="text-xs">Based on your answers, we're calling 112. Please continue answering.</div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Quick Medical Check {currentTriageQ + 1} of {MEDICAL_TRIAGE.length}
        </div>

        <StepIndicator current={currentTriageQ} total={MEDICAL_TRIAGE.length} />

        <div
          className="glass-card"
          style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', background: 'var(--bg-glass-hover)' }}
        >
          <div style={{ fontSize: 32, marginBottom: 'var(--space-3)', textAlign: 'center' }}>🏥</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, lineHeight: 1.4, textAlign: 'center', marginBottom: 8 }}>
            {q.question}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Answer as best you can — this helps us prepare the right response.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <button
            className="btn btn-safe btn-lg"
            style={{ height: 72, fontSize: 'var(--text-xl)' }}
            onClick={() => handleTriageAnswer('good')}
            id={`triage-yes-${currentTriageQ}`}
          >
            ✅ YES
          </button>
          <button
            className="btn btn-crisis btn-lg"
            style={{ height: 72, fontSize: 'var(--text-xl)' }}
            onClick={() => handleTriageAnswer('critical')}
            id={`triage-no-${currentTriageQ}`}
          >
            ❌ NO
          </button>
        </div>

        <button className="btn btn-ghost w-full mt-3" onClick={() => setStep('submitted')}>
          Skip — Handle my emergency now
        </button>
      </div>
    )
  }

  const renderSubmitted = () => (
    <div className="flex flex-col items-center text-center animate-fade-in-scale" style={{ padding: 'var(--space-8) var(--space-6)', flex: 1 }}>
      <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
        <div className="animate-heartbeat" style={{ fontSize: 80 }}>📡</div>
        <div style={{
          position: 'absolute',
          inset: -20,
          borderRadius: '50%',
          border: '2px solid var(--color-blue)',
          animation: 'ripple 1.5s ease-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          inset: -40,
          borderRadius: '50%',
          border: '2px solid rgba(10,132,255,0.3)',
          animation: 'ripple 1.5s ease-out 0.5s infinite',
        }} />
      </div>

      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
        Alert Sent!
      </div>
      <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
        {!isOnline
          ? 'No network detected. Sending via SMS fallback. Keep your phone nearby.'
          : 'Your emergency has been reported. Staff are being notified right now.'
        }
      </div>

      <div className="glass-card w-full" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', textAlign: 'left' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
          Incident Summary
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Type</span>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{incidentType?.label}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Location</span>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{location || customLocation || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Mode</span>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{isSilent ? '🔇 Silent' : '🔊 Standard'}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Ref #</span>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
              {incidentId || 'Generating...'}
            </span>
          </div>
        </div>
      </div>

      <div className="animate-pulse-crisis" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <div className="live-dot live-dot-amber" />
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-amber)' }}>
          Notifying staff — acknowledgment expected within 60 seconds
        </span>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <div className="alert-banner alert-banner-info">
          <AlertTriangle size={16} style={{ flexShrink: 0, color: 'var(--color-blue)' }} />
          <div className="text-sm">Stay where you are if it is safe. If in danger, leave immediately and call 112.</div>
        </div>
        <button className="btn btn-crisis w-full" onClick={() => window.location.href = 'tel:112'}>
          <Phone size={16} />
          Emergency Services — Call 112
        </button>
      </div>
    </div>
  )

  const renderStatus = () => (
    <div className="animate-fade-in-up" style={{ padding: 'var(--space-6)', flex: 1 }}>
      {/* Status Hero */}
      <div
        className="glass-card"
        style={{
          background: 'var(--color-safe-dim)',
          border: '1px solid rgba(48,209,88,0.3)',
          padding: 'var(--space-5)',
          marginBottom: 'var(--space-4)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
        <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--color-safe)', marginBottom: 4 }}>
          Help Acknowledged
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Staff are on their way. Stay calm.
        </div>
      </div>

      {/* ETA Card */}
      <div className="glass-card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
          Estimated Arrival
        </div>
        <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--color-blue)' }}>
          {eta}m
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Raj Kumar (Security) is responding
        </div>
        <div className="progress-bar" style={{ marginTop: 'var(--space-3)' }}>
          <div className="progress-bar-fill" style={{ width: `${(10 - eta) / 10 * 100}%`, background: 'var(--color-safe)' }} />
        </div>
      </div>

      {/* Instructions */}
      <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>While You Wait</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {incidentType?.id === 'medical' ? [
            '🧘 Stay calm and breathe slowly',
            '🛏️ Keep the person still and comfortable',
            '🚪 Unlock your door or keep it ajar',
            '📱 Keep this screen open for updates',
          ] : incidentType?.id === 'fire' ? [
            '🚪 Feel the door before opening it',
            '🪜 Use stairs only — avoid elevators',
            '🙅 Do not re-enter until cleared',
            '📍 Proceed to muster point: Main Entrance',
          ] : [
            '📱 Stay on this screen for updates',
            '🔒 If threatened, lock your door',
            '📞 Call 112 if immediate danger',
            '🏨 Staff will arrive within stated ETA',
          ].map(item => (
            <div key={item} style={{ fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <button className="btn btn-primary w-full" onClick={() => setStep('chat')}>
          <MessageSquare size={16} />
          Send a Message to Staff
        </button>
        <button className="btn btn-ghost w-full" onClick={() => window.location.href = 'tel:112'}>
          <Phone size={16} />
          Call Emergency — 112
        </button>
        <button className="btn btn-ghost w-full" onClick={() => setStep('followup')}>
          <CheckCircle size={16} />
          Mark as Resolved / False Alarm
        </button>
      </div>

      {/* Timeline */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>Live Timeline</div>
        <div className="timeline">
          {[
            { time: 'Just now', text: 'Staff acknowledged your report', type: 'ack' },
            { time: '~1 min ago', text: 'Security officer notified', type: 'notify' },
            { time: '~2 min ago', text: 'Your SOS was received', type: 'report' },
          ].map((item, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{item.text}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderChat = () => (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Chat header */}
      <div
        className="glass-card"
        style={{
          padding: 'var(--space-3) var(--space-5)',
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <div className="avatar" style={{ background: 'linear-gradient(135deg, #0A84FF, #005AC8)' }}>RK</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Raj Kumar · Security Officer</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div className="live-dot" style={{ width: 6, height: 6 }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-safe)' }}>Active · Responding to your incident</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minHeight: 0 }}>
        {/* Initial system message */}
        <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 'var(--space-2) 0' }}>
          Secure channel · Chat history visible to responding staff only
        </div>

        <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Raj Kumar · Security</div>
          <div className="message-bubble message-bubble-staff">
            Hi, I received your emergency report. I'm heading to your location now. Are you safe? Can you give me any additional details?
          </div>
        </div>

        {messages.map(msg => (
          <div key={msg.id} style={{ alignSelf: msg.from === 'guest' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            {msg.from === 'staff' && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>{msg.sender}</div>
            )}
            <div className={`message-bubble ${msg.from === 'staff' ? 'message-bubble-staff' : 'message-bubble-guest'}`}>
              {msg.text}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, textAlign: msg.from === 'guest' ? 'right' : 'left' }}>
              {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Safety guardrail */}
      <div style={{ padding: '0 var(--space-4)', marginBottom: 'var(--space-2)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 'var(--space-2)' }}>
          🔒 This chat is private between you and responding staff. Do not share sensitive personal info.
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
        <textarea
          className="input"
          style={{ flex: 1, minHeight: 44, maxHeight: 100, resize: 'none' }}
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
          aria-label="Type message to staff"
        />
        <button
          className="btn btn-primary btn-icon"
          onClick={handleSendMessage}
          disabled={!message.trim()}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )

  const renderFollowUp = () => (
    <div className="animate-fade-in-up" style={{ padding: 'var(--space-6)', flex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{ fontSize: 64, marginBottom: 'var(--space-3)' }}>💚</div>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
          Incident Resolved
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          We're glad you're safe. Take a moment to complete this short follow-up so we can improve our response.
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>How was our response?</div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {['😞', '😐', '😊', '😄', '⭐'].map((emoji, i) => (
            <button
              key={emoji}
              className="btn btn-ghost"
              style={{ flex: 1, fontSize: 24, padding: 'var(--space-2)' }}
            >
              {emoji}
            </button>
          ))}
        </div>
        <textarea
          className="input"
          placeholder="Any additional comments? (optional)"
          style={{ marginBottom: 'var(--space-3)' }}
        />
        <div className="form-group">
          <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={uploadConsent} onChange={e => setUploadConsent(e.target.checked)} />
            I consent to share any photos/media I uploaded for incident documentation
          </label>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Would you like additional support?</div>
        {[
          '🧠 Speak with a counselor',
          '📋 Request a copy of the incident report',
          '💰 Compensation / resolution from hotel',
          '🏥 Medical follow-up information',
        ].map(option => (
          <button key={option} className="btn btn-ghost w-full" style={{ justifyContent: 'flex-start', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
            {option}
          </button>
        ))}
      </div>

      <button className="btn btn-safe btn-lg w-full" onClick={onBack}>
        <CheckCircle size={18} />
        Submit & Close — Stay Safe!
      </button>

      <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Incident Ref #{incidentId} · Your data is retained for 90 days per our privacy policy and then securely deleted.
      </div>
    </div>
  )

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="bg-animated min-h-screen flex flex-col" style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>
      {/* Header */}
      <div
        className="topbar"
        style={{ justifyContent: 'space-between' }}
      >
        <button
          className="btn btn-icon btn-ghost"
          onClick={step === 'entry' ? onBack : () => {
            const prev = { type: 'entry', location: 'type', triage: 'location', submitted: 'triage', status: 'submitted', chat: 'status', followup: 'status' }
            setStep(prev[step] || 'entry')
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="logo-mark">
          <div className="logo-icon" style={{ width: 28, height: 28, fontSize: 13 }}>🛡️</div>
          <span style={{ fontSize: 'var(--text-base)' }}>Guest SOS</span>
        </div>

        <div className="flex items-center gap-2">
          {isOnline
            ? <Wifi size={14} style={{ color: 'var(--color-safe)' }} />
            : <WifiOff size={14} style={{ color: 'var(--color-amber)' }} />
          }
          <button className="btn btn-icon btn-ghost" aria-label="Audio assistance">
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      {/* Step indicator */}
      {!['entry', 'submitted', 'status', 'chat', 'followup'].includes(step) && (
        <div style={{ padding: '0 var(--space-6) var(--space-2)' }}>
          <StepIndicator current={['type', 'location', 'triage'].indexOf(step)} total={3} />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {step === 'entry'     && renderEntry()}
        {step === 'type'      && renderTypeSelector()}
        {step === 'location'  && renderLocation()}
        {step === 'triage'    && renderTriage()}
        {step === 'submitted' && renderSubmitted()}
        {step === 'status'    && renderStatus()}
        {step === 'chat'      && renderChat()}
        {step === 'followup'  && renderFollowUp()}
      </div>
    </div>
  )
}
