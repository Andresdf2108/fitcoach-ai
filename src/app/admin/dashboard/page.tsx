import { createClient } from '@/lib/supabase/server'
import { UserCheck, Users, DollarSign, Package } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: trainerCount }, { count: traineeCount }] = await Promise.all([
    supabase.from('trainers').select('*', { count: 'exact', head: true }),
    supabase.from('trainees').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Total Trainers', value: trainerCount ?? 0, icon: UserCheck,  color: '#8b5cf6' },
    { label: 'Total Trainees', value: traineeCount ?? 0, icon: Users,       color: '#3b82f6' },
    { label: 'MRR',            value: '$0',              icon: DollarSign,  color: '#10b981' },
    { label: 'Active Plans',   value: 0,                 icon: Package,     color: '#f59e0b' },
  ]

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Platform Overview</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>FitCoach AI — Admin Dashboard</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{
              background: '#161616', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '20px 22px',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: `${s.color}15`, border: `1px solid ${s.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                <Icon size={16} color={s.color} strokeWidth={2} />
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.03em' }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#52525b', margin: 0, fontWeight: 500 }}>{s.label}</p>
            </div>
          )
        })}
      </div>

      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Getting started</h2>
        <p style={{ color: '#52525b', fontSize: 13, margin: 0, lineHeight: 1.7 }}>
          Run the SQL migrations in Supabase, then trainers can sign up and start onboarding clients.
        </p>
      </div>
    </div>
  )
}
