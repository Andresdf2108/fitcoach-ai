import { createClient } from '@/lib/supabase/server'

const statCard = (label: string, value: string | number, sub?: string) => ({ label, value, sub })

export default async function TrainerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: trainer }, { count: leadCount }, { count: clientCount }] =
    await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user!.id).single(),
      supabase.from('trainers').select('active_trainee_count, plan_id, subscription_plans(name, max_trainees)').eq('id', user!.id).single(),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
      supabase.from('trainees').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
    ])

  const plan = (trainer as any)?.subscription_plans
  const activeCount = (trainer as any)?.active_trainee_count ?? 0
  const maxCount = plan?.max_trainees ?? 5
  const capacityPct = Math.min(Math.round((activeCount / maxCount) * 100), 100)

  const stats = [
    statCard('Active Leads', leadCount ?? 0),
    statCard('Active Clients', clientCount ?? 0),
    statCard('Pending Check-ins', 0),
    statCard('Unread Messages', 0),
  ]

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Coach'

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
          Good day, {firstName} 👋
        </h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Here&apos;s your coaching overview.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: 16, padding: '20px 24px',
          }}>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px', fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#EAB308', margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Trainee capacity</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
              {activeCount} of {maxCount} active — Plan: <span style={{ color: '#EAB308', fontWeight: 600, textTransform: 'capitalize' }}>{plan?.name ?? 'Free'}</span>
            </p>
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: capacityPct >= 80 ? '#f59e0b' : '#EAB308' }}>{capacityPct}%</span>
        </div>
        <div style={{ width: '100%', height: 8, background: '#2a2a2a', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${capacityPct}%`,
            background: capacityPct >= 100 ? '#ef4444' : capacityPct >= 80 ? '#f59e0b' : '#EAB308',
            transition: 'width 0.4s',
          }} />
        </div>
        {capacityPct >= 80 && (
          <p style={{ fontSize: 13, color: '#f59e0b', marginTop: 10 }}>
            {capacityPct >= 100 ? '⛔ Capacity reached — upgrade to add more clients.' : '⚠️ Approaching capacity — consider upgrading soon.'}
          </p>
        )}
      </div>
    </div>
  )
}
