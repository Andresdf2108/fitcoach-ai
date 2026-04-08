import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function submitCheckin(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: trainee } = await supabase
    .from('trainees').select('trainer_id').eq('id', user.id).single()
  if (!trainee?.trainer_id) return

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)

  await supabase.from('checkins').insert({
    trainee_id: user.id,
    trainer_id: trainee.trainer_id,
    weight_kg: formData.get('weight_kg') ? Number(formData.get('weight_kg')) : null,
    energy_level: Number(formData.get('energy_level')),
    sleep_quality: Number(formData.get('sleep_quality')),
    stress_level: Number(formData.get('stress_level')),
    workouts_completed: Number(formData.get('workouts_completed')) || 0,
    notes: formData.get('notes') as string || null,
    week_start: weekStart.toISOString().split('T')[0],
  })
  revalidatePath('/trainee/checkins')
}

const ScoreBar = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ color: '#a1a1aa', fontSize: 12 }}>{label}</span>
      <span style={{ color, fontSize: 12, fontWeight: 700 }}>{value}/10</span>
    </div>
    <div style={{ height: 5, background: '#1f1f1f', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value * 10}%`, background: color, borderRadius: 99 }} />
    </div>
  </div>
)

export default async function TraineeCheckinsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trainee } = await supabase
    .from('trainees').select('trainer_id, status').eq('id', user!.id).single()

  const { data: checkins } = await supabase
    .from('checkins')
    .select('*')
    .eq('trainee_id', user!.id)
    .order('created_at', { ascending: false })

  const hasTrainer = !!trainee?.trainer_id

  // Check if already submitted this week
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
  const weekKey = weekStart.toISOString().split('T')[0]
  const submittedThisWeek = checkins?.some(c => c.week_start === weekKey)

  const sliderStyle = {
    width: '100%', accentColor: '#FACC15', cursor: 'pointer',
  } as React.CSSProperties

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 680 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Check-ins</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>Weekly report to your coach</p>
      </div>

      {/* Submit form */}
      {!hasTrainer ? (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 28, marginBottom: 24 }}>
          <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>You don&apos;t have a trainer assigned yet. Your trainer will link up with you shortly.</p>
        </div>
      ) : submittedThisWeek ? (
        <div style={{ background: '#161616', border: '1px solid #10b98120', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <p style={{ color: '#10b981', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>Check-in submitted for this week</p>
          <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Your coach will review it and send feedback. Come back next Monday for your next check-in.</p>
        </div>
      ) : (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 28, marginBottom: 28 }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            This week&apos;s check-in
            <span style={{ color: '#52525b', fontSize: 12, fontWeight: 400, marginLeft: 8 }}>{new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}</span>
          </h2>
          <form action={submitCheckin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Weight */}
            <div>
              <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Weight (kg) — optional</label>
              <input name="weight_kg" type="number" step="0.1" min="30" max="300" placeholder="e.g. 78.5" style={{
                background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' as const,
              }} />
            </div>

            {/* Sliders */}
            {[
              { name: 'energy_level',  label: 'Energy level',  low: 'Exhausted', high: 'Energized' },
              { name: 'sleep_quality', label: 'Sleep quality',  low: 'Terrible',  high: 'Great' },
              { name: 'stress_level',  label: 'Stress level',   low: 'Chill',     high: 'Overwhelmed' },
            ].map(s => (
              <div key={s.name}>
                <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>{s.label}</label>
                <input type="range" name={s.name} min="1" max="10" defaultValue="7" style={sliderStyle} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ color: '#3f3f46', fontSize: 11 }}>{s.low}</span>
                  <span style={{ color: '#3f3f46', fontSize: 11 }}>{s.high}</span>
                </div>
              </div>
            ))}

            {/* Workouts */}
            <div>
              <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Workouts completed this week</label>
              <select name="workouts_completed" style={{
                background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                padding: '10px 14px', color: '#fff', fontSize: 14, width: '100%',
              }}>
                {[0,1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} workout{n !== 1 ? 's' : ''}</option>)}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Notes for your coach — optional</label>
              <textarea name="notes" rows={3} placeholder="How did the week go? Any wins, struggles, or questions?" style={{
                background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
                width: '100%', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' as const,
              }} />
            </div>

            <button type="submit" style={{
              background: '#FACC15', color: '#000', fontWeight: 700, border: 'none',
              borderRadius: 10, padding: '12px 0', fontSize: 14, cursor: 'pointer',
            }}>Submit check-in</button>
          </form>
        </div>
      )}

      {/* History */}
      {checkins && checkins.length > 0 && (
        <div>
          <h2 style={{ color: '#52525b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {checkins.map(c => (
              <div key={c.id} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
                    Week of {new Date(c.week_start).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                  </span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {c.weight_kg && <span style={{ color: '#FACC15', fontSize: 13, fontWeight: 700 }}>{c.weight_kg} kg</span>}
                    {c.workouts_completed > 0 && <span style={{ color: '#52525b', fontSize: 12 }}>{c.workouts_completed} workouts</span>}
                  </div>
                </div>
                {(c.energy_level || c.sleep_quality || c.stress_level) && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: c.notes || c.trainer_feedback ? 12 : 0 }}>
                    {c.energy_level && <ScoreBar value={c.energy_level} label="Energy" color="#FACC15" />}
                    {c.sleep_quality && <ScoreBar value={c.sleep_quality} label="Sleep" color="#3b82f6" />}
                    {c.stress_level && <ScoreBar value={10 - c.stress_level} label="Low stress" color="#10b981" />}
                  </div>
                )}
                {c.notes && <p style={{ color: '#52525b', fontSize: 12, margin: '8px 0 0', lineHeight: 1.6 }}>Your note: {c.notes}</p>}
                {c.trainer_feedback && (
                  <div style={{ marginTop: 10, background: '#FACC1508', border: '1px solid #FACC1515', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Coach feedback</p>
                    <p style={{ color: '#FACC15', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{c.trainer_feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
