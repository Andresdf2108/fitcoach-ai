import { createClient } from '@/lib/supabase/server'
import { createSession, updateSessionStatus, deleteSession, addAvailability, removeAvailability } from '@/app/actions/trainer'

const SESSION_TYPES = [
  'Training Session', 'Check-in Call', 'Initial Consultation',
  'Progress Review', 'Nutrition Review', 'Recovery Session',
]

const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  scheduled: { text: '#FACC15', bg: '#FACC1515', border: '#FACC1530' },
  completed: { text: '#10b981', bg: '#10b98115', border: '#10b98130' },
  cancelled: { text: '#6b7280', bg: '#6b728015', border: '#6b728030' },
  no_show:   { text: '#ef4444', bg: '#ef444415', border: '#ef444430' },
}

const DAY_NAMES  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_FULL   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const weekStart = weekDays[0].toISOString().split('T')[0]
  const weekEnd   = weekDays[6].toISOString().split('T')[0]

  const [{ data: trainees }, { data: sessions }, { data: upcoming }, { data: availability }] = await Promise.all([
    supabase.from('trainees').select('id, profiles(full_name)').eq('trainer_id', user!.id).eq('status', 'active'),
    supabase.from('sessions').select('*, trainees(profiles(full_name))').eq('trainer_id', user!.id).gte('session_date', weekStart).lte('session_date', weekEnd).order('session_time'),
    supabase.from('sessions').select('*, trainees(profiles(full_name))').eq('trainer_id', user!.id).gt('session_date', weekEnd).lte('session_date', new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]).eq('status', 'scheduled').order('session_date').order('session_time').limit(10),
    supabase.from('trainer_availability').select('*').eq('trainer_id', user!.id).order('day_of_week').order('start_time'),
  ])

  const sessionsByDay = weekDays.map(d => {
    const dateStr = d.toISOString().split('T')[0]
    return (sessions ?? []).filter(s => s.session_date === dateStr)
  })

  const availByDay = Array.from({ length: 7 }, (_, i) =>
    (availability ?? []).filter((a: any) => a.day_of_week === i)
  )

  const isToday = (d: Date) => d.toDateString() === today.toDateString()

  const inputStyle = {
    background: '#111', border: '1px solid #2a2a2a', borderRadius: 8,
    padding: '9px 13px', color: '#fff', fontSize: 13, outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ padding: 40, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Calendar</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
          Week of {MONTH_NAMES[monday.getMonth()]} {monday.getDate()}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }}>
        {/* Week Grid */}
        <div>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
            {weekDays.map((d, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ color: '#4b5563', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 4px' }}>
                  {DAY_NAMES[d.getDay()]}
                </p>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', margin: '0 auto',
                  background: isToday(d) ? '#FACC15' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <p style={{ fontSize: 17, fontWeight: 800, margin: 0, color: isToday(d) ? '#000' : '#fff' }}>
                    {d.getDate()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Session columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, minHeight: 360 }}>
            {sessionsByDay.map((daySessions, i) => (
              <div key={i} style={{
                background: isToday(weekDays[i]) ? '#FACC1508' : '#111',
                border: `1px solid ${isToday(weekDays[i]) ? '#FACC1525' : '#1f1f1f'}`,
                borderRadius: 12, padding: '10px 8px', minHeight: 120,
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                {daySessions.length === 0 && (
                  <p style={{ color: '#2a2a2a', fontSize: 11, textAlign: 'center', marginTop: 12 }}>—</p>
                )}
                {daySessions.map(s => {
                  const sc = STATUS_COLORS[s.status] ?? STATUS_COLORS.scheduled
                  const clientName = (s as any).trainees?.profiles?.full_name
                  return (
                    <div key={s.id} style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 8, padding: '7px 8px' }}>
                      <p style={{ color: sc.text, fontSize: 11, fontWeight: 700, margin: '0 0 2px' }}>
                        {s.session_time?.slice(0, 5)}
                      </p>
                      <p style={{ color: '#e5e7eb', fontSize: 11, fontWeight: 600, margin: '0 0 2px', lineHeight: 1.3 }}>
                        {s.title}
                      </p>
                      {clientName && <p style={{ color: '#6b7280', fontSize: 10, margin: 0 }}>{clientName}</p>}
                      {s.status === 'scheduled' && (
                        <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
                          <form action={updateSessionStatus.bind(null, s.id, 'completed')}>
                            <button type="submit" style={{
                              background: '#10b98120', color: '#10b981', border: 'none',
                              borderRadius: 4, padding: '2px 5px', fontSize: 9, cursor: 'pointer', fontWeight: 700,
                            }}>✓</button>
                          </form>
                          <form action={deleteSession.bind(null, s.id)}>
                            <button type="submit" style={{
                              background: '#ef444420', color: '#ef4444', border: 'none',
                              borderRadius: 4, padding: '2px 5px', fontSize: 9, cursor: 'pointer', fontWeight: 700,
                            }}>✕</button>
                          </form>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Schedule form */}
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 22 }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 18px' }}>Schedule Session</h2>
            {(!trainees || trainees.length === 0) ? (
              <p style={{ color: '#4b5563', fontSize: 13, margin: 0 }}>No active clients. Activate a client first.</p>
            ) : (
              <form action={createSession} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select name="trainee_id" style={{ ...inputStyle, width: '100%' }}>
                  <option value="">Select client (optional)</option>
                  {trainees.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.profiles?.full_name ?? 'Client'}</option>
                  ))}
                </select>
                <select name="title" style={{ ...inputStyle, width: '100%' }}>
                  {SESSION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input name="session_date" type="date" required defaultValue={today.toISOString().split('T')[0]} style={{ ...inputStyle, colorScheme: 'dark' }} />
                  <input name="session_time" type="time" required defaultValue="09:00" style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
                <select name="duration_minutes" style={{ ...inputStyle, width: '100%' }}>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                  <option value="120">2 hours</option>
                </select>
                <input name="notes" placeholder="Notes (optional)" style={{ ...inputStyle, width: '100%' }} />
                <button type="submit" style={{
                  background: '#FACC15', color: '#000', fontWeight: 700, border: 'none',
                  borderRadius: 8, padding: '10px 0', fontSize: 14, cursor: 'pointer',
                }}>Add to Calendar</button>
              </form>
            )}
          </div>

          {/* Upcoming */}
          {upcoming && upcoming.length > 0 && (
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 22 }}>
              <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 14px' }}>Coming up</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcoming.map(s => {
                  const d = new Date(s.session_date + 'T00:00:00')
                  const clientName = (s as any).trainees?.profiles?.full_name
                  return (
                    <div key={s.id} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '10px 12px', background: '#111', borderRadius: 10, border: '1px solid #222',
                    }}>
                      <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 34 }}>
                        <p style={{ color: '#FACC15', fontSize: 17, fontWeight: 800, margin: 0, lineHeight: 1 }}>{d.getDate()}</p>
                        <p style={{ color: '#4b5563', fontSize: 10, fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
                          {MONTH_NAMES[d.getMonth()]}
                        </p>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 1px' }}>{s.title}</p>
                        {clientName && <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>{clientName}</p>}
                        <p style={{ color: '#4b5563', fontSize: 11, margin: '2px 0 0' }}>
                          {s.session_time?.slice(0, 5)} · {s.duration_minutes}min
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Availability Management */}
      <div style={{ marginTop: 40, borderTop: '1px solid #1f1f1f', paddingTop: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>My Availability</h2>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
              Set your bookable hours — clients can self-book sessions within these windows.
            </p>
          </div>
        </div>

        {/* 7-day slot grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, marginBottom: 24 }}>
          {availByDay.map((slots, dayIdx) => (
            <div key={dayIdx}>
              <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 8px' }}>
                {DAY_FULL[dayIdx].slice(0, 3)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {slots.length === 0 ? (
                  <p style={{ color: '#2a2a2a', fontSize: 12 }}>—</p>
                ) : slots.map((slot: any) => (
                  <div key={slot.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#111', border: '1px solid #1f1f1f',
                    borderRadius: 7, padding: '5px 8px', gap: 4,
                  }}>
                    <span style={{ color: '#FACC15', fontSize: 11, fontWeight: 600 }}>
                      {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                    </span>
                    <form action={removeAvailability.bind(null, slot.id)}>
                      <button type="submit" style={{
                        background: 'transparent', color: '#4b5563', border: 'none',
                        fontSize: 12, cursor: 'pointer', padding: '0 2px', lineHeight: 1,
                      }}>×</button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add slot form */}
        <form action={addAvailability} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Day</label>
            <select name="day_of_week" style={{ ...inputStyle, width: 130 }}>
              {DAY_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>From</label>
            <input type="time" name="start_time" defaultValue="09:00" required style={{ ...inputStyle, width: 120, colorScheme: 'dark' }} />
          </div>
          <div>
            <label style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>To</label>
            <input type="time" name="end_time" defaultValue="17:00" required style={{ ...inputStyle, width: 120, colorScheme: 'dark' }} />
          </div>
          <button type="submit" style={{
            background: '#FACC15', color: '#000', fontWeight: 700, border: 'none',
            borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            + Add Slot
          </button>
        </form>
      </div>
    </div>
  )
}
