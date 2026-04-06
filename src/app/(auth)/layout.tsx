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
          background: 'linear-gradient(145deg, #0f0f0f 0%, #1c1c1c 60%, #262626 100%)',
          color: 'white',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#EAB308',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 14, color: '#000',
          }}>FC</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>FitCoach AI</span>
        </div>

        {/* Hero */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: 999, padding: '6px 16px', fontSize: 12,
            color: '#FDE047', marginBottom: 28, letterSpacing: '0.05em', fontWeight: 600,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            NOW IN EARLY ACCESS
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, color: 'white', marginBottom: 20 }}>
            Your coaching<br />business,<br />
            <span style={{ color: '#EAB308' }}>powered by AI.</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 16, lineHeight: 1.75, maxWidth: 340 }}>
            Manage leads, clients, programs, and check-ins — all in one platform built for serious coaches.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {[
            { stat: '3×', label: 'faster onboarding' },
            { stat: '80%', label: 'less admin work' },
            { stat: 'AI', label: 'at every step' },
          ].map(({ stat, label }) => (
            <div key={label} style={{
              background: '#1f1f1f', border: '1px solid #2e2e2e',
              borderRadius: 16, padding: '18px 20px',
            }}>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#EAB308', margin: 0 }}>{stat}</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0', lineHeight: 1.4 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#EAB308',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 13, color: '#000',
            }}>FC</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>FitCoach AI</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
