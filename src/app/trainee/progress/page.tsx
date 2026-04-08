import { createClient } from '@/lib/supabase/server'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default async function TraineeProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trainee } = await supabase
    .from('trainees')
    .select('fitness_level, primary_goal, created_at')
    .eq('id', user!.id)
    .single()

  const { data: checkins } = await supabase
    .from('checkins')
    .select('weight_kg, energy_level, sleep_quality, workouts_completed, week_start, created_at')
    .eq('trainee_id', user!.id)
    .order('week_start', { ascending: true })

  const withWeight = (checkins ?? []).filter(c => c.weight_kg)
  const firstWeight = withWeight[0]?.weight_kg
  const lastWeight = withWeight[withWeight.length - 1]?.weight_kg
  const weightChange = firstWeight && lastWeight ? +(lastWeight - firstWeight).toFixed(1) : null

  const totalWorkouts = (checkins ?? []).reduce((sum, c) => sum + (c.workouts_completed || 0), 0)
  const avgEnergy = checkins?.length
    ? (checkins.reduce((s, c) => s + (c.energy_level || 0), 0) / checkins.length).toFixed(1)
    : null

  // Streak — consecutive weeks with ≥1 workout
  let streak = 0
  const sorted = [...(checkins ?? [])].reverse()
  for (const c of sorted) {
    if (c.workouts_completed > 0) streak++
    else break
  }

  const WeightIcon = weightChange === null ? Minus : weightChange < 0 ? TrendingDown : TrendingUp
  const weightColor = weightChange === null ? '#52525b' : weightChange < 0 ? '#10b981' : '#f59e0b'

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Progress</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>
          {checkins?.length ?? 0} check-in{checkins?.length !== 1 ? 's' : ''} logged
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Current streak', value: `${streak}wk`, color: streak > 0 ? '#FACC15' : '#52525b' },
          { label: 'Total workouts', value: totalWorkouts, color: '#10b981' },
          { label: 'Avg energy', value: avgEnergy ? `${avgEnergy}/10` : '—', color: '#3b82f6' },
          {
            label: 'Weight change',
            value: weightChange === null ? '—' : `${weightChange > 0 ? '+' : ''}${weightChange} kg`,
            color: weightColor,
          },
        ].map(s => (
          <div key={s.label} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ color: '#52525b', fontSize: 12, margin: '0 0 8px', fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: 0, letterSpacing: '-0.03em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Weight history */}
      {withWeight.length > 0 && (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0, letterSpacing: '-0.01em' }}>Weight history</h2>
            {weightChange !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <WeightIcon size={13} color={weightColor} strokeWidth={2} />
                <span style={{ color: weightColor, fontSize: 13, fontWeight: 700 }}>
                  {weightChange > 0 ? '+' : ''}{weightChange} kg total
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {withWeight.slice(-8).reverse().map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0f0f0f', borderRadius: 8 }}>
                <span style={{ color: '#71717a', fontSize: 13 }}>
                  {new Date(c.week_start).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{c.weight_kg} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile */}
      {trainee && (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px' }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 14px', letterSpacing: '-0.01em' }}>Your profile</h2>
          <div style={{ display: 'flex', gap: 16 }}>
            {trainee.primary_goal && (
              <div>
                <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Goal</p>
                <p style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
                  {trainee.primary_goal.replace(/_/g, ' ')}
                </p>
              </div>
            )}
            {trainee.fitness_level && (
              <div>
                <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Level</p>
                <p style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
                  {trainee.fitness_level}
                </p>
              </div>
            )}
            <div>
              <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Member since</p>
              <p style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 600, margin: 0 }}>
                {new Date(trainee.created_at).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {checkins?.length === 0 && (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '36px 28px', textAlign: 'center' }}>
          <p style={{ color: '#52525b', fontSize: 14, margin: '0 0 6px', fontWeight: 600 }}>No data yet</p>
          <p style={{ color: '#3f3f46', fontSize: 13, margin: 0 }}>Submit your first weekly check-in to start tracking progress.</p>
        </div>
      )}
    </div>
  )
}
