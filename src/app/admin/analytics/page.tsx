import { createClient } from '@/lib/supabase/server'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const [
    { count: totalTrainers },
    { count: activeTrainers },
    { count: totalTrainees },
    { count: activeTrainees },
    { count: totalLeads },
    { count: wonLeads },
  ] = await Promise.all([
    supabase.from('trainers').select('*', { count: 'exact', head: true }),
    supabase.from('trainers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('trainees').select('*', { count: 'exact', head: true }),
    supabase.from('trainees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('stage', 'won'),
  ])

  const trainerActivePct = totalTrainers ? Math.round(((activeTrainers ?? 0) / totalTrainers) * 100) : 0
  const traineeActivePct = totalTrainees ? Math.round(((activeTrainees ?? 0) / totalTrainees) * 100) : 0
  const leadConvPct = totalLeads ? Math.round(((wonLeads ?? 0) / totalLeads) * 100) : 0
  const avgPerTrainer = activeTrainers ? ((activeTrainees ?? 0) / activeTrainers).toFixed(1) : '0'

  const groups = [
    {
      title: 'Platform Users',
      stats: [
        { label: 'Total Trainers',  value: totalTrainers ?? 0, color: '#FACC15' },
        { label: 'Active Trainers', value: activeTrainers ?? 0, color: '#10b981' },
        { label: 'Total Trainees',  value: totalTrainees ?? 0, color: '#3b82f6' },
        { label: 'Active Trainees', value: activeTrainees ?? 0, color: '#10b981' },
      ],
    },
    {
      title: 'Performance',
      stats: [
        { label: 'Trainer activity', value: `${trainerActivePct}%`, color: '#FACC15' },
        { label: 'Trainee retention', value: `${traineeActivePct}%`, color: '#10b981' },
        { label: 'Lead conversion', value: `${leadConvPct}%`, color: '#8b5cf6' },
        { label: 'Avg clients / trainer', value: avgPerTrainer, color: '#3b82f6' },
      ],
    },
  ]

  const funnelRows = [
    { label: 'Total leads',     value: totalLeads ?? 0,    max: totalLeads ?? 1,  color: '#52525b' },
    { label: 'Converted (won)', value: wonLeads ?? 0,      max: totalLeads ?? 1,  color: '#FACC15' },
    { label: 'Active trainees', value: activeTrainees ?? 0, max: totalLeads ?? 1, color: '#10b981' },
  ]

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Analytics</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>Platform-wide metrics</p>
      </div>

      {groups.map(group => (
        <div key={group.title} style={{ marginBottom: 24 }}>
          <h2 style={{ color: '#3f3f46', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>{group.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {group.stats.map(s => (
              <div key={s.label} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 13, padding: '18px 20px' }}>
                <p style={{ color: '#52525b', fontSize: 12, margin: '0 0 8px', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: s.color, margin: 0, letterSpacing: '-0.03em' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px' }}>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 18px', letterSpacing: '-0.01em' }}>Conversion funnel</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {funnelRows.map(row => (
            <div key={row.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: '#a1a1aa', fontSize: 13 }}>{row.label}</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{row.value}</span>
              </div>
              <div style={{ height: 6, background: '#1f1f1f', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: row.color, borderRadius: 99,
                  width: (row.max ?? 0) > 0 ? `${Math.min(Math.round(((row.value ?? 0) / row.max) * 100), 100)}%` : '0%',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
