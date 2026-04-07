import { createClient } from '@/lib/supabase/server'
import { updateTraineeStatus } from '@/app/actions/trainer'

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  active:   { bg: '#10b98120', text: '#10b981', border: '#10b98140' },
  paused:   { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b40' },
  inactive: { bg: '#6b728020', text: '#6b7280', border: '#6b728040' },
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trainees } = await supabase
    .from('trainees')
    .select('*, profiles(full_name, email)')
    .eq('trainer_id', user!.id)
    .order('created_at', { ascending: false })

  const counts = {
    active:   (trainees ?? []).filter(t => t.status === 'active').length,
    paused:   (trainees ?? []).filter(t => t.status === 'paused').length,
    inactive: (trainees ?? []).filter(t => t.status === 'inactive').length,
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Clients</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
          {trainees?.length ?? 0} total &nbsp;·&nbsp;
          <span style={{ color: '#10b981' }}>{counts.active} active</span> &nbsp;·&nbsp;
          <span style={{ color: '#f59e0b' }}>{counts.paused} paused</span>
        </p>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {(['active', 'paused', 'inactive'] as const).map(s => {
          const c = STATUS_COLORS[s]
          return (
            <div key={s} style={{
              background: '#1a1a1a', border: `1px solid ${c.border}`,
              borderRadius: 16, padding: '20px 24px',
            }}>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px', fontWeight: 500, textTransform: 'capitalize' }}>{s}</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: c.text, margin: 0 }}>{counts[s]}</p>
            </div>
          )
        })}
      </div>

      {/* Client list */}
      {(!trainees || trainees.length === 0) ? (
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
          padding: 48, textAlign: 'center',
        }}>
          <p style={{ fontSize: 32, margin: '0 0 12px' }}>👥</p>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>No clients yet. Convert your leads to start coaching.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {trainees.map(trainee => {
            const profile = (trainee as any).profiles
            const sc = STATUS_COLORS[trainee.status] ?? STATUS_COLORS.inactive
            return (
              <div key={trainee.id} style={{
                background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
                padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#EAB30820', border: '2px solid #EAB30840',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#EAB308', fontWeight: 800, fontSize: 16, flexShrink: 0,
                }}>
                  {(profile?.full_name ?? '?')[0].toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 3px' }}>
                    {profile?.full_name ?? 'Unknown'}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>{profile?.email ?? ''}</p>
                  {trainee.primary_goal && (
                    <p style={{ color: '#4b5563', fontSize: 12, margin: '4px 0 0' }}>
                      Goal: {trainee.primary_goal}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <span style={{
                  background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                  borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700,
                  textTransform: 'capitalize',
                }}>{trainee.status}</span>

                {/* Status actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {trainee.status !== 'active' && (
                    <form action={updateTraineeStatus.bind(null, trainee.id, 'active')}>
                      <button type="submit" style={{
                        background: '#10b98120', color: '#10b981', border: '1px solid #10b98140',
                        borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>Activate</button>
                    </form>
                  )}
                  {trainee.status !== 'paused' && (
                    <form action={updateTraineeStatus.bind(null, trainee.id, 'paused')}>
                      <button type="submit" style={{
                        background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40',
                        borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>Pause</button>
                    </form>
                  )}
                  {trainee.status !== 'inactive' && (
                    <form action={updateTraineeStatus.bind(null, trainee.id, 'inactive')}>
                      <button type="submit" style={{
                        background: '#6b728020', color: '#6b7280', border: '1px solid #6b728040',
                        borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>Deactivate</button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
