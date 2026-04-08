import { createClient } from '@/lib/supabase/server'

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  active:     { color: '#10b981', bg: '#10b98115' },
  onboarding: { color: '#3b82f6', bg: '#3b82f615' },
  paused:     { color: '#f59e0b', bg: '#f59e0b15' },
  inactive:   { color: '#52525b', bg: '#52525b15' },
  at_risk:    { color: '#ef4444', bg: '#ef444415' },
}

export default async function AdminTraineesPage() {
  const supabase = await createClient()

  const { data: trainees } = await supabase
    .from('trainees')
    .select('*, profiles(full_name, email, created_at), trainer:profiles!trainer_id(full_name)')
    .order('created_at', { ascending: false })

  const counts = {
    active:     (trainees ?? []).filter(t => t.status === 'active').length,
    onboarding: (trainees ?? []).filter(t => t.status === 'onboarding').length,
    paused:     (trainees ?? []).filter(t => t.status === 'paused').length,
  }

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Trainees</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>
          {trainees?.length ?? 0} total &nbsp;·&nbsp;
          <span style={{ color: '#10b981' }}>{counts.active} active</span> &nbsp;·&nbsp;
          <span style={{ color: '#3b82f6' }}>{counts.onboarding} onboarding</span> &nbsp;·&nbsp;
          <span style={{ color: '#f59e0b' }}>{counts.paused} paused</span>
        </p>
      </div>

      {(!trainees || trainees.length === 0) ? (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '40px 28px', textAlign: 'center' }}>
          <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>No trainees registered yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px 120px', gap: 16, padding: '0 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['Trainee', 'Trainer', 'Status', 'Joined'].map(h => (
              <span key={h} style={{ color: '#3f3f46', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</span>
            ))}
          </div>
          {trainees.map(t => {
            const profile = (t as any).profiles
            const trainer = (t as any).trainer
            const s = STATUS_STYLE[t.status] ?? STATUS_STYLE.inactive
            const initials = (profile?.full_name ?? '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

            return (
              <div key={t.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 160px 120px 120px',
                gap: 16, padding: '14px 16px', borderRadius: 10,
                background: '#161616', border: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: '#3b82f620', color: '#3b82f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                  }}>{initials}</div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0 }}>{profile?.full_name ?? 'Unknown'}</p>
                    <p style={{ color: '#52525b', fontSize: 11, margin: 0 }}>{profile?.email ?? ''}</p>
                  </div>
                </div>
                <span style={{ color: '#a1a1aa', fontSize: 13 }}>{trainer?.full_name ?? <span style={{ color: '#3f3f46' }}>Unassigned</span>}</span>
                <span style={{
                  display: 'inline-flex', background: s.bg, color: s.color,
                  borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                  textTransform: 'capitalize', width: 'fit-content',
                }}>{t.status}</span>
                <span style={{ color: '#52525b', fontSize: 12 }}>
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-CA', { month: 'short', year: '2-digit' }) : '—'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
