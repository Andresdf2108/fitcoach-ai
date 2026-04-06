export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', width: '100%' }}>

      {/* ── Left: Brand panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '52%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)',
          color: 'white',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 15, color: 'white', letterSpacing: '-0.5px',
          }}>FC</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>FitCoach AI</span>
        </div>

        {/* Hero */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.12)', borderRadius: 999,
            padding: '6px 16px', fontSize: 13, color: '#bfdbfe', marginBottom: 24,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            Now in early access
          </div>
          <h1 style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.1, color: 'white', marginBottom: 20 }}>
            Your coaching<br />business,<br />
            <span style={{ color: '#bfdbfe' }}>powered by AI.</span>
          </h1>
          <p style={{ color: '#bfdbfe', fontSize: 17, lineHeight: 1.7, maxWidth: 320 }}>
            Manage leads, clients, programs, and check-ins — all in one platform built for serious coaches.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { stat: '3×', label: 'faster onboarding' },
            { stat: '80%', label: 'less admin work' },
            { stat: 'AI', label: 'at every step' },
          ].map(({ stat, label }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '16px 20px',
            }}>
              <p style={{ fontSize: 26, fontWeight: 900, color: 'white', margin: 0 }}>{stat}</p>
              <p style={{ fontSize: 12, color: '#bfdbfe', margin: '4px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, background: '#f9fafb',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: 13,
            }}>FC</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>FitCoach AI</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
