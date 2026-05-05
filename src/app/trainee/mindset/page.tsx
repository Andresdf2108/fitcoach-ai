import { createClient } from '@/lib/supabase/server'
import { Brain } from 'lucide-react'
import MindsetCheckinClient from './MindsetCheckinClient'

export default async function TraineeMindsetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch today's check-in (if any) + last 14 days of history
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: history } = await supabase
    .from('mindset_checkins')
    .select('id, mood_score, energy_score, focus_score, win_today, challenge_today, intention, ai_reflection, created_at')
    .eq('trainee_id', user!.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().slice(0, 10)
  const todays = (history ?? []).find(h => h.created_at.slice(0, 10) === today)

  const avg = (history ?? []).reduce(
    (acc, h) => {
      acc.mood += h.mood_score
      acc.energy += h.energy_score
      acc.focus += h.focus_score
      return acc
    },
    { mood: 0, energy: 0, focus: 0 },
  )
  const n = (history ?? []).length || 1
  const avgs = { mood: (avg.mood / n).toFixed(1), energy: (avg.energy / n).toFixed(1), focus: (avg.focus / n).toFixed(1) }

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 11px', borderRadius: 999, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', fontSize: 11, color: '#FACC15', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 12 }}>
          <Brain size={12} strokeWidth={2.4} />
          DAILY MINDSET
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
          How are you showing up today?
        </h1>
        <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>
          A 30-second check-in. Builds the depth that workouts alone don&apos;t reach.
        </p>
      </div>

      {/* 14-day rolling averages */}
      {(history?.length ?? 0) > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'Mood (14d avg)', value: avgs.mood, color: '#FACC15' },
            { label: 'Energy (14d avg)', value: avgs.energy, color: '#4ade80' },
            { label: 'Focus (14d avg)', value: avgs.focus, color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 11, color: '#71717a', margin: '0 0 6px', fontWeight: 600, letterSpacing: '0.04em' }}>{s.label.toUpperCase()}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: s.color, margin: 0, letterSpacing: '-0.03em' }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <MindsetCheckinClient existing={todays ?? null} />

      {/* History */}
      {(history?.length ?? 0) > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>Recent reflections</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(history ?? []).map(h => (
              <div key={h.id} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontSize: 12, color: '#71717a', margin: 0, fontWeight: 600 }}>
                    {new Date(h.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#a1a1aa', fontWeight: 600 }}>
                    <span>M {h.mood_score}</span>
                    <span>E {h.energy_score}</span>
                    <span>F {h.focus_score}</span>
                  </div>
                </div>
                {h.ai_reflection && (
                  <p style={{ color: '#d4d4d8', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{h.ai_reflection}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
