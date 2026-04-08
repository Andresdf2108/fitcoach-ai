import { createClient } from '@/lib/supabase/server'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user!.id).single()

  const inputStyle = {
    width: '100%', background: '#0f0f0f',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
    padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const settings = [
    { label: 'Platform name',    value: 'FitCoach AI',    disabled: true },
    { label: 'Admin email',      value: profile?.email ?? '', disabled: true },
    { label: 'Support email',    value: 'support@fitcoach.ai', disabled: true },
  ]

  const features = [
    { label: 'Email confirmations on signup', enabled: true },
    { label: 'Trainer self-service onboarding', enabled: true },
    { label: 'AI assistant for trainers', enabled: true },
    { label: 'Trainee check-ins', enabled: true },
    { label: 'In-app messaging', enabled: true },
    { label: 'Stripe billing integration', enabled: false },
  ]

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 600 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Settings</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>Platform configuration</p>
      </div>

      {/* Platform config */}
      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px', marginBottom: 14 }}>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 18px', letterSpacing: '-0.01em' }}>Platform</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {settings.map(s => (
            <div key={s.label}>
              <label style={{ color: '#52525b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>{s.label}</label>
              <input defaultValue={s.value} disabled={s.disabled} style={{
                ...inputStyle,
                color: s.disabled ? '#52525b' : '#fff',
                cursor: s.disabled ? 'not-allowed' : 'text',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Feature flags */}
      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px', marginBottom: 14 }}>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 18px', letterSpacing: '-0.01em' }}>Features</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map(f => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0f0f0f', borderRadius: 9 }}>
              <span style={{ color: '#a1a1aa', fontSize: 13 }}>{f.label}</span>
              <div style={{
                width: 36, height: 20, borderRadius: 99,
                background: f.enabled ? '#FACC15' : '#2a2a2a',
                display: 'flex', alignItems: 'center',
                padding: '0 3px', cursor: 'not-allowed',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', background: '#000',
                  marginLeft: f.enabled ? 16 : 0, transition: 'margin-left 0.2s',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin info */}
      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ color: '#52525b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 6px' }}>Signed in as admin</p>
        <p style={{ color: '#a1a1aa', fontSize: 13, margin: 0 }}>{profile?.full_name} &nbsp;·&nbsp; {profile?.email}</p>
      </div>
    </div>
  )
}
