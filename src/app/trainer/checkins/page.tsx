import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function markReviewed(id: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('checkins').update({ reviewed: true }).eq('id', id)
  revalidatePath('/trainer/checkins')
}

async function addFeedback(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('checkins').update({
    trainer_feedback: formData.get('feedback') as string,
    reviewed: true,
  }).eq('id', id)
  revalidatePath('/trainer/checkins')
}

const ScoreBar = ({ value, label }: { value: number; label: string }) => {
  const color = value >= 7 ? '#10b981' : value >= 5 ? '#f59e0b' : '#ef4444'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ color: '#6b7280', fontSize: 11 }}>{label}</span>
        <span style={{ color, fontSize: 11, fontWeight: 700 }}>{value}/10</span>
      </div>
      <div style={{ height: 4, background: '#2a2a2a', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value * 10}%`, background: color, borderRadius: 99 }} />
      </div>
    </div>
  )
}

export default async function CheckinsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: checkins } = await supabase
    .from('checkins')
    .select('*, profiles!trainee_id(full_name)')
    .eq('trainer_id', user!.id)
    .order('created_at', { ascending: false })

  const pending = (checkins ?? []).filter(c => !c.reviewed)
  const reviewed = (checkins ?? []).filter(c => c.reviewed)

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Check-ins</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
          <span style={{ color: '#f59e0b' }}>{pending.length} pending review</span>
          &nbsp;·&nbsp; {reviewed.length} reviewed
        </p>
      </div>

      {checkins?.length === 0 && (
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
          padding: 48, textAlign: 'center',
        }}>
          <p style={{ fontSize: 32, margin: '0 0 12px' }}>✅</p>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
            No check-ins yet. Check-ins will appear here once your clients start submitting them.
          </p>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ color: '#f59e0b', fontSize: 14, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Pending Review
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pending.map(c => (
              <CheckinCard key={c.id} checkin={c} addFeedback={addFeedback} markReviewed={markReviewed} />
            ))}
          </div>
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h2 style={{ color: '#4b5563', fontSize: 14, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Reviewed
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviewed.map(c => (
              <CheckinCard key={c.id} checkin={c} addFeedback={addFeedback} markReviewed={markReviewed} reviewed />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CheckinCard({ checkin: c, addFeedback, markReviewed, reviewed = false }: {
  checkin: any
  addFeedback: (formData: FormData) => Promise<void>
  markReviewed: (id: string) => Promise<void>
  reviewed?: boolean
}) {
  const name = c.profiles?.full_name ?? 'Client'
  const date = new Date(c.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })

  return (
    <div style={{
      background: '#1a1a1a', border: `1px solid ${reviewed ? '#2a2a2a' : '#FACC1530'}`,
      borderRadius: 16, padding: 24, opacity: reviewed ? 0.7 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: '#FACC1520', border: '2px solid #FACC1540',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FACC15', fontWeight: 800, fontSize: 14,
          }}>{name[0].toUpperCase()}</div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>{name}</p>
            <p style={{ color: '#4b5563', fontSize: 12, margin: 0 }}>{date} · Week of {c.week_start}</p>
          </div>
        </div>
        {c.weight_kg && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#6b7280', fontSize: 11, margin: '0 0 2px' }}>Weight</p>
            <p style={{ color: '#FACC15', fontWeight: 700, fontSize: 16, margin: 0 }}>{c.weight_kg} kg</p>
          </div>
        )}
      </div>

      {/* Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: c.notes ? 16 : 0 }}>
        {c.energy_level && <ScoreBar value={c.energy_level} label="Energy" />}
        {c.sleep_quality && <ScoreBar value={c.sleep_quality} label="Sleep" />}
        {c.stress_level && <ScoreBar value={10 - c.stress_level} label="Low Stress" />}
      </div>

      {c.workouts_completed > 0 && (
        <p style={{ color: '#6b7280', fontSize: 13, margin: '12px 0 0' }}>
          Workouts completed: <span style={{ color: '#FACC15', fontWeight: 700 }}>{c.workouts_completed}</span>
        </p>
      )}

      {c.notes && (
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '12px 0 0', lineHeight: 1.6,
          background: '#111', borderRadius: 8, padding: '10px 14px',
        }}>
          &ldquo;{c.notes}&rdquo;
        </p>
      )}

      {/* Trainer feedback */}
      {c.trainer_feedback && (
        <div style={{ marginTop: 12, background: '#FACC1510', border: '1px solid #FACC1520', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Your Feedback</p>
          <p style={{ color: '#FACC15', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{c.trainer_feedback}</p>
        </div>
      )}

      {/* Actions */}
      {!reviewed && (
        <form action={addFeedback} style={{ marginTop: 16 }}>
          <input type="hidden" name="id" value={c.id} />
          <textarea
            name="feedback"
            placeholder="Add feedback for your client... (optional)"
            rows={2}
            style={{
              width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8,
              padding: '10px 14px', color: '#fff', fontSize: 13, resize: 'vertical',
              lineHeight: 1.6, boxSizing: 'border-box', marginBottom: 10, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{
              background: '#FACC15', color: '#000', fontWeight: 700, border: 'none',
              borderRadius: 8, padding: '8px 18px', fontSize: 13, cursor: 'pointer',
            }}>Send Feedback & Mark Reviewed</button>
            <form action={markReviewed.bind(null, c.id)}>
              <button type="submit" style={{
                background: '#2a2a2a', color: '#9ca3af', border: '1px solid #333',
                borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
              }}>Mark Reviewed</button>
            </form>
          </div>
        </form>
      )}
    </div>
  )
}
