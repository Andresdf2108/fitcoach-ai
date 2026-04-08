import { createClient } from '@/lib/supabase/server'
import { Dumbbell, BookOpen, Clock } from 'lucide-react'

const LEVEL_COLOR: Record<string, string> = {
  beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444',
}

export default async function TraineeWorkoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get assigned programs
  const { data: assignments } = await supabase
    .from('program_assignments')
    .select('*, programs(*)')
    .eq('trainee_id', user!.id)
    .eq('status', 'active')
    .order('start_date', { ascending: false })

  const { data: trainee } = await supabase
    .from('trainees')
    .select('trainer_id, fitness_level, primary_goal')
    .eq('id', user!.id)
    .single()

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Workouts</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>Your assigned training programs</p>
      </div>

      {(!assignments || assignments.length === 0) ? (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: '#FACC1510', border: '1px solid #FACC1520',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Dumbbell size={22} color="#FACC15" strokeWidth={1.8} />
          </div>
          <p style={{ color: '#52525b', fontSize: 14, margin: '0 0 6px', fontWeight: 600 }}>No program assigned yet</p>
          <p style={{ color: '#3f3f46', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            Your trainer will assign a training program after reviewing your profile.
            {trainee?.primary_goal && ` They know your goal is ${trainee.primary_goal.replace(/_/g, ' ')}.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {assignments.map(a => {
            const program = (a as any).programs
            const lc = LEVEL_COLOR[program?.level] ?? '#52525b'
            const daysLeft = a.end_date
              ? Math.max(0, Math.ceil((new Date(a.end_date).getTime() - Date.now()) / 86400000))
              : null

            return (
              <div key={a.id} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: '#FACC1510', border: '1px solid #FACC1520',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <BookOpen size={16} color="#FACC15" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 3px', letterSpacing: '-0.01em' }}>
                        {program?.name ?? 'Untitled Program'}
                      </h2>
                      <p style={{ color: '#52525b', fontSize: 12, margin: 0 }}>
                        Started {new Date(a.start_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                        {program?.duration_weeks && ` · ${program.duration_weeks} week program`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {program?.level && (
                      <span style={{
                        background: `${lc}15`, color: lc, border: `1px solid ${lc}30`,
                        borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                      }}>{program.level}</span>
                    )}
                    <span style={{
                      background: '#10b98115', color: '#10b981', border: '1px solid #10b98130',
                      borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                    }}>Active</span>
                  </div>
                </div>

                {program?.description && (
                  <p style={{ color: '#71717a', fontSize: 13, margin: '0 0 14px', lineHeight: 1.6 }}>{program.description}</p>
                )}

                {daysLeft !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                    <Clock size={12} color="#52525b" strokeWidth={2} />
                    <span style={{ color: '#52525b', fontSize: 12 }}>{daysLeft} days remaining</span>
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
