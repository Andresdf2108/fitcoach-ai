import { createClient } from '@/lib/supabase/server'
import { bookSession, cancelSession } from '@/app/actions/trainee'
import { CalendarDays, Clock } from 'lucide-react'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_FULL    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

type BookableSlot = { value: string; label: string }

export default async function TraineeSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trainee } = await supabase
    .from('trainees')
    .select('trainer_id, profiles!trainer_id(full_name)')
    .eq('id', user!.id)
    .single()

  const trainerId   = trainee?.trainer_id
  const trainerName = (trainee as any)?.profiles?.full_name ?? 'Your Coach'
  const today = new Date().toISOString().split('T')[0]

  const [{ data: sessions }, { data: availability }, { data: bookedSlots }] = trainerId
    ? await Promise.all([
        supabase.from('sessions').select('*').eq('trainee_id', user!.id).order('session_date').order('session_time'),
        supabase.from('trainer_availability').select('*').eq('trainer_id', trainerId).order('day_of_week').order('start_time'),
        supabase.from('sessions').select('session_date, session_time').eq('trainer_id', trainerId).gte('session_date', today).lte('session_date', new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]).eq('status', 'scheduled'),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  // Build bookable slots for next 7 days based on trainer's availability
  const bookedSet = new Set(
    (bookedSlots ?? []).map((s: any) => `${s.session_date}|${s.session_time.slice(0, 5)}`)
  )

  const bookableSlots: BookableSlot[] = []
  for (let i = 1; i <= 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dow = d.getDay() // 0=Sunday
    const dateStr = d.toISOString().split('T')[0]

    const daySlots = (availability ?? []).filter((a: any) => a.day_of_week === dow)
    for (const slot of daySlots) {
      const [sh, sm] = slot.start_time.split(':').map(Number)
      const [eh, em] = slot.end_time.split(':').map(Number)
      let curMin = sh * 60 + sm
      const endMin = eh * 60 + em
      while (curMin + 45 <= endMin) {
        const hh = String(Math.floor(curMin / 60)).padStart(2, '0')
        const mm = String(curMin % 60).padStart(2, '0')
        const timeStr = `${hh}:${mm}`
        const key = `${dateStr}|${timeStr}`
        if (!bookedSet.has(key)) {
          bookableSlots.push({
            value: key,
            label: `${DAY_FULL[dow]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()} at ${timeStr}`,
          })
        }
        curMin += 45
      }
    }
  }

  const upcoming  = (sessions ?? []).filter((s: any) => s.session_date >= today && s.status !== 'cancelled')
  const past      = (sessions ?? []).filter((s: any) => s.session_date < today || s.status === 'completed')

  const inputStyle = {
    background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
    padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
    width: '100%', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 680 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Sessions</h1>
        <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>
          {upcoming.length > 0 ? `${upcoming.length} upcoming` : 'No upcoming sessions'}
          {trainerId && ` · Coach: ${trainerName}`}
        </p>
      </div>

      {!trainerId ? (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 28 }}>
          <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>
            No trainer assigned. Once connected to a coach, sessions will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Self-booking */}
          <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginBottom: 28 }}>
            <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Book a Session</h2>
            <p style={{ color: '#52525b', fontSize: 13, margin: '0 0 16px' }}>
              Pick an available time slot with {trainerName}
            </p>
            {bookableSlots.length === 0 ? (
              <p style={{ color: '#3f3f46', fontSize: 13, margin: 0 }}>
                {(availability ?? []).length === 0
                  ? 'Your coach hasn\'t set their available hours yet. Check back soon.'
                  : 'No available slots in the next 7 days. Your coach may have a full schedule.'}
              </p>
            ) : (
              <form action={bookSession} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <select name="slot" required style={inputStyle}>
                    {bookableSlots.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" style={{
                  background: '#FACC15', color: '#000', fontWeight: 700, border: 'none',
                  borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', flexShrink: 0,
                }}>Book</button>
              </form>
            )}
          </div>

          {/* Upcoming sessions */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ color: '#52525b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
              Upcoming
            </h2>
            {upcoming.length === 0 ? (
              <div style={{
                background: '#161616', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 13, padding: '28px 24px', textAlign: 'center',
              }}>
                <p style={{ color: '#3f3f46', fontSize: 14, margin: 0 }}>
                  No upcoming sessions. Book one above or wait for your coach to schedule one.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map((s: any) => {
                  const d = new Date(s.session_date + 'T00:00:00')
                  const isSoon = (new Date(s.session_date).getTime() - Date.now()) < 2 * 86400000
                  return (
                    <div key={s.id} style={{
                      background: '#161616',
                      border: `1px solid ${isSoon ? '#FACC1525' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 13, padding: '18px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                      <div style={{
                        width: 52, flexShrink: 0, textAlign: 'center',
                        background: isSoon ? '#FACC1512' : '#111',
                        border: `1px solid ${isSoon ? '#FACC1525' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: 10, padding: '8px 0',
                      }}>
                        <p style={{ color: '#52525b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 2px' }}>
                          {MONTH_NAMES[d.getMonth()]}
                        </p>
                        <p style={{ color: isSoon ? '#FACC15' : '#fff', fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1 }}>
                          {d.getDate()}
                        </p>
                        <p style={{ color: '#3f3f46', fontSize: 10, margin: '2px 0 0' }}>
                          {DAY_FULL[d.getDay()].slice(0, 3)}
                        </p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>{s.title}</p>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} color="#52525b" strokeWidth={2} />
                            <span style={{ color: '#71717a', fontSize: 12 }}>
                              {s.session_time?.slice(0, 5)} · {s.duration_minutes}min
                            </span>
                          </div>
                          <span style={{ color: '#3f3f46', fontSize: 12 }}>with {trainerName}</span>
                        </div>
                        {s.notes && <p style={{ color: '#52525b', fontSize: 12, margin: '6px 0 0', lineHeight: 1.5 }}>{s.notes}</p>}
                      </div>
                      {s.booked_by === 'trainee' && (
                        <form action={cancelSession.bind(null, s.id)}>
                          <button type="submit" style={{
                            background: 'transparent', color: '#52525b',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 7, padding: '6px 12px', fontSize: 12,
                            cursor: 'pointer', flexShrink: 0,
                          }}>Cancel</button>
                        </form>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Past sessions */}
          {past.length > 0 && (
            <div>
              <h2 style={{ color: '#52525b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
                Past sessions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {past.slice(0, 5).map((s: any) => {
                  const d = new Date(s.session_date + 'T00:00:00')
                  return (
                    <div key={s.id} style={{
                      background: '#111', border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: 11, padding: '12px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      opacity: 0.7,
                    }}>
                      <div>
                        <p style={{ color: '#a1a1aa', fontWeight: 600, fontSize: 13, margin: '0 0 2px' }}>{s.title}</p>
                        <p style={{ color: '#52525b', fontSize: 12, margin: 0 }}>
                          {DAY_FULL[d.getDay()]}, {MONTH_NAMES[d.getMonth()]} {d.getDate()}
                        </p>
                      </div>
                      <span style={{
                        background: s.status === 'completed' ? '#10b98115' : '#6b728015',
                        color: s.status === 'completed' ? '#10b981' : '#6b7280',
                        borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                        textTransform: 'capitalize',
                      }}>{s.status}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
