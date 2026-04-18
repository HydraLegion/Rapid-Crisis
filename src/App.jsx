import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import ToastContainer from './components/shared/ToastContainer'
import OfflineBanner from './components/shared/OfflineBanner'

// Lazy-load all pages for better performance
const RoleSelector  = lazy(() => import('./pages/RoleSelector'))
const GuestSOS      = lazy(() => import('./pages/GuestSOS'))
const StaffLogin    = lazy(() => import('./pages/StaffLogin'))
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'))
const CommandLogin  = lazy(() => import('./pages/CommandLogin'))
const CommandCenter = lazy(() => import('./pages/CommandCenter'))
const ResponderView = lazy(() => import('./pages/ResponderView'))
const NotFound      = lazy(() => import('./pages/NotFound'))

// ── Minimal full-page loader shown during lazy imports ──────────────────────
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', flexDirection: 'column', gap: 'var(--space-4)',
    }}>
      <div style={{ fontSize: 32, animation: 'heartbeat 1.5s infinite' }}>⚡</div>
      <span className="spinner" style={{ width: 20, height: 20, borderWidth: 3 }} />
    </div>
  )
}

// ── Auth guard: redirect to login if no user in session storage ─────────────
function RequireAuth({ children, loginPath }) {
  const key = loginPath.replace('/', '') + '_user'
  const isAuthed = Boolean(sessionStorage.getItem(key))
  return isAuthed ? children : <Navigate to={loginPath} replace />
}

export default function App() {
  const navigate  = useNavigate()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [toasts, setToasts]     = useState([])
  // Auth state — persisted to sessionStorage for page-refresh resilience
  const [staffUser,   setStaffUser]   = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('staff_user')) } catch { return null }
  })
  const [commandUser, setCommandUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('command_user')) } catch { return null }
  })

  // ── Online / offline listener ──────────────────────────────────────────────
  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // ── Toast system ───────────────────────────────────────────────────────────
  const addToast = useCallback((toast) => {
    const id = Date.now()
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), toast.duration || 5000)
  }, [])

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  // ── Simulated incoming incident alert (only on active staff/command screens) ─
  useEffect(() => {
    if (!staffUser && !commandUser) return
    const t = setTimeout(() => {
      addToast({
        type: 'crisis',
        title: 'NEW — INC-2024-005',
        message: 'S1: Guest reports suspicious person — Parking Level B1',
        icon: '⚠️',
        duration: 8000,
      })
    }, 14000)
    return () => clearTimeout(t)
  }, [staffUser, commandUser, addToast])

  // ── Auth handlers ──────────────────────────────────────────────────────────
  const handleStaffLogin = useCallback((user) => {
    sessionStorage.setItem('staff_user', JSON.stringify(user))
    setStaffUser(user)
    addToast({ type: 'success', title: `Welcome, ${user.name}`, message: `${user.role} · Live monitoring active`, icon: '🛡️', duration: 4000 })
    navigate('/staff')
  }, [navigate, addToast])

  const handleCommandLogin = useCallback((user) => {
    sessionStorage.setItem('command_user', JSON.stringify(user))
    setCommandUser(user)
    addToast({ type: 'success', title: `Access granted, ${user.name}`, message: `Command Center · ${user.clearance || 'AUTHORIZED'}`, icon: '🏢', duration: 4000 })
    navigate('/command')
  }, [navigate, addToast])

  const handleStaffLogout = useCallback(() => {
    sessionStorage.removeItem('staff_user')
    setStaffUser(null)
    navigate('/')
  }, [navigate])

  const handleCommandLogout = useCallback(() => {
    sessionStorage.removeItem('command_user')
    setCommandUser(null)
    navigate('/')
  }, [navigate])

  const goHome = useCallback(() => navigate('/'), [navigate])

  // ── Shared props ───────────────────────────────────────────────────────────
  const sharedProps = { addToast, isOnline }

  return (
    <div className="app-layout">
      {!isOnline && <OfflineBanner />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Landing ─────────────────────────────────────────── */}
          <Route path="/" element={<RoleSelector />} />

          {/* ── Guest SOS (no auth required) ────────────────────── */}
          <Route
            path="/guest"
            element={<GuestSOS onBack={goHome} {...sharedProps} />}
          />

          {/* ── Staff Auth ───────────────────────────────────────── */}
          <Route
            path="/staff/login"
            element={
              staffUser
                ? <Navigate to="/staff" replace />
                : <StaffLogin onLogin={handleStaffLogin} onBack={goHome} />
            }
          />
          <Route
            path="/staff"
            element={
              staffUser
                ? <StaffDashboard onBack={handleStaffLogout} {...sharedProps} staffUser={staffUser} />
                : <Navigate to="/staff/login" replace />
            }
          />

          {/* ── Command Auth ─────────────────────────────────────── */}
          <Route
            path="/command/login"
            element={
              commandUser
                ? <Navigate to="/command" replace />
                : <CommandLogin onLogin={handleCommandLogin} onBack={goHome} />
            }
          />
          <Route
            path="/command"
            element={
              commandUser
                ? <CommandCenter onBack={handleCommandLogout} {...sharedProps} commandUser={commandUser} />
                : <Navigate to="/command/login" replace />
            }
          />

          {/* ── First Responder (token-gated, no session) ────────── */}
          <Route
            path="/responder"
            element={<ResponderView onBack={goHome} isOnline={isOnline} />}
          />

          {/* ── 404 ─────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}
