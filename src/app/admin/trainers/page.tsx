import { createClient } from '@/lib/supabase/server'

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  active:    { color: '#10b981', bg: '#10b98115' },
  paused:    { color: '#f59e0b', bg: '#f59e0b15' },
  suspended: { color: '#ef4444', bg: '#ef444415' },
}

export default async function AdminTrainersPage() {
  const supabase = await createClient()

  const { data: trainers } = await supabase
    .from('trainers')
    .select('*, profiles(full_name, email, created_at), subscription_plans(name, max_trainees)')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Trainers</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>{trainers?.length ?? 0} registered</p>
      </div>

      {(!trainers || trainers.length === 0) ? (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '40px 28px', textAlign: 'center' }}>
          <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>No trainers registered yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 120px 80px 80px', gap: 16, padding: '0 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['Trainer', 'Plan', 'Status', 'Clients', 'Joined'].map(h => (
              <span key={h} style={{ color: '#3f3f46', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</span>
            ))}
          </div>
          {trainers.map(t => {
            const profile = (t as any).profiles
            const plan = (t as any).subscription_plans
            const s = STATUS_STYLE[t.status] ?? STATUS_STYLE.active
            const initials = (profile?.full_name ?? '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

            return (
              <div key={t.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 180px 120px 80px 80px',
                gap: 16, padding: '14px 16px', borderRadius: 10,
                background: '#161616', border: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: '#FACC15', color: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                  }}>{initials}</div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0 }}>{profile?.full_name ?? 'Unknown'}</p>
                    <p style={{ color: '#52525b', fontSize: 11, margin: 0 }}>{profile?.email ?? ''}</p>
                  </div>
                </div>
                <span style={{ color: '#a1a1aa', fontSize: 13, textTransform: 'capitalize', fontWeight: 500 }}>
                  {plan?.name ?? 'Free'} <span style={{ color: '#3f3f46' }}>/ {plan?.max_trainees ?? 5} max</span>
                </span>
                <span style={{
                  display: 'inline-flex', background: s.bg, color: s.color,
                  borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                  textTransform: 'capitalize', width: 'fit-content',
                }}>{t.status}</span>
                <span style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 700 }}>{t.active_trainee_count ?? 0}</span>
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
