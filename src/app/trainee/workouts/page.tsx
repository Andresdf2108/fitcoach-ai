import { createClient } from '@/lib/supabase/server'
import { logWorkout } from '@/app/actions/trainee'
import { Dumbbell, CheckCircle, Circle } from 'lucide-react'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const LEVEL_COLOR: Record<string, string> = {
  beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444',
}

export default async function TraineeWorkoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: assignments } = await supabase
    .from('program_assignments')
    .select('*, programs(*)')
    .eq('trainee_id', user!.id)
    .eq('status', 'active')
    .order('start_date', { ascending: false })

  // For each assignment, fetch exercises + logs
  const enriched = await Promise.all(
    (assignments ?? []).map(async (a) => {
      const program = (a as any).programs
      const durationWeeks = program?.duration_weeks ?? 1

      // Current week based on days elapsed since start
      const daysSinceStart = Math.max(
        0,
        Math.floor((Date.now() - new Date(a.start_date + 'T00:00:00').getTime()) / 86400000)
      )
      const currentWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, durationWeeks)

      let exercises: any[] = []
      let logs: any[] = []

      try {
        const [{ data: exData }, { data: logData }] = await Promise.all([
          supabase
            .from('program_exercises')
            .select('*')
            .eq('program_id', a.program_id)
            .eq('week_number', currentWeek)
            .order('day_number')
            .order('order_index'),
          supabase
            .from('workout_logs')
            .select('exercise_id')
            .eq('trainee_id', user!.id),
        ])
        exercises = exData ?? []
        logs = logData ?? []
      } catch {
        // tables not yet created
      }

      const completedSet = new Set(logs.map(l => l.exercise_id))

      // Group exercises by day
      const byDay: Record<number, any[]> = {}
      for (const ex of exercises) {
        if (!byDay[ex.day_number]) byDay[ex.day_number] = []
        byDay[ex.day_number].push({ ...ex, completed: completedSet.has(ex.id) })
      }

      const totalEx = exercises.length
      const completedEx = exercises.filter(e => completedSet.has(e.id)).length

      return { assignment: a, program, currentWeek, durationWeeks, byDay, totalEx, completedEx }
    })
  )

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 760 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>
          Workouts
        </h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>Your training program for this week</p>
      </div>

      {enriched.length === 0 ? (
        <div style={{
          background: '#161616', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: '40px 32px', textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: '#FACC1510', border: '1px solid #FACC1520',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Dumbbell size={22} color="#FACC15" strokeWidth={1.8} />
          </div>
          <p style={{ color: '#52525b', fontSize: 14, margin: '0 0 6px', fontWeight: 600 }}>No program assigned yet</p>
          <p style={{ color: '#3f3f46', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            Your trainer will assign a training program after reviewing your profile.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {enriched.map(({ assignment: a, program, currentWeek, durationWeeks, byDay, totalEx, completedEx }) => {
            const lc = LEVEL_COLOR[program?.level] ?? '#52525b'
            const progressPct = totalEx > 0 ? Math.round((completedEx / totalEx) * 100) : 0
            const activeDays = Object.keys(byDay).map(Number).sort((x, y) => x - y)

            return (
              <div key={a.id}>
                {/* Program header */}
                <div style={{
                  background: '#161616', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: '20px 24px', marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 17, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                        {program?.name ?? 'Training Program'}
                      </h2>
                      <p style={{ color: '#52525b', fontSize: 12, margin: 0 }}>
                        Week {currentWeek} of {durationWeeks} · started {new Date(a.start_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {program?.level && (
                        <span style={{
                          background: `${lc}15`, color: lc, border: `1px solid ${lc}30`,
                          borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                        }}>{program.level}</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {totalEx > 0 ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: '#52525b', fontSize: 12 }}>This week's progress</span>
                        <span style={{ color: progressPct === 100 ? '#10b981' : '#FACC15', fontSize: 12, fontWeight: 700 }}>
                          {completedEx}/{totalEx} exercises {progressPct === 100 ? '🎉' : ''}
                        </span>
                      </div>
                      <div style={{ height: 6, background: '#1f1f1f', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${progressPct}%`,
                          background: progressPct === 100 ? '#10b981' : '#FACC15',
                          transition: 'width 0.4s',
                        }} />
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#3f3f46', fontSize: 13, margin: 0 }}>
                      Your trainer hasn't built this week's workouts yet. Check back soon.
                    </p>
                  )}
                </div>

                {/* Day sections */}
                {activeDays.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {activeDays.map(dayNum => {
                      const dayExercises = byDay[dayNum] ?? []
                      const dayCompleted = dayExercises.filter(e => e.completed).length
                      const dayDone = dayCompleted === dayExercises.length

                      return (
                        <div key={dayNum} style={{
                          background: '#161616',
                          border: `1px solid ${dayDone ? '#10b98120' : 'rgba(255,255,255,0.05)'}`,
                          borderRadius: 13, overflow: 'hidden',
                        }}>
                          {/* Day header */}
                          <div style={{
                            padding: '14px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: dayDone ? '#10b98108' : 'transparent',
                          }}>
                            <span style={{ color: dayDone ? '#10b981' : '#fff', fontWeight: 700, fontSize: 14 }}>
                              {DAY_NAMES[dayNum - 1]}
                            </span>
                            <span style={{ color: '#3f3f46', fontSize: 12 }}>
                              {dayCompleted}/{dayExercises.length} done
                            </span>
                          </div>

                          {/* Exercises */}
                          <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {dayExercises.map(ex => (
                              <div key={ex.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 12px', borderRadius: 9,
                                background: ex.completed ? '#10b98108' : '#111',
                                border: `1px solid ${ex.completed ? '#10b98120' : '#1f1f1f'}`,
                                opacity: ex.completed ? 0.8 : 1,
                              }}>
                                {/* Checkbox */}
                                <form action={logWorkout.bind(null, ex.id)}>
                                  <button type="submit" style={{
                                    background: 'transparent', border: 'none',
                                    cursor: 'pointer', padding: 0, flexShrink: 0,
                                    display: 'flex', alignItems: 'center',
                                  }}>
                                    {ex.completed
                                      ? <CheckCircle size={20} color="#10b981" strokeWidth={2} />
                                      : <Circle size={20} color="#3f3f46" strokeWidth={1.5} />
                                    }
                                  </button>
                                </form>

                                {/* Exercise info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{
                                    color: ex.completed ? '#6b7280' : '#fff',
                                    fontWeight: 600, fontSize: 14, margin: 0,
                                    textDecoration: ex.completed ? 'line-through' : 'none',
                                  }}>
                                    {ex.name}
                                  </p>
                                  <p style={{ color: '#3f3f46', fontSize: 12, margin: '2px 0 0' }}>
                                    {ex.sets && ex.reps ? `${ex.sets} sets × ${ex.reps} reps` : ''}
                                    {ex.duration_minutes ? `${ex.duration_minutes} min` : ''}
                                    {ex.rest_seconds ? ` · ${ex.rest_seconds}s rest` : ''}
                                  </p>
                                  {ex.notes && (
                                    <p style={{ color: '#374151', fontSize: 12, margin: '3px 0 0', lineHeight: 1.4 }}>
                                      {ex.notes}
                                    </p>
                                  )}
                                  {ex.video_url && (
                                    <a
                                      href={ex.video_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 11, color: '#FACC15', fontWeight: 600, textDecoration: 'none' }}
                                    >
                                      ▶ Watch your coach&apos;s demo
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
