import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function createSession(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  // Sessions stored as a simple JSON note for now; full calendar integration TBD
  await supabase.from('messages').insert({
    sender_id: user.id,
    recipient_id: formData.get('trainee_id') as string,
    body: `Session scheduled: ${formData.get('date')} at ${formData.get('time')} — ${formData.get('type') || 'Training session'}${formData.get('notes') ? `. Notes: ${formData.get('notes')}` : ''}`,
  })
  revalidatePath('/trainer/calendar')
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trainees } = await supabase
    .from('trainees')
    .select('id, profiles(full_name)')
    .eq('trainer_id', user!.id)
    .eq('status', 'active')

  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  return (
    <div style={{ padding: 40, maxWidth: 700 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Calendar</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Schedule sessions with your clients</p>
      </div>

      {/* Next 7 days */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#9ca3af', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>
          Next 7 Days
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {days.map((d, i) => (
            <div key={i} style={{
              background: i === 0 ? '#EAB30820' : '#1a1a1a',
              border: `1px solid ${i === 0 ? '#EAB30840' : '#2a2a2a'}`,
              borderRadius: 12, padding: '12px 8px', textAlign: 'center',
            }}>
              <p style={{ color: '#6b7280', fontSize: 11, margin: '0 0 4px', fontWeight: 600 }}>
                {d.toLocaleDateString('en-CA', { weekday: 'short' }).toUpperCase()}
              </p>
              <p style={{ color: i === 0 ? '#EAB308' : '#fff', fontWeight: 800, fontSize: 20, margin: 0 }}>
                {d.getDate()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule session form */}
      {trainees && trainees.length > 0 ? (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28 }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>Schedule a Session</h2>
          <form action={createSession} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <select name="trainee_id" required style={{
              background: '#111', border: '1px solid #333', borderRadius: 8,
              padding: '10px 14px', color: '#fff', fontSize: 14,
            }}>
              <option value="">Select client</option>
              {trainees.map(t => (
                <option key={t.id} value={t.id}>{(t as any).profiles?.full_name ?? 'Client'}</option>
              ))}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input name="date" type="date" required
                defaultValue={today.toISOString().split('T')[0]}
                style={{
                  background: '#111', border: '1px solid #333', borderRadius: 8,
                  padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
                  colorScheme: 'dark',
                }}
              />
              <input name="time" type="time" required
                style={{
                  background: '#111', border: '1px solid #333', borderRadius: 8,
                  padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
                  colorScheme: 'dark',
                }}
              />
            </div>
            <select name="type" style={{
              background: '#111', border: '1px solid #333', borderRadius: 8,
              padding: '10px 14px', color: '#fff', fontSize: 14,
            }}>
              <option value="Training session">Training Session</option>
              <option value="Check-in call">Check-in Call</option>
              <option value="Initial consultation">Initial Consultation</option>
              <option value="Progress review">Progress Review</option>
            </select>
            <input name="notes" placeholder="Notes (optional)" style={{
              background: '#111', border: '1px solid #333', borderRadius: 8,
              padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
            }} />
            <button type="submit" style={{
              background: '#EAB308', color: '#000', fontWeight: 700, border: 'none',
              borderRadius: 8, padding: '11px 0', fontSize: 14, cursor: 'pointer',
            }}>
              Schedule Session
            </button>
          </form>
          <p style={{ color: '#374151', fontSize: 12, margin: '12px 0 0' }}>
            Session confirmations are sent via Messages to your client.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
          padding: 48, textAlign: 'center',
        }}>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
            No active clients yet. Activate clients to schedule sessions.
          </p>
        </div>
      )}
    </div>
  )
}
