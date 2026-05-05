import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { copyTemplate, assignProgram } from '@/app/actions/trainer'
import Link from 'next/link'

async function createProgram(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('programs').insert({
    trainer_id: user.id,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    duration_weeks: Number(formData.get('duration_weeks')) || null,
    level: formData.get('level') as string || null,
    status: 'active',
  })
  revalidatePath('/trainer/programs')
}

async function archiveProgram(id: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('programs').update({ status: 'archived' }).eq('id', id)
  revalidatePath('/trainer/programs')
}

async function activateProgram(id: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('programs').update({ status: 'active' }).eq('id', id)
  revalidatePath('/trainer/programs')
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
}

const CATEGORY_LABELS: Record<string, string> = {
  weight_loss:    'Weight Loss',
  strength:       'Strength',
  performance:    'Performance',
  mobility:       'Mobility',
  recomp:         'Body Recomp',
  endurance:      'Endurance',
  muscle_building:'Muscle Building',
  core:           'Core & Stability',
  prenatal:       'Prenatal',
  longevity:      'Active Aging',
}

const CATEGORY_COLORS: Record<string, string> = {
  weight_loss:    '#ef4444',
  strength:       '#f59e0b',
  performance:    '#3b82f6',
  mobility:       '#8b5cf6',
  recomp:         '#10b981',
  endurance:      '#06b6d4',
  muscle_building:'#f97316',
  core:           '#84cc16',
  prenatal:       '#ec4899',
  longevity:      '#a78bfa',
}

const inputStyle = {
  background: '#111', border: '1px solid #2a2a2a', borderRadius: 8,
  padding: '9px 13px', color: '#fff', fontSize: 13, outline: 'none',
  width: '100%', boxSizing: 'border-box' as const,
}

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: programs },
    { data: templates },
    { data: assignments },
    { data: trainees },
  ] = await Promise.all([
    supabase.from('programs').select('*').eq('trainer_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('program_templates').select('*').order('level'),
    supabase.from('program_assignments').select('program_id, trainee_id').eq('trainer_id', user!.id).eq('status', 'active'),
    supabase.from('trainees').select('id, profiles(full_name)').eq('trainer_id', user!.id).eq('status', 'active'),
  ])

  // Build assignment count per program
  const assignmentCounts = (assignments ?? []).reduce<Record<string, number>>((acc, a) => {
    acc[a.program_id] = (acc[a.program_id] ?? 0) + 1
    return acc
  }, {})

  const active   = (programs ?? []).filter(p => p.status === 'active')
  const drafts   = (programs ?? []).filter(p => p.status === 'draft')
  const archived = (programs ?? []).filter(p => p.status === 'archived')

  return (
    <div style={{ padding: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Programs</h1>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
            {active.length} active · {drafts.length} draft
          </p>
        </div>

        <details style={{ position: 'relative' }}>
          <summary style={{
            background: '#FACC15', color: '#000', fontWeight: 700, fontSize: 14,
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer', listStyle: 'none',
          }}>
            + New Program
          </summary>
          <div style={{
            position: 'absolute', right: 0, top: 48, zIndex: 10,
            background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
            padding: 24, width: 360,
          }}>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Custom Program</h3>
            <form action={createProgram} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input name="name" placeholder="Program name" required style={inputStyle} />
              <textarea name="description" placeholder="Description (optional)" rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input name="duration_weeks" type="number" placeholder="Weeks" min={1} style={inputStyle} />
                <select name="level" style={inputStyle}>
                  <option value="">Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <button type="submit" style={{
                background: '#FACC15', color: '#000', fontWeight: 700,
                border: 'none', borderRadius: 8, padding: '10px 0',
                fontSize: 14, cursor: 'pointer',
              }}>Create Program</button>
            </form>
          </div>
        </details>
      </div>

      {/* My Programs */}
      {active.length > 0 && (
        <ProgramGroup
          title="Active" programs={active}
          archive={archiveProgram}
          assignProgram={assignProgram}
          assignmentCounts={assignmentCounts}
          trainees={trainees ?? []}
        />
      )}
      {drafts.length > 0 && (
        <ProgramGroup
          title="Drafts" programs={drafts}
          activate={activateProgram} archive={archiveProgram}
          assignmentCounts={assignmentCounts}
          trainees={trainees ?? []}
        />
      )}
      {archived.length > 0 && (
        <ProgramGroup
          title="Archived" programs={archived}
          activate={activateProgram}
          assignmentCounts={assignmentCounts}
          trainees={[]}
          faded
        />
      )}

      {/* Template Library */}
      <div style={{ marginTop: programs && programs.length > 0 ? 44 : 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Program Library</h2>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
              {templates?.length ?? 0} ready-to-use programs · Click <strong style={{ color: '#FACC15' }}>Use Template</strong> to add a copy.
            </p>
          </div>
        </div>
        {(!templates || templates.length === 0) && (
          <div style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14,
            padding: 28, textAlign: 'center',
          }}>
            <p style={{ color: '#4b5563', fontSize: 14, margin: 0 }}>
              Templates not loaded. Run migrations 005 and 006 in Supabase SQL Editor to load all programs.
            </p>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {(templates ?? []).map(tpl => {
            const levelColor = LEVEL_COLORS[tpl.level] ?? '#6b7280'
            const catColor = CATEGORY_COLORS[tpl.category] ?? '#FACC15'
            return (
              <div key={tpl.id} style={{
                background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14,
                padding: 22, display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, paddingRight: 10 }}>
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>{tpl.name}</h3>
                    {tpl.category && (
                      <span style={{
                        background: `${catColor}15`, color: catColor,
                        border: `1px solid ${catColor}30`,
                        borderRadius: 99, padding: '2px 9px', fontSize: 11, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 0.4,
                      }}>
                        {CATEGORY_LABELS[tpl.category] ?? tpl.category}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {tpl.level && (
                      <span style={{
                        background: `${levelColor}20`, color: levelColor,
                        border: `1px solid ${levelColor}40`,
                        borderRadius: 99, padding: '2px 9px', fontSize: 11, fontWeight: 700,
                        textTransform: 'capitalize',
                      }}>{tpl.level}</span>
                    )}
                    {tpl.duration_weeks && (
                      <span style={{
                        background: '#2a2a2a', color: '#9ca3af',
                        borderRadius: 99, padding: '2px 9px', fontSize: 11, fontWeight: 600,
                      }}>{tpl.duration_weeks}w</span>
                    )}
                  </div>
                </div>
                {tpl.description && (
                  <p style={{ color: '#6b7280', fontSize: 13, margin: '8px 0 14px', lineHeight: 1.55, flex: 1 }}>
                    {tpl.description}
                  </p>
                )}
                <form action={copyTemplate.bind(null, tpl.id)}>
                  <button type="submit" style={{
                    background: '#FACC1510', color: '#FACC15', border: '1px solid #FACC1530',
                    borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', width: '100%',
                  }}>
                    Use Template
                  </button>
                </form>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ProgramGroup({ title, programs, activate, archive, assignProgram: assignFn, assignmentCounts, trainees, faded }: {
  title: string
  programs: any[]
  activate?: (id: string) => Promise<void>
  archive?: (id: string) => Promise<void>
  assignProgram?: typeof assignProgram
  assignmentCounts: Record<string, number>
  trainees: any[]
  faded?: boolean
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{
        color: faded ? '#4b5563' : '#9ca3af',
        fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: 1, margin: '0 0 12px',
      }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {programs.map(p => {
          const assignCount = assignmentCounts[p.id] ?? 0
          return (
            <div key={p.id} style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14,
              padding: 20, opacity: faded ? 0.5 : 1,
              display: 'flex', flexDirection: 'column',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1.4, flex: 1 }}>{p.name}</h3>
                {p.level && (
                  <span style={{
                    background: `${LEVEL_COLORS[p.level] ?? '#6b7280'}20`,
                    color: LEVEL_COLORS[p.level] ?? '#6b7280',
                    border: `1px solid ${LEVEL_COLORS[p.level] ?? '#6b7280'}40`,
                    borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                    textTransform: 'capitalize', flexShrink: 0, marginLeft: 8,
                  }}>{p.level}</span>
                )}
              </div>
              {p.description && (
                <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 8px', lineHeight: 1.5 }}>{p.description}</p>
              )}
              {p.duration_weeks && (
                <p style={{ color: '#4b5563', fontSize: 12, margin: '0 0 12px' }}>
                  {p.duration_weeks} week{p.duration_weeks !== 1 ? 's' : ''}
                </p>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                {/* Build program content */}
                {!faded && (
                  <Link href={`/trainer/programs/${p.id}`} style={{
                    background: '#FACC1515', color: '#FACC15', border: '1px solid #FACC1530',
                    borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700,
                    textDecoration: 'none', display: 'inline-block',
                  }}>Build ›</Link>
                )}
                {activate && (
                  <form action={activate.bind(null, p.id)}>
                    <button type="submit" style={{
                      background: '#10b98120', color: '#10b981', border: '1px solid #10b98140',
                      borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}>Activate</button>
                  </form>
                )}
                {archive && (
                  <form action={archive.bind(null, p.id)}>
                    <button type="submit" style={{
                      background: '#6b728020', color: '#6b7280', border: '1px solid #6b728040',
                      borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}>Archive</button>
                  </form>
                )}
                {/* Assign to Client dropdown — only for active programs with trainees */}
                {assignFn && trainees.length > 0 && (
                  <details style={{ position: 'relative' }}>
                    <summary style={{
                      background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640',
                      borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', listStyle: 'none',
                    }}>
                      Assign {assignCount > 0 ? `(${assignCount})` : ''}
                    </summary>
                    <div style={{
                      position: 'absolute', left: 0, top: 34, zIndex: 20,
                      background: '#1f1f1f', border: '1px solid #333',
                      borderRadius: 10, padding: 14, minWidth: 220,
                    }}>
                      <p style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Assign to Client
                      </p>
                      <form action={assignFn.bind(null, p.id)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <select name="trainee_id" required style={inputStyle}>
                          <option value="">Select client</option>
                          {trainees.map((t: any) => (
                            <option key={t.id} value={t.id}>
                              {t.profiles?.full_name ?? 'Client'}
                            </option>
                          ))}
                        </select>
                        <button type="submit" style={{
                          background: '#3b82f6', color: '#fff', fontWeight: 700,
                          border: 'none', borderRadius: 6, padding: '7px 0',
                          fontSize: 12, cursor: 'pointer',
                        }}>Assign Program</button>
                      </form>
                    </div>
                  </details>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
