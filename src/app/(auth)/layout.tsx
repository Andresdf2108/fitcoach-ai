export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', width: '100%' }}>

      {/* ── Left: Brand panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '50%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px',
          background: '#0a0a0a',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow blob */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-100px',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, position: 'relative' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, #EAB308 0%, #a16207 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 13, color: '#000', letterSpacing: '-0.5px',
            boxShadow: '0 0 20px rgba(234,179,8,0.4)',
          }}>FC</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>FitCoach AI</span>
        </div>

        {/* Hero */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)',
            borderRadius: 999, padding: '5px 14px', fontSize: 11,
            color: '#EAB308', marginBottom: 28, letterSpacing: '0.08em', fontWeight: 700,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
            EARLY ACCESS
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1, color: 'white', margin: '0 0 18px', letterSpacing: '-0.04em' }}>
            Your coaching<br />business,<br />
            <span style={{ color: '#EAB308' }}>supercharged.</span>
          </h1>
          <p style={{ color: '#52525b', fontSize: 15, lineHeight: 1.7, maxWidth: 320, margin: 0 }}>
            Manage leads, clients, programs, and check-ins — built for coaches who are serious about scaling.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, position: 'relative' }}>
          {[
            { stat: '3×',  label: 'faster onboarding' },
            { stat: '80%', label: 'less admin work' },
            { stat: 'AI',  label: 'at every step' },
          ].map(({ stat, label }) => (
            <div key={label} style={{
              background: '#161616', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '16px 18px',
            }}>
              <p style={{ fontSize: 24, fontWeight: 900, color: '#EAB308', margin: 0, letterSpacing: '-0.03em' }}>{stat}</p>
              <p style={{ fontSize: 11, color: '#52525b', margin: '5px 0 0', lineHeight: 1.4, fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: 370 }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #EAB308 0%, #a16207 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 12, color: '#000',
            }}>FC</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>FitCoach AI</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
