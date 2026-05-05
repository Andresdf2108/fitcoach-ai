import { createClient } from '@/lib/supabase/server'

function Trend({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const last = values[values.length - 1]
  const prev = values[values.length - 2]
  const delta = last - prev
  if (delta === 0) return <span style={{ color: '#6b7280', fontSize: 11 }}>→</span>
  return (
    <span style={{ color: delta > 0 ? '#10b981' : '#ef4444', fontSize: 11, fontWeight: 700 }}>
      {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(delta % 1 === 0 ? 0 : 1)}
    </span>
  )
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ height: 4, background: '#1f1f1f', borderRadius: 99, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', background: color, borderRadius: 99, width: `${pct}%` }} />
    </div>
  )
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trainees } = await supabase
    .from('trainees')
    .select('id, goals, fitness_level, status, profiles(full_name, email)')
    .eq('trainer_id', user!.id)

  // Graceful fallback if migration 003 hasn't been run yet
  let allCheckins: any[] | null = []
  try {
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('trainer_id', user!.id)
      .order('week_start', { ascending: true })
    allCheckins = data
  } catch {
    // checkins table not yet created
  }

  // Per-client check-in data
  const clientReports = (trainees ?? []).map(t => {
    const profile = (t as any).profiles
    const checkins = (allCheckins ?? []).filter(c => c.trainee_id === t.id)
    const last = checkins[checkins.length - 1]

    const weights     = checkins.filter(c => c.weight_kg).map(c => Number(c.weight_kg))
    const energyVals  = checkins.filter(c => c.energy_level).map(c => c.energy_level)
    const sleepVals   = checkins.filter(c => c.sleep_quality).map(c => c.sleep_quality)
    const stressVals  = checkins.filter(c => c.stress_level).map(c => c.stress_level)
    const workouts    = checkins.map(c => c.workouts_completed ?? 0)

    const avg = (arr: number[]) => arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length) : null

    return {
      id: t.id,
      name: profile?.full_name ?? 'Unknown',
      email: profile?.email ?? '',
      status: t.status,
      goals: t.goals,
      fitnessLevel: t.fitness_level,
      checkinCount: checkins.length,
      lastCheckin: last ? new Date(last.week_start) : null,
      weights,
      avgEnergy:  avg(energyVals),
      avgSleep:   avg(sleepVals),
      avgStress:  avg(stressVals),
      totalWorkouts: workouts.reduce((s, v) => s + v, 0),
      energyVals,
      sleepVals,
      stressVals,
    }
  })

  // Platform summary
  const [{ count: totalLeads }, { count: wonLeads }] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id).eq('stage', 'won'),
  ])

  const conversionRate = totalLeads ? Math.round(((wonLeads ?? 0) / totalLeads) * 100) : 0
  const activeClients  = clientReports.filter(c => c.status === 'active').length
  const totalCheckins  = (allCheckins ?? []).length

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Reports</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Client progress & business overview</p>
      </div>

      {/* Top-line summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 36 }}>
        {[
          { label: 'Active clients',   value: activeClients,          color: '#10b981' },
          { label: 'Total check-ins',  value: totalCheckins,          color: '#FACC15' },
          { label: 'Lead conversion',  value: `${conversionRate}%`,   color: '#8b5cf6' },
          { label: 'Total leads',      value: totalLeads ?? 0,        color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: 14, padding: '18px 22px',
          }}>
            <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 6px', fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 30, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Per-client progress */}
      <h2 style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>
        Client Progress
      </h2>

      {clientReports.length === 0 ? (
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14,
          padding: 48, textAlign: 'center',
        }}>
          <p style={{ color: '#4b5563', fontSize: 14, margin: 0 }}>
            No clients yet. Client progress will appear here once they submit check-ins.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {clientReports.map(c => (
            <div key={c.id} style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14,
              padding: 24,
            }}>
              {/* Client header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: '#FACC1520', border: '2px solid #FACC1540',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FACC15', fontWeight: 800, fontSize: 16, flexShrink: 0,
                  }}>
                    {(c.name ?? '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 2px' }}>{c.name}</p>
                    <p style={{ color: '#4b5563', fontSize: 13, margin: 0 }}>
                      {c.checkinCount} check-in{c.checkinCount !== 1 ? 's' : ''}
                      {c.lastCheckin ? ` · Last: ${c.lastCheckin.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}` : ''}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {c.fitnessLevel && (
                    <span style={{
                      background: '#2a2a2a', color: '#9ca3af',
                      borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>{c.fitnessLevel}</span>
                  )}
                  <span style={{
                    background: c.status === 'active' ? '#10b98120' : '#6b728020',
                    color: c.status === 'active' ? '#10b981' : '#6b7280',
                    border: `1px solid ${c.status === 'active' ? '#10b98140' : '#6b728040'}`,
                    borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                    textTransform: 'capitalize',
                  }}>{c.status}</span>
                </div>
              </div>

              {c.checkinCount === 0 ? (
                <p style={{ color: '#3a3a3a', fontSize: 13, margin: 0 }}>No check-ins submitted yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>

                  {/* Weight */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 500, margin: 0 }}>Weight</p>
                      {c.weights.length >= 2 && <Trend values={c.weights} color="#3b82f6" />}
                    </div>
                    {c.weights.length > 0 ? (
                      <>
                        <p style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 0 4px' }}>
                          {c.weights[c.weights.length - 1].toFixed(1)}<span style={{ color: '#4b5563', fontSize: 12, marginLeft: 3 }}>kg</span>
                        </p>
                        {c.weights.length > 1 && (
                          <p style={{ color: '#4b5563', fontSize: 11, margin: 0 }}>
                            Started: {c.weights[0].toFixed(1)} kg
                          </p>
                        )}
                      </>
                    ) : <p style={{ color: '#3a3a3a', fontSize: 13, margin: 0 }}>No data</p>}
                  </div>

                  {/* Energy */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 500, margin: 0 }}>Avg Energy</p>
                      {c.energyVals.length >= 2 && <Trend values={c.energyVals} color="#FACC15" />}
                    </div>
                    {c.avgEnergy !== null ? (
                      <>
                        <p style={{ color: '#FACC15', fontWeight: 800, fontSize: 22, margin: '0 0 6px' }}>
                          {c.avgEnergy.toFixed(1)}<span style={{ color: '#4b5563', fontSize: 12, marginLeft: 2 }}>/10</span>
                        </p>
                        <MiniBar value={c.avgEnergy} max={10} color="#FACC15" />
                      </>
                    ) : <p style={{ color: '#3a3a3a', fontSize: 13, margin: 0 }}>No data</p>}
                  </div>

                  {/* Sleep */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 500, margin: 0 }}>Avg Sleep</p>
                      {c.sleepVals.length >= 2 && <Trend values={c.sleepVals} color="#3b82f6" />}
                    </div>
                    {c.avgSleep !== null ? (
                      <>
                        <p style={{ color: '#3b82f6', fontWeight: 800, fontSize: 22, margin: '0 0 6px' }}>
                          {c.avgSleep.toFixed(1)}<span style={{ color: '#4b5563', fontSize: 12, marginLeft: 2 }}>/10</span>
                        </p>
                        <MiniBar value={c.avgSleep} max={10} color="#3b82f6" />
                      </>
                    ) : <p style={{ color: '#3a3a3a', fontSize: 13, margin: 0 }}>No data</p>}
                  </div>

                  {/* Workouts */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 500, margin: 0 }}>Total Workouts</p>
                    </div>
                    <p style={{ color: '#10b981', fontWeight: 800, fontSize: 22, margin: '0 0 4px' }}>
                      {c.totalWorkouts}
                    </p>
                    <p style={{ color: '#4b5563', fontSize: 11, margin: 0 }}>
                      {c.checkinCount > 0 ? `${(c.totalWorkouts / c.checkinCount).toFixed(1)} / week avg` : ''}
                    </p>
                  </div>
                </div>
              )}

              {c.goals && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #222' }}>
                  <p style={{ color: '#4b5563', fontSize: 12, margin: 0 }}>
                    <span style={{ fontWeight: 600, color: '#6b7280' }}>Goal: </span>{c.goals}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
