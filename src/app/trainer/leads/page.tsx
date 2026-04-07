import { createClient } from '@/lib/supabase/server'
import { createLead, updateLeadStage, deleteLead } from '@/app/actions/trainer'

const STAGES = [
  { key: 'new',                label: 'New',             color: '#6b7280' },
  { key: 'attempted_contact',  label: 'Contacted',       color: '#3b82f6' },
  { key: 'qualified',          label: 'Qualified',       color: '#8b5cf6' },
  { key: 'consultation_booked',label: 'Consult Booked',  color: '#f59e0b' },
  { key: 'consultation_done',  label: 'Consult Done',    color: '#EAB308' },
  { key: 'proposal_sent',      label: 'Proposal Sent',   color: '#10b981' },
]
const WON_LOST = [
  { key: 'won',  label: 'Won',  color: '#10b981' },
  { key: 'lost', label: 'Lost', color: '#ef4444' },
]

const SOURCES = ['Instagram', 'Referral', 'Website', 'Facebook', 'Other']

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('trainer_id', user!.id)
    .order('created_at', { ascending: false })

  const byStage = (stage: string) => (leads ?? []).filter(l => l.stage === stage)
  const activeLeads = [...STAGES, ...WON_LOST].flatMap(s => byStage(s.key))

  return (
    <div style={{ padding: 40, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Leads Pipeline</h1>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
            {leads?.length ?? 0} total &nbsp;·&nbsp; {byStage('new').length} new
          </p>
        </div>

        {/* Add Lead form */}
        <details style={{ position: 'relative' }}>
          <summary style={{
            background: '#EAB308', color: '#000', fontWeight: 700, fontSize: 14,
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer', listStyle: 'none',
            userSelect: 'none',
          }}>
            + Add Lead
          </summary>
          <div style={{
            position: 'absolute', right: 0, top: 44, zIndex: 10,
            background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
            padding: 24, width: 360,
          }}>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>New Lead</h3>
            <form action={createLead} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'full_name', placeholder: 'Full name', required: true },
                { name: 'email',     placeholder: 'Email address', type: 'email' },
                { name: 'phone',     placeholder: 'Phone number' },
                { name: 'goals',     placeholder: 'Goals / notes' },
              ].map(f => (
                <input
                  key={f.name}
                  name={f.name}
                  type={f.type ?? 'text'}
                  placeholder={f.placeholder}
                  required={f.required}
                  style={{
                    background: '#111', border: '1px solid #333', borderRadius: 8,
                    padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
                  }}
                />
              ))}
              <select name="source" style={{
                background: '#111', border: '1px solid #333', borderRadius: 8,
                padding: '10px 14px', color: '#fff', fontSize: 14,
              }}>
                <option value="">Source (optional)</option>
                {SOURCES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
              </select>
              <button type="submit" style={{
                background: '#EAB308', color: '#000', fontWeight: 700,
                border: 'none', borderRadius: 8, padding: '10px 0',
                fontSize: 14, cursor: 'pointer', marginTop: 4,
              }}>
                Add Lead
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* Active pipeline */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {STAGES.map(stage => {
            const cards = byStage(stage.key)
            const next = STAGES[STAGES.indexOf(stage) + 1]
            return (
              <div key={stage.key} style={{
                background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 20,
              }}>
                {/* Column header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{stage.label}</span>
                  </div>
                  <span style={{
                    background: '#2a2a2a', color: '#9ca3af', fontSize: 12,
                    fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  }}>{cards.length}</span>
                </div>

                {/* Lead cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cards.length === 0 && (
                    <p style={{ color: '#374151', fontSize: 13, textAlign: 'center', padding: '16px 0', margin: 0 }}>Empty</p>
                  )}
                  {cards.map(lead => (
                    <div key={lead.id} style={{
                      background: '#111', border: '1px solid #222', borderRadius: 12, padding: 14,
                    }}>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>{lead.full_name}</p>
                      {lead.email && <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 2px' }}>{lead.email}</p>}
                      {lead.phone && <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 2px' }}>{lead.phone}</p>}
                      {lead.source && (
                        <span style={{
                          display: 'inline-block', fontSize: 11, color: '#9ca3af',
                          background: '#1f1f1f', border: '1px solid #2a2a2a',
                          padding: '2px 8px', borderRadius: 99, margin: '6px 0',
                          textTransform: 'capitalize',
                        }}>{lead.source}</span>
                      )}
                      {lead.goals && (
                        <p style={{ color: '#4b5563', fontSize: 12, margin: '6px 0 0', lineHeight: 1.5 }}>{lead.goals}</p>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        {next && (
                          <form action={updateLeadStage.bind(null, lead.id, next.key)}>
                            <button type="submit" style={{
                              background: '#EAB30820', color: '#EAB308', border: '1px solid #EAB30840',
                              borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            }}>
                              → {next.label}
                            </button>
                          </form>
                        )}
                        <form action={updateLeadStage.bind(null, lead.id, 'won')}>
                          <button type="submit" style={{
                            background: '#10b98120', color: '#10b981', border: '1px solid #10b98140',
                            borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}>Won</button>
                        </form>
                        <form action={updateLeadStage.bind(null, lead.id, 'lost')}>
                          <button type="submit" style={{
                            background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440',
                            borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}>Lost</button>
                        </form>
                        <form action={deleteLead.bind(null, lead.id)}>
                          <button type="submit" style={{
                            background: 'transparent', color: '#374151', border: '1px solid #2a2a2a',
                            borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                          }}>🗑</button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Won / Lost */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {WON_LOST.map(stage => {
          const cards = byStage(stage.key)
          return (
            <div key={stage.key} style={{
              background: '#1a1a1a', border: `1px solid ${stage.color}30`, borderRadius: 16, padding: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ color: stage.color, fontWeight: 700, fontSize: 14 }}>{stage.label}</span>
                <span style={{
                  background: `${stage.color}20`, color: stage.color,
                  fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                }}>{cards.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cards.length === 0 && (
                  <p style={{ color: '#374151', fontSize: 13, margin: 0 }}>None yet</p>
                )}
                {cards.map(lead => (
                  <div key={lead.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#111', border: '1px solid #222', borderRadius: 10, padding: '10px 14px',
                  }}>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0 }}>{lead.full_name}</p>
                      {lead.email && <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>{lead.email}</p>}
                    </div>
                    <form action={deleteLead.bind(null, lead.id)}>
                      <button type="submit" style={{
                        background: 'transparent', color: '#374151', border: 'none',
                        fontSize: 14, cursor: 'pointer',
                      }}>🗑</button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
