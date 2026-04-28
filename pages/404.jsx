import Head from 'next/head'
import { useRouter } from 'next/router'
import { Home, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>404 — Rapid Crisis Response</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="page bg-animated full-center">
        <div style={{ maxWidth: 400, width:'100%' }}>
          <div
            style={{
              fontSize:'clamp(5rem,20vw,7rem)', fontWeight:900, letterSpacing:'-0.06em',
              background:'linear-gradient(135deg, var(--color-crisis), rgba(255,45,85,0.3))',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              marginBottom:8, textAlign:'center',
            }}
          >
            404
          </div>

          <div
            style={{
              width:64, height:64, borderRadius:'var(--r-xl)',
              background:'rgba(255,45,85,0.1)', border:'1px solid rgba(255,45,85,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px',
            }}
          >
            <AlertTriangle size={28} style={{ color:'var(--color-crisis)' }} />
          </div>

          <h1 className="fw-800 text-2xl text-center mb-2">Page Not Found</h1>
          <p className="text-secondary text-center lh-normal mb-4" style={{ fontSize:14 }}>
            This link doesn&apos;t exist or may have expired.
            If you&apos;re in an emergency, use the links below.
          </p>

          {/* Quick links */}
          <div className="flex-col gap-2 mb-4">
            {[
              { href:'/guest',    icon:'🆘', label:'Guest SOS',        sub:'No login — report emergency now', cls:'btn-crisis' },
              { href:'/staff/login', icon:'👮', label:'Staff Dashboard', sub:'For hotel staff and security', cls:'btn-ghost' },
              { href:'/responder', icon:'🚒', label:'First Responder',  sub:'Emergency services access', cls:'btn-ghost' },
            ].map(l => (
              <Link key={l.href} href={l.href} className={`btn ${l.cls} btn-full`} style={{ justifyContent:'flex-start', gap:12, height:'auto', padding:'14px 16px' }}>
                <span style={{ fontSize:22 }}>{l.icon}</span>
                <div style={{ textAlign:'left' }}>
                  <div className="fw-700 text-sm">{l.label}</div>
                  <div className="text-xs text-secondary">{l.sub}</div>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => router.push('/')}
            className="btn btn-ghost btn-full"
          >
            <Home size={16} />
            Back to Home
          </button>

          <div className="text-center text-tertiary text-xs mt-4">
            Life-threatening emergency? Call{' '}
            <strong style={{ color:'var(--color-crisis)' }}>112</strong> immediately
          </div>
        </div>
      </div>
    </>
  )
}
