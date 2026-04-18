import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Eye, EyeOff, Shield, ArrowRight, Fingerprint, AlertTriangle } from 'lucide-react'

const ROLES = [
  { id:'security', label:'Security Officer', icon:'🛡️' },
  { id:'manager',  label:'Manager on Duty',  icon:'👔' },
  { id:'frontdesk',label:'Front Desk Agent', icon:'🛎️' },
  { id:'housekeeping', label:'Housekeeping Lead', icon:'🧹' },
  { id:'engineering',  label:'Engineering / Maint.', icon:'⚙️' },
]

const DEMO = [
  { name:'Raj Kumar',    role:'security',    email:'raj.kumar@grandmeridian.com',    pin:'1234' },
  { name:'Priya Singh',  role:'manager',     email:'priya.singh@grandmeridian.com',  pin:'5678' },
  { name:'Sunita Mehta', role:'frontdesk',  email:'sunita.mehta@grandmeridian.com', pin:'9012' },
]

export default function StaffLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pin, setPin]     = useState('')
  const [role, setRole]   = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep]   = useState('credentials')
  const [mfa, setMfa]     = useState('')

  const selectedRole = ROLES.find(r => r.id === role)

  const fillDemo = (d) => { setEmail(d.email); setPin(d.pin); setRole(d.role); setError('') }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !pin || !role) { setError('Fill in all fields and select your role.'); return }
    if (pin.length < 4) { setError('PIN must be at least 4 digits.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('mfa') }, 1000)
  }

  const handleMFA = (e) => {
    e.preventDefault()
    if (mfa.length < 6) { setError('Enter the 6-digit code.'); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // Store in sessionStorage for auth guard
      const user = { name: DEMO.find(d => d.email === email)?.name || 'Staff Member', role, email }
      sessionStorage.setItem('staff_user', JSON.stringify(user))
      router.push('/staff')
    }, 900)
  }

  return (
    <>
      <Head>
        <title>Staff Login — Rapid Crisis Response</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <div className="page bg-animated full-center" style={{ paddingTop: 40, justifyContent:'flex-start' }}>
        <div style={{ width:'100%', maxWidth:440, padding:'0 16px 40px' }}>
          <button onClick={() => router.push('/')} className="btn btn-ghost btn-sm mb-4">← Back</button>

          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ width:64, height:64, borderRadius:'var(--r-xl)', background:'rgba(10,132,255,0.15)', border:'1px solid rgba(10,132,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 12px', boxShadow:'0 0 32px rgba(10,132,255,0.15)' }}>🛡️</div>
            <h1 className="fw-800 text-2xl lh-tight mb-1">Staff Sign In</h1>
            <p className="text-secondary text-sm">Rapid Crisis Response · Staff Portal</p>
          </div>

          {step === 'credentials' ? (
            <>
              <div className="card card-pad mb-3">
                <form onSubmit={handleSubmit} className="flex-col gap-3">
                  <div className="form-group">
                    <label className="input-label" htmlFor="role-select">Your Role</label>
                    <select
                      id="role-select"
                      className="input"
                      value={role}
                      onChange={e => { setRole(e.target.value); setError('') }}
                      style={{ paddingLeft: selectedRole ? 44 : 14, fontWeight: role ? 700 : 400, color: role ? 'var(--text-primary)' : 'var(--text-tertiary)', cursor:'pointer' }}
                    >
                      <option value="">Select your role…</option>
                      {ROLES.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="input-label" htmlFor="staff-email">Work Email</label>
                    <input id="staff-email" type="email" className="input" placeholder="your.name@property.com" value={email} onChange={e => { setEmail(e.target.value); setError('') }} autoComplete="email" />
                  </div>

                  <div className="form-group">
                    <div className="flex justify-between items-center mb-1">
                      <label className="input-label" htmlFor="staff-pin" style={{ marginBottom:0 }}>Staff PIN</label>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPin(v=>!v)} aria-label={showPin?'Hide PIN':'Show PIN'} style={{ minHeight:32, fontSize:11, gap:4 }}>
                        {showPin ? <EyeOff size={12} /> : <Eye size={12} />} {showPin?'Hide':'Show'}
                      </button>
                    </div>
                    <input id="staff-pin" type={showPin?'text':'password'} inputMode="numeric" className="input" placeholder="••••" value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g,'').slice(0,8)); setError('') }} style={{ letterSpacing: showPin?'normal':'0.5em', fontFamily:'var(--font-mono)', fontSize:20 }} autoComplete="current-password" />
                    <span className="form-hint">4–8 digit PIN issued by your supervisor</span>
                  </div>

                  {error && <div className="alert alert-crisis"><AlertTriangle size={14} style={{ color:'var(--color-crisis)', flexShrink:0 }} /><span className="text-sm">{error}</span></div>}

                  <button id="staff-login-btn" type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                    {loading ? 'Verifying…' : <><ArrowRight size={16} /> Sign In to Dashboard</>}
                  </button>
                </form>

                <div className="flex items-center gap-3 mt-4 mb-4">
                  <div className="divider flex-1" />
                  <span className="text-xs text-tertiary fw-700">or</span>
                  <div className="divider flex-1" />
                </div>

                <button
                  id="biometric-btn"
                  className="btn btn-ghost btn-full"
                  onClick={() => {
                    if (!role) { setError('Select your role first.'); return }
                    setLoading(true)
                    setTimeout(() => {
                      setLoading(false)
                      sessionStorage.setItem('staff_user', JSON.stringify({ name:'Raj Kumar', role, email:'raj@hotel.com' }))
                      router.push('/staff')
                    }, 1800)
                  }}
                  aria-label="Sign in with biometrics"
                >
                  <Fingerprint size={18} />
                  {loading ? 'Scanning…' : 'Sign in with Biometrics'}
                </button>
              </div>

              <div className="card card-pad" style={{ background:'rgba(10,132,255,0.04)' }}>
                <div className="text-xs text-tertiary fw-700 uppercase mb-3">Demo Accounts — tap to fill</div>
                {DEMO.map(d => {
                  const r = ROLES.find(x => x.id === d.role)
                  return (
                    <button
                      key={d.email}
                      className="btn btn-ghost btn-full"
                      style={{ justifyContent:'flex-start', gap:12, marginBottom:4, border:'1px solid var(--border-subtle)' }}
                      onClick={() => fillDemo(d)}
                    >
                      <span style={{ fontSize:20 }}>{r?.icon}</span>
                      <div style={{ textAlign:'left', flex:1 }}>
                        <div className="fw-700 text-sm">{d.name}</div>
                        <div className="text-xs text-tertiary">{r?.label} · PIN: {d.pin}</div>
                      </div>
                      <span className="badge badge-blue">FILL</span>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="card card-pad">
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ fontSize:48, marginBottom:8 }}>📱</div>
                <div className="fw-800 text-lg mb-1">Two-Factor Check</div>
                <div className="text-sm text-secondary lh-normal">Enter the 6-digit code from your authenticator app or SMS.</div>
              </div>
              <form onSubmit={handleMFA} className="flex-col gap-4">
                <div className="flex gap-2 justify-center">
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={i}
                      type="text" inputMode="numeric" maxLength={1}
                      className="input"
                      style={{ width:48, height:56, textAlign:'center', fontSize:24, fontFamily:'var(--font-mono)', fontWeight:800, padding:0, borderColor: mfa[i] ? 'rgba(10,132,255,0.5)' : undefined }}
                      value={mfa[i] || ''}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g,'')
                        const arr = mfa.split('')
                        arr[i] = v
                        setMfa(arr.join('').slice(0,6))
                        setError('')
                        if (v && e.target.nextSibling) e.target.nextSibling.focus()
                      }}
                      onKeyDown={e => { if (e.key==='Backspace' && !mfa[i] && e.target.previousSibling) e.target.previousSibling.focus() }}
                      id={`mfa-${i}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-tertiary text-center">Demo: enter any 6 digits</div>
                {error && <div className="alert alert-crisis"><AlertTriangle size={14} style={{ color:'var(--color-crisis)', flexShrink:0 }} /><span className="text-sm">{error}</span></div>}
                <button id="mfa-verify-btn" type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading || mfa.length < 6}>
                  {loading ? 'Authenticating…' : <><Shield size={16} /> Verify &amp; Enter Dashboard</>}
                </button>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => { setStep('credentials'); setMfa(''); setError('') }}>← Back</button>
              </form>
            </div>
          )}

          <div className="text-center text-tertiary text-xs mt-4">🔒 256-bit encrypted session · Auto-logout after 8 hours</div>
        </div>
      </div>
    </>
  )
}
