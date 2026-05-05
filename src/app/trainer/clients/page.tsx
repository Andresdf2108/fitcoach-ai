import { createClient } from '@/lib/supabase/server'
import { updateTraineeStatus } from '@/app/actions/trainer'
import Link from 'next/link'
import { CopyInviteButton } from '@/components/copy-invite-button'

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  active:    { bg: '#10b98120', text: '#10b981', border: '#10b98140' },
  paused:    { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b40' },
  inactive:  { bg: '#6b728020', text: '#6b7280', border: '#6b728040' },
  onboarding:{ bg: '#3b82f620', text: '#3b82f6', border: '#3b82f640' },
  pending:   { bg: '#8b5cf620', text: '#8b5cf6', border: '#8b5cf640' },
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: trainees }, { data: wonLeads }, { data: pendingInvites }] = await Promise.all([
    supabase
      .from('trainees')
      .select('*, profiles(full_name, email)')
      .eq('trainer_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('leads')
      .select('*')
      .eq('trainer_id', user!.id)
      .eq('stage', 'won')
      .order('created_at', { ascending: false }),
    supabase
      .from('trainer_invites')
      .select('id, token, email, full_name, created_at, used_at, lead_id')
      .eq('trainer_id', user!.id)
      .is('used_at', null)
      .order('created_at', { ascending: false }),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fitcoach-ai-beryl.vercel.app'
  // Map lead_id → invite for quick lookup
  const inviteByLead = Object.fromEntries((pendingInvites ?? []).map(i => [i.lead_id, i]))

  const activeCount   = (trainees ?? []).filter(t => t.status === 'active').length
  const pausedCount   = (trainees ?? []).filter(t => t.status === 'paused').length
  const pendingCount  = (wonLeads ?? []).length
  const totalCount    = (trainees ?? []).length + pendingCount

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Clients</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
          {totalCount} total &nbsp;·&nbsp;
          <span style={{ color: '#10b981' }}>{activeCount} active</span> &nbsp;·&nbsp;
          <span style={{ color: '#f59e0b' }}>{pausedCount} paused</span>
          {pendingCount > 0 && <>&nbsp;·&nbsp;<span style={{ color: '#8b5cf6' }}>{pendingCount} pending invite</span></>}
        </p>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Active', value: activeCount, color: '#10b981' },
          { label: 'Paused', value: pausedCount, color: '#f59e0b' },
          { label: 'Pending invite', value: pendingCount, color: '#8b5cf6' },
          { label: 'Total', value: totalCount, color: '#FACC15' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: 14, padding: '18px 22px',
          }}>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px', fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 30, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {totalCount === 0 && (
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
          padding: 56, textAlign: 'center',
        }}>
          <p style={{ color: '#4b5563', fontSize: 15, margin: 0 }}>
            No clients yet. Mark a lead as <strong style={{ color: '#10b981' }}>Won</strong> in your pipeline to add them here.
          </p>
        </div>
      )}

      {/* Won leads — pending platform invite */}
      {(wonLeads ?? []).length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: '#6b7280', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
            Pending signup — share invite link
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {wonLeads!.map(lead => {
              const invite = inviteByLead[lead.id]
              const inviteUrl = invite ? `${appUrl}/join/${invite.token}` : null
              return (
                <div key={lead.id} style={{
                  background: '#1a1a1a', border: '1px solid #8b5cf630', borderRadius: 14,
                  padding: '18px 22px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: inviteUrl ? 14 : 0 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: '#8b5cf620', border: '2px solid #8b5cf640',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#8b5cf6', fontWeight: 800, fontSize: 16, flexShrink: 0,
                    }}>
                      {(lead.full_name ?? '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>{lead.full_name}</p>
                      {lead.email && <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>{lead.email}</p>}
                      {lead.goals && <p style={{ color: '#4b5563', fontSize: 12, margin: '3px 0 0' }}>Goal: {lead.goals}</p>}
                    </div>
                    <span style={{
                      background: '#8b5cf620', color: '#8b5cf6', border: '1px solid #8b5cf640',
                      borderRadius: 99, padding: '3px 12px', fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>Awaiting signup</span>
                  </div>

                  {inviteUrl && (
                    <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                        {inviteUrl}
                      </p>
                      <CopyInviteButton url={inviteUrl} />
                    </div>
                  )}

                  {!inviteUrl && (
                    <p style={{ fontSize: 12, color: '#4b5563', margin: '8px 0 0' }}>
                      No invite link yet — mark this lead as Won from the pipeline to generate one.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Active trainees */}
      {(trainees ?? []).length > 0 && (
        <div>
          <h2 style={{ color: '#6b7280', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
            Platform clients
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trainees!.map(trainee => {
              const profile = (trainee as any).profiles
              const sc = STATUS_COLORS[trainee.status] ?? STATUS_COLORS.inactive
              return (
                <div key={trainee.id} style={{
                  background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14,
                  padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18,
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: '#FACC1520', border: '2px solid #FACC1540',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FACC15', fontWeight: 800, fontSize: 16, flexShrink: 0,
                  }}>
                    {(profile?.full_name ?? '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>
                      {profile?.full_name ?? 'Unknown'}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>{profile?.email ?? ''}</p>
                    {trainee.goals && (
                      <p style={{ color: '#4b5563', fontSize: 12, margin: '3px 0 0' }}>Goal: {trainee.goals}</p>
                    )}
                  </div>
                  <span style={{
                    background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                    borderRadius: 99, padding: '3px 12px', fontSize: 12, fontWeight: 700,
                    textTransform: 'capitalize',
                  }}>{trainee.status}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link href={`/trainer/clients/${trainee.id}/nutrition`} style={{
                      background: '#FACC1510', color: '#FACC15', border: '1px solid #FACC1530',
                      borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                    }}>Nutrition</Link>
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
        </div>
      )}
    </div>
  )
}
