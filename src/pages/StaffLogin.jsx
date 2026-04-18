import { useState } from 'react'
import { Eye, EyeOff, Shield, ArrowRight, Fingerprint, AlertTriangle } from 'lucide-react'

const STAFF_ROLES = [
  { id: 'security',     label: 'Security Officer',     icon: '🛡️' },
  { id: 'manager',      label: 'Manager on Duty',      icon: '👔' },
  { id: 'frontdesk',   label: 'Front Desk Agent',     icon: '🛎️' },
  { id: 'housekeeping', label: 'Housekeeping Lead',    icon: '🧹' },
  { id: 'engineering',  label: 'Engineering / Maint.', icon: '⚙️' },
]

const DEMO_ACCOUNTS = [
  { name: 'Raj Kumar',    role: 'security',    email: 'raj.kumar@grandmeridian.com',    pin: '1234' },
  { name: 'Priya Singh',  role: 'manager',     email: 'priya.singh@grandmeridian.com',  pin: '5678' },
  { name: 'Sunita Mehta', role: 'frontdesk',  email: 'sunita.mehta@grandmeridian.com', pin: '9012' },
]

export default function StaffLogin({ onLogin, onBack }) {
  const [email, setEmail]   = useState('')
  const [pin, setPin]       = useState('')
  const [showPin, setShowPin] = useState(false)
  const [role, setRole]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [biometricPulse, setBiometricPulse] = useState(false)
  const [step, setStep]     = useState('credentials')
  const [mfaCode, setMfaCode] = useState('')

  const selectedRole = STAFF_ROLES.find(r => r.id === role)

  const fillDemo = (account) => {
    setEmail(account.email)
    setPin(account.pin)
    setRole(account.role)
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email || !pin || !role) {
      setError('Please fill in all fields and select your role.')
      return
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits.')
      return
    }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('mfa') }, 1200)
  }

  const handleMFA = (e) => {
    e.preventDefault()
    if (mfaCode.length < 6) {
      setError('Enter the 6-digit code from your authenticator app.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin({ role, email, name: DEMO_ACCOUNTS.find(a => a.email === email)?.name || 'Staff Member' })
    }, 1000)
  }

  const handleBiometric = () => {
    if (!role) { setError('Please select your role first.'); return }
    setBiometricPulse(true)
    setError('')
    setTimeout(() => {
      setBiometricPulse(false)
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        onLogin({ role, email: 'biometric@grandmeridian.com', name: 'Raj Kumar' })
      }, 800)
    }, 1800)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 20%, rgba(10,132,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(191,90,242,0.08) 0%, transparent 60%), var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Glowing orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,132,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,209,88,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Back */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={onBack}
          style={{ marginBottom: 'var(--space-6)', gap: 6, color: 'var(--text-tertiary)' }}
        >
          ← Back to home
        </button>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, #0A84FF22, #0A84FF44)',
            border: '1px solid rgba(10,132,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto var(--space-4)',
            boxShadow: '0 0 32px rgba(10,132,255,0.15)',
          }}>
            🛡️
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            Staff Sign In
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginTop: 6 }}>
            Rapid Crisis Response Platform — Staff Portal
          </p>
        </div>

        {step === 'credentials' ? (
          <>
            {/* Main Card */}
            <div
              className="glass-card"
              style={{
                padding: 'var(--space-6)',
                border: '1px solid rgba(10,132,255,0.15)',
                boxShadow: '0 0 60px rgba(10,132,255,0.05)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

                {/* Role Selector — native select avoids z-index/backdrop-filter overlap */}
                <div className="form-group">
                  <label className="form-label" htmlFor="role-select">Your Role</label>
                  <div style={{ position: 'relative' }}>
                    {/* Role icon overlay */}
                    {selectedRole && (
                      <span style={{
                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 18, pointerEvents: 'none', zIndex: 2,
                      }}>
                        {selectedRole.icon}
                      </span>
                    )}
                    <select
                      id="role-select"
                      className="input"
                      value={role}
                      onChange={e => { setRole(e.target.value); setError('') }}
                      style={{
                        paddingLeft: selectedRole ? 44 : 'var(--space-4)',
                        fontWeight: role ? 600 : 400,
                        color: role ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="" disabled>Select your role…</option>
                      {STAFF_ROLES.map(r => (
                        <option key={r.id} value={r.id}>{r.icon} {r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label" htmlFor="staff-email">Work Email</label>
                  <input
                    id="staff-email"
                    type="email"
                    className="input"
                    placeholder="your.name@property.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                {/* PIN */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" htmlFor="staff-pin" style={{ margin: 0 }}>Staff PIN</label>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, padding: '2px 8px', gap: 4 }}
                      onClick={() => setShowPin(v => !v)}
                    >
                      {showPin ? <EyeOff size={11} /> : <Eye size={11} />}
                      {showPin ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="staff-pin"
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    className="input"
                    placeholder="• • • •"
                    value={pin}
                    onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 8)); setError('') }}
                    autoComplete="current-password"
                    style={{ letterSpacing: showPin ? 'normal' : '0.4em', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)' }}
                  />
                  <span className="form-hint">4–8 digit PIN issued by your supervisor</span>
                </div>

                {/* Error */}
                {error && (
                  <div className="alert-banner alert-banner-crisis" style={{ padding: 'var(--space-3)' }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--text-xs)' }}>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  id="staff-login-btn"
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={loading}
                  style={{ marginTop: 'var(--space-1)', gap: 8 }}
                >
                  {loading ? (
                    <><span className="spinner" /> Verifying…</>
                  ) : (
                    <><ArrowRight size={16} /> Sign In to Dashboard</>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 'var(--space-4) 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              </div>

              {/* Biometric */}
              <button
                type="button"
                className="btn btn-ghost w-full"
                style={{ gap: 10 }}
                onClick={handleBiometric}
                id="biometric-btn"
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: `2px solid ${biometricPulse ? 'var(--color-safe)' : 'rgba(255,255,255,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s',
                    boxShadow: biometricPulse ? '0 0 20px rgba(48,209,88,0.4)' : 'none',
                    animation: biometricPulse ? 'pulseCrisis 1s infinite' : 'none',
                  }}
                >
                  <Fingerprint size={16} style={{ color: biometricPulse ? 'var(--color-safe)' : 'var(--text-tertiary)' }} />
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {biometricPulse ? 'Scanning fingerprint…' : 'Sign in with Biometrics'}
                </span>
              </button>
            </div>

            {/* Demo accounts */}
            <div
              className="glass-card"
              style={{ padding: 'var(--space-4)', background: 'rgba(10,132,255,0.04)', border: '1px solid rgba(10,132,255,0.1)' }}
            >
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                Demo Accounts — click to fill
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {DEMO_ACCOUNTS.map(a => {
                  const r = STAFF_ROLES.find(x => x.id === a.role)
                  return (
                    <button
                      key={a.email}
                      className="btn btn-ghost"
                      style={{
                        justifyContent: 'flex-start', gap: 12,
                        padding: 'var(--space-3) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                      }}
                      onClick={() => fillDemo(a)}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{r?.icon}</span>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r?.label} · PIN: {a.pin}</div>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--color-blue)', background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                        FILL
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          /* MFA Step */
          <div
            className="glass-card"
            style={{
              padding: 'var(--space-6)',
              border: '1px solid rgba(10,132,255,0.15)',
              boxShadow: '0 0 60px rgba(10,132,255,0.05)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--space-2)' }}>📱</div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', marginBottom: 4 }}>Two-Factor Check</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Enter the 6-digit code from your<br />authenticator app or SMS.
              </div>
            </div>

            <form onSubmit={handleMFA} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {[0,1,2,3,4,5].map(i => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="input"
                    style={{
                      width: 48, height: 56, textAlign: 'center', fontSize: 'var(--text-xl)',
                      fontFamily: 'var(--font-mono)', fontWeight: 800, padding: 0,
                      borderColor: mfaCode[i] ? 'rgba(10,132,255,0.5)' : undefined,
                    }}
                    value={mfaCode[i] || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      const arr = mfaCode.split('')
                      arr[i] = val
                      const next = arr.join('').slice(0, 6)
                      setMfaCode(next)
                      setError('')
                      if (val && e.target.nextSibling) e.target.nextSibling.focus()
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !mfaCode[i] && e.target.previousSibling) {
                        e.target.previousSibling.focus()
                      }
                    }}
                    id={`mfa-digit-${i}`}
                  />
                ))}
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' }}>
                Demo: enter any 6 digits (e.g. 000000)
              </div>

              {error && (
                <div className="alert-banner alert-banner-crisis" style={{ padding: 'var(--space-3)' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 'var(--text-xs)' }}>{error}</span>
                </div>
              )}

              <button
                id="mfa-verify-btn"
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={loading || mfaCode.length < 6}
                style={{ gap: 8 }}
              >
                {loading ? (
                  <><span className="spinner" /> Authenticating…</>
                ) : (
                  <><Shield size={15} /> Verify &amp; Enter Dashboard</>
                )}
              </button>

              <button
                type="button"
                className="btn btn-ghost w-full"
                onClick={() => { setStep('credentials'); setMfaCode(''); setError('') }}
              >
                ← Back
              </button>
            </form>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 11, color: 'var(--text-tertiary)' }}>
          🔒 256-bit encrypted session · Auto-logout after 8 hours
        </div>
      </div>
    </div>
  )
}
