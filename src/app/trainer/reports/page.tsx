import { createClient } from '@/lib/supabase/server'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: totalLeads },
    { count: wonLeads },
    { count: totalClients },
    { count: activeClients },
    { count: pausedClients },
    { count: checkinCount },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id).eq('stage', 'won'),
    supabase.from('trainees').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
    supabase.from('trainees').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id).eq('status', 'active'),
    supabase.from('trainees').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id).eq('status', 'paused'),
    supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
  ])

  const conversionRate = totalLeads && totalLeads > 0
    ? Math.round(((wonLeads ?? 0) / totalLeads) * 100)
    : 0

  const retentionRate = totalClients && totalClients > 0
    ? Math.round(((activeClients ?? 0) / totalClients) * 100)
    : 0

  const statGroups = [
    {
      title: 'Lead Pipeline',
      stats: [
        { label: 'Total Leads', value: totalLeads ?? 0, color: '#9ca3af' },
        { label: 'Won', value: wonLeads ?? 0, color: '#10b981' },
        { label: 'Conversion Rate', value: `${conversionRate}%`, color: '#FACC15' },
      ],
    },
    {
      title: 'Client Health',
      stats: [
        { label: 'Total Clients', value: totalClients ?? 0, color: '#9ca3af' },
        { label: 'Active', value: activeClients ?? 0, color: '#10b981' },
        { label: 'Paused', value: pausedClients ?? 0, color: '#f59e0b' },
        { label: 'Retention Rate', value: `${retentionRate}%`, color: '#FACC15' },
      ],
    },
    {
      title: 'Engagement',
      stats: [
        { label: 'Total Check-ins', value: checkinCount ?? 0, color: '#9ca3af' },
        { label: 'Avg / Client', value: totalClients ? Math.round((checkinCount ?? 0) / totalClients) : 0, color: '#FACC15' },
      ],
    },
  ]

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Reports</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Business overview and analytics</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {statGroups.map(group => (
          <div key={group.title}>
            <h2 style={{ color: '#9ca3af', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>
              {group.title}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${group.stats.length}, 1fr)`, gap: 14 }}>
              {group.stats.map(s => (
                <div key={s.label} style={{
                  background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14,
                  padding: '22px 24px',
                }}>
                  <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 10px', fontWeight: 500 }}>{s.label}</p>
                  <p style={{ fontSize: 34, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Conversion funnel */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ color: '#9ca3af', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>
          Lead Funnel
        </h2>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: 24 }}>
          {[
            { label: 'Total Leads', value: totalLeads ?? 0, max: totalLeads ?? 1, color: '#6b7280' },
            { label: 'Won (Converted)', value: wonLeads ?? 0, max: totalLeads ?? 1, color: '#10b981' },
            { label: 'Active Clients', value: activeClients ?? 0, max: totalLeads ?? 1, color: '#FACC15' },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: '#9ca3af', fontSize: 13 }}>{row.label}</span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{row.value}</span>
              </div>
              <div style={{ height: 8, background: '#2a2a2a', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: row.max > 0 ? `${Math.min(Math.round((row.value / row.max) * 100), 100)}%` : '0%',
                  background: row.color,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
