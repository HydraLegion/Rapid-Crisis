import { useState } from 'react'
import { Eye, EyeOff, Building2, ArrowRight, AlertTriangle, Key, Globe, Lock } from 'lucide-react'

const PROPERTIES = [
  { id: 'all',      name: 'All Properties (Chain)',         flag: '🌐' },
  { id: 'prop-001', name: 'The Grand Meridian — Mumbai',    flag: '🏙️' },
  { id: 'prop-002', name: 'Azure Bay Resort — Goa',         flag: '🌊' },
  { id: 'prop-003', name: 'Skyline Heights Hotel — Delhi',  flag: '🗼' },
  { id: 'prop-004', name: 'Harbor View Suites — Chennai',   flag: '⚓' },
]

const CC_ROLES = [
  { id: 'corporate', label: 'Corporate Command',    icon: '🏢', access: 'All properties',   color: '#BF5AF2' },
  { id: 'regional',  label: 'Regional Director',    icon: '🗺️', access: 'Assigned region',  color: '#0A84FF' },
  { id: 'gm',        label: 'General Manager',      icon: '👔', access: 'Single property',  color: '#30D158' },
]

const DEMO_ACCOUNTS = [
  { name: 'Arjun Kapoor',  role: 'corporate', email: 'a.kapoor@rapidcrisis.corp',       password: 'Corp@2024', property: 'all',      clearance: 'TOP LEVEL' },
  { name: 'Meera Desai',   role: 'regional',  email: 'm.desai@rapidcrisis.corp',        password: 'Region#1', property: 'prop-001', clearance: 'LEVEL 2' },
  { name: 'Vikram Sharma', role: 'gm',        email: 'v.sharma@grandmeridian.com',      password: 'GM@2024',  property: 'prop-001', clearance: 'LEVEL 3' },
]

function PasswordStrength({ password }) {
  const score = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Za-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
    : 3

  const colors = ['', '#FF2D55', '#FF9F0A', '#0A84FF', '#30D158']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            width: 28, height: 4, borderRadius: 2,
            background: i <= score ? colors[score] : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 10, color: colors[score], fontWeight: 700 }}>{labels[score]}</span>
    </div>
  )
}

export default function CommandLogin({ onLogin, onBack }) {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [role, setRole]           = useState('')
  const [property, setProperty]   = useState('')
  const [ssoMode, setSsoMode]     = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [step, setStep]           = useState('credentials') // 'credentials' | 'mfa'
  const [mfaCode, setMfaCode]     = useState(['', '', '', '', '', ''])
  const [mfaChannel, setMfaChannel] = useState('app') // 'app' | 'sms' | 'hardware'

  const selectedRole     = CC_ROLES.find(r => r.id === role)
  const selectedProperty = PROPERTIES.find(p => p.id === property)

  const fillDemo = (acc) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setRole(acc.role)
    setProperty(acc.property)
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password || !role || !property) {
      setError('Please complete all fields before signing in.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('mfa') }, 1400)
  }

  const handleSSOLogin = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin({ role: role || 'corporate', email: 'sso@corp.com', name: 'SSO User', property: 'all' })
    }, 1600)
  }

  const handleMFA = () => {
    const code = mfaCode.join('')
    if (code.length < 6) { setError('Enter all 6 digits.'); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const acc = DEMO_ACCOUNTS.find(a => a.email === email)
      onLogin({ role, email, name: acc?.name || 'Command User', property, clearance: acc?.clearance || 'LEVEL 3' })
    }, 1000)
  }

  const setMfaDigit = (index, value) => {
    const digits = [...mfaCode]
    digits[index] = value.replace(/\D/g, '').slice(-1)
    setMfaCode(digits)
    setError('')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 30%, rgba(191,90,242,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(10,132,255,0.08) 0%, transparent 55%), var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }} />

      {/* Orbs */}
      <div style={{ position: 'absolute', top: '5%', right: '10%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(191,90,242,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,132,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

        <button
          className="btn btn-ghost btn-sm"
          onClick={onBack}
          style={{ marginBottom: 'var(--space-6)', color: 'var(--text-tertiary)' }}
        >
          ← Back to home
        </button>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-2xl)',
            background: 'linear-gradient(135deg, rgba(191,90,242,0.2), rgba(191,90,242,0.35))',
            border: '1px solid rgba(191,90,242,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto var(--space-4)',
            boxShadow: '0 0 40px rgba(191,90,242,0.2)',
          }}>
            🏢
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            Command Center Access
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginTop: 6 }}>
            Restricted to authorized management &amp; command personnel
          </p>

          {/* Security Tier Badges */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 'var(--space-3)' }}>
            {['🔐 SOC 2 Certified', '🛡️ ISO 27001', '🔒 Zero Trust'].map(b => (
              <span key={b} style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', padding: '2px 8px', fontWeight: 600 }}>
                {b}
              </span>
            ))}
          </div>
        </div>

        {step === 'credentials' ? (
          <>
            {/* SSO Toggle */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 4, marginBottom: 'var(--space-4)' }}>
              <button
                className={`btn ${!ssoMode ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, justifyContent: 'center', padding: 'var(--space-2)' }}
                onClick={() => setSsoMode(false)}
              >
                <Key size={14} /> Credentials
              </button>
              <button
                className={`btn ${ssoMode ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, justifyContent: 'center', padding: 'var(--space-2)', background: ssoMode ? 'rgba(191,90,242,0.25)' : undefined }}
                onClick={() => setSsoMode(true)}
              >
                <Globe size={14} /> SSO / SAML
              </button>
            </div>

            <div
              className="glass-card"
              style={{
                padding: 'var(--space-6)',
                border: '1px solid rgba(191,90,242,0.15)',
                boxShadow: '0 0 40px rgba(191,90,242,0.05)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {ssoMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="alert-banner alert-banner-info">
                    <Globe size={16} style={{ flexShrink: 0, color: 'var(--color-blue)' }} />
                    <div className="text-sm">
                      Single Sign-On via your identity provider (Okta, Azure AD, Google Workspace).
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Work Email Domain</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="your.email@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      id="sso-email"
                    />
                  </div>

                  {[
                    { label: 'Continue with Okta', icon: '🔷', color: '#007DC1' },
                    { label: 'Continue with Azure AD', icon: '🔵', color: '#0078D4' },
                    { label: 'Continue with Google', icon: '🔴', color: '#4285F4' },
                  ].map(p => (
                    <button
                      key={p.label}
                      className="btn btn-ghost w-full"
                      style={{ gap: 10, border: '1px solid var(--border-medium)' }}
                      onClick={handleSSOLogin}
                      disabled={loading}
                    >
                      <span style={{ fontSize: 18 }}>{p.icon}</span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{p.label}</span>
                      {loading && <span className="spinner" style={{ marginLeft: 'auto' }} />}
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

                  {/* Role Selection */}
                  <div>
                    <label className="form-label">Access Level</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                      {CC_ROLES.map(r => (
                        <button
                          key={r.id}
                          type="button"
                          style={{
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-lg)',
                            border: `1px solid ${role === r.id ? r.color + '50' : 'var(--border-subtle)'}`,
                            background: role === r.id ? r.color + '15' : 'rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            boxShadow: role === r.id ? `0 0 16px ${r.color}20` : 'none',
                          }}
                          onClick={() => setRole(r.id)}
                          id={`role-${r.id}`}
                        >
                          <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: role === r.id ? r.color : 'var(--text-secondary)', lineHeight: 1.3 }}>{r.label}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>{r.access}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Property */}
                  <div className="form-group">
                    <label className="form-label">Property / Scope</label>
                    <select
                      className="input"
                      value={property}
                      onChange={e => { setProperty(e.target.value); setError('') }}
                      style={{ cursor: 'pointer' }}
                      id="property-select"
                    >
                      <option value="">Select property scope…</option>
                      {PROPERTIES.map(p => (
                        <option key={p.id} value={p.id}>{p.flag} {p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">Corporate Email</label>
                    <input
                      id="cc-email"
                      type="email"
                      className="input"
                      placeholder="name@company.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label" style={{ margin: 0 }}>Password</label>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11, padding: '2px 6px', color: 'var(--color-purple)' }}
                        onClick={() => setShowPass(v => !v)}
                      >
                        {showPass ? <EyeOff size={11} /> : <Eye size={11} />}
                        {showPass ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      id="cc-password"
                      type={showPass ? 'text' : 'password'}
                      className="input"
                      placeholder="••••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      autoComplete="current-password"
                    />
                    <PasswordStrength password={password} />
                    <div style={{ textAlign: 'right', marginTop: 4 }}>
                      <button type="button" className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: '#BF5AF2' }}>
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="alert-banner alert-banner-crisis" style={{ padding: 'var(--space-3)' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--text-xs)' }}>{error}</span>
                    </div>
                  )}

                  <button
                    id="cc-login-btn"
                    type="submit"
                    className="btn btn-lg w-full"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #BF5AF2, #9030D0)',
                      color: 'white',
                      fontWeight: 700,
                      boxShadow: '0 4px 24px rgba(191,90,242,0.3)',
                    }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="spinner" /> Authenticating…
                      </span>
                    ) : (
                      <><Lock size={15} /> Secure Sign In</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Demo accounts */}
            <div className="glass-card" style={{ padding: 'var(--space-4)', background: 'rgba(191,90,242,0.04)', border: '1px solid rgba(191,90,242,0.12)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
                Demo Executive Accounts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                {DEMO_ACCOUNTS.map(a => {
                  const r = CC_ROLES.find(x => x.id === a.role)
                  return (
                    <button
                      key={a.email}
                      className="btn btn-ghost"
                      style={{ justifyContent: 'space-between', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)' }}
                      onClick={() => fillDemo(a)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{r?.icon}</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{a.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{r?.label}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 9, fontWeight: 800,
                        color: a.clearance === 'TOP LEVEL' ? '#BF5AF2' : a.clearance === 'LEVEL 2' ? '#0A84FF' : '#30D158',
                        background: a.clearance === 'TOP LEVEL' ? 'rgba(191,90,242,0.12)' : a.clearance === 'LEVEL 2' ? 'rgba(10,132,255,0.12)' : 'rgba(48,209,88,0.12)',
                        border: `1px solid ${a.clearance === 'TOP LEVEL' ? 'rgba(191,90,242,0.3)' : a.clearance === 'LEVEL 2' ? 'rgba(10,132,255,0.3)' : 'rgba(48,209,88,0.3)'}`,
                        borderRadius: 'var(--radius-full)',
                        padding: '2px 8px',
                      }}>
                        {a.clearance}
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
            style={{ padding: 'var(--space-6)', border: '1px solid rgba(191,90,242,0.15)' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--space-2)' }}>
                {{ app: '📱', sms: '💬', hardware: '🔑' }[mfaChannel]}
              </div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', marginBottom: 4 }}>
                Multi-Factor Authentication
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Required for Command Center access. Enter the 6-digit code.
              </div>
            </div>

            {/* MFA Channel Toggle */}
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
              {[
                { id: 'app', label: '📱 Auth App' },
                { id: 'sms', label: '💬 SMS' },
                { id: 'hardware', label: '🔑 Hardware Key' },
              ].map(c => (
                <button
                  key={c.id}
                  className={`chip ${mfaChannel === c.id ? 'selected' : ''}`}
                  onClick={() => setMfaChannel(c.id)}
                  style={{ fontSize: 11 }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* OTP Boxes */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
              {mfaCode.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="input"
                  id={`cc-mfa-${i}`}
                  style={{
                    width: 52, height: 60, textAlign: 'center', fontSize: 'var(--text-xl)',
                    fontFamily: 'var(--font-mono)', fontWeight: 800, padding: 0,
                    borderColor: digit ? 'rgba(191,90,242,0.4)' : undefined,
                    boxShadow: digit ? '0 0 12px rgba(191,90,242,0.15)' : 'none',
                  }}
                  value={digit}
                  onChange={e => {
                    setMfaDigit(i, e.target.value)
                    if (e.target.value && e.target.nextSibling) e.target.nextSibling.focus()
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !digit && e.target.previousSibling) {
                      e.target.previousSibling.focus()
                    }
                  }}
                />
              ))}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              Demo: enter any 6 digits · Hardware key: tap and hold
            </div>

            {error && (
              <div className="alert-banner alert-banner-crisis" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-xs)' }}>{error}</span>
              </div>
            )}

            <button
              id="cc-mfa-btn"
              className="btn btn-lg w-full"
              disabled={loading || mfaCode.join('').length < 6}
              onClick={handleMFA}
              style={{
                background: 'linear-gradient(135deg, #BF5AF2, #9030D0)',
                color: 'white',
                fontWeight: 700,
                boxShadow: '0 4px 24px rgba(191,90,242,0.3)',
                marginBottom: 'var(--space-3)',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" /> Authorizing…
                </span>
              ) : (
                <><Lock size={15} /> Enter Command Center</>
              )}
            </button>

            <button
              className="btn btn-ghost w-full"
              onClick={() => { setStep('credentials'); setMfaCode(['','','','','','']); setError('') }}
            >
              ← Back to credentials
            </button>

            <div className="alert-banner alert-banner-amber" style={{ marginTop: 'var(--space-4)' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, color: 'var(--color-amber)' }} />
              <span style={{ fontSize: 10 }}>
                All access attempts are logged, timestamped, and stored for audit. Unauthorized access is a criminal offense.
              </span>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 11, color: 'var(--text-tertiary)' }}>
          🔐 End-to-end encrypted · Session recorded · Auto-logout 4 hrs
        </div>
      </div>
    </div>
  )
}
