import { createClient } from '@/lib/supabase/server'

export default async function TraineeDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user!.id).single()

  const cards = [
    { label: "Today's Workout",  value: 'Not assigned yet', icon: '💪' },
    { label: 'Current Streak',   value: '0 days',           icon: '🔥' },
    { label: 'Pending Check-in', value: 'None due',         icon: '✅' },
    { label: 'New Messages',     value: '0',                icon: '💬' },
  ]

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Athlete'

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
          Hey {firstName}, let&apos;s go! 💥
        </h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Your coaching hub.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
        {cards.map((c) => (
          <div key={c.label} style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: 16, padding: 24,
          }}>
            <span style={{ fontSize: 28 }}>{c.icon}</span>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '12px 0 4px', fontWeight: 500 }}>{c.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#EAB308', margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: '24px 28px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Getting started</h2>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0, lineHeight: 1.7 }}>
          Your trainer will assign your first program shortly. Check back here for workouts, progress tracking, and messages from your coach.
        </p>
      </div>
    </div>
  )
}
