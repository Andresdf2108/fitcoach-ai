import { createClient } from '@/lib/supabase/server'
import { CalendarDays, Clock } from 'lucide-react'

export default async function TraineeSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trainee } = await supabase
    .from('trainees')
    .select('trainer_id, profiles!trainer_id(full_name)')
    .eq('id', user!.id)
    .single()

  const trainerId = trainee?.trainer_id
  const trainerName = (trainee as any)?.profiles?.full_name ?? 'Your Coach'

  // Sessions are stored as messages from trainer containing "Session scheduled:"
  const { data: sessionMessages } = trainerId ? await supabase
    .from('messages')
    .select('*')
    .eq('sender_id', trainerId)
    .eq('recipient_id', user!.id)
    .like('body', 'Session scheduled:%')
    .order('created_at', { ascending: false }) : { data: [] }

  const sessions = (sessionMessages ?? []).map(m => {
    // Parse: "Session scheduled: 2026-04-10 at 14:00 — Training Session. Notes: ..."
    const match = m.body.match(/Session scheduled: (\S+) at (\S+) — ([^.]+)/)
    return {
      id: m.id,
      date: match?.[1] ?? '',
      time: match?.[2] ?? '',
      type: match?.[3] ?? 'Session',
      notes: m.body.includes('Notes:') ? m.body.split('Notes: ')[1] : null,
      raw: m.body,
      created_at: m.created_at,
    }
  })

  const upcoming = sessions.filter(s => s.date >= new Date().toISOString().split('T')[0])
  const past = sessions.filter(s => s.date < new Date().toISOString().split('T')[0])

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Sessions</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>
          {upcoming.length > 0 ? `${upcoming.length} upcoming` : 'No upcoming sessions'}
          {trainerId && ` with ${trainerName}`}
        </p>
      </div>

      {!trainerId ? (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 28 }}>
          <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>No trainer assigned yet. Sessions scheduled by your trainer will appear here.</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ color: '#52525b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>Upcoming</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map(s => (
                  <SessionCard key={s.id} session={s} trainerName={trainerName} upcoming />
                ))}
              </div>
            </div>
          )}

          {upcoming.length === 0 && (
            <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '32px 24px', textAlign: 'center', marginBottom: 24 }}>
              <CalendarDays size={28} color="#3f3f46" strokeWidth={1.5} style={{ marginBottom: 12 }} />
              <p style={{ color: '#52525b', fontSize: 14, margin: '0 0 4px', fontWeight: 600 }}>No upcoming sessions</p>
              <p style={{ color: '#3f3f46', fontSize: 13, margin: 0 }}>Your coach will schedule sessions and you&apos;ll see them here.</p>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 style={{ color: '#52525b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>Past sessions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {past.map(s => (
                  <SessionCard key={s.id} session={s} trainerName={trainerName} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SessionCard({ session: s, trainerName, upcoming = false }: { session: any; trainerName: string; upcoming?: boolean }) {
  const dateObj = s.date ? new Date(s.date + 'T12:00:00') : null
  const formatted = dateObj?.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' }) ?? s.date

  return (
    <div style={{
      background: '#161616',
      border: `1px solid ${upcoming ? '#FACC1520' : 'rgba(255,255,255,0.05)'}`,
      borderRadius: 13, padding: '18px 20px',
      opacity: upcoming ? 1 : 0.6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: upcoming ? '#FACC1510' : '#1f1f1f',
            border: `1px solid ${upcoming ? '#FACC1520' : 'rgba(255,255,255,0.05)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <CalendarDays size={16} color={upcoming ? '#FACC15' : '#52525b'} strokeWidth={2} />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 3px' }}>{s.type}</p>
            <p style={{ color: '#52525b', fontSize: 12, margin: 0 }}>with {trainerName}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: upcoming ? '#FACC15' : '#71717a', fontWeight: 700, fontSize: 13, margin: '0 0 2px' }}>{formatted}</p>
          {s.time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <Clock size={10} color="#52525b" strokeWidth={2} />
              <span style={{ color: '#52525b', fontSize: 12 }}>{s.time}</span>
            </div>
          )}
        </div>
      </div>
      {s.notes && <p style={{ color: '#52525b', fontSize: 12, margin: '10px 0 0', lineHeight: 1.5 }}>{s.notes}</p>}
    </div>
  )
}
