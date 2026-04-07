import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .eq('trainer_id', user!.id)
    .order('created_at', { ascending: false })

  const active = (programs ?? []).filter(p => p.status === 'active')
  const drafts = (programs ?? []).filter(p => p.status === 'draft')
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

        <details>
          <summary style={{
            background: '#FACC15', color: '#000', fontWeight: 700, fontSize: 14,
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer', listStyle: 'none',
          }}>
            + New Program
          </summary>
          <div style={{
            position: 'absolute', right: 40, zIndex: 10,
            background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
            padding: 24, width: 360, marginTop: 8,
          }}>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>New Program</h3>
            <form action={createProgram} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input name="name" placeholder="Program name" required style={{
                background: '#111', border: '1px solid #333', borderRadius: 8,
                padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
              }} />
              <textarea name="description" placeholder="Description (optional)" rows={3} style={{
                background: '#111', border: '1px solid #333', borderRadius: 8,
                padding: '10px 14px', color: '#fff', fontSize: 14, resize: 'vertical',
              }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input name="duration_weeks" type="number" placeholder="Weeks" min={1} style={{
                  background: '#111', border: '1px solid #333', borderRadius: 8,
                  padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
                }} />
                <select name="level" style={{
                  background: '#111', border: '1px solid #333', borderRadius: 8,
                  padding: '10px 14px', color: '#fff', fontSize: 14,
                }}>
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

      {programs?.length === 0 && (
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
          padding: 48, textAlign: 'center',
        }}>
          <p style={{ fontSize: 32, margin: '0 0 12px' }}>📋</p>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
            No programs yet. Create your first training program above.
          </p>
        </div>
      )}

      {/* Active */}
      {active.length > 0 && <ProgramGroup title="Active" programs={active} archive={archiveProgram} />}
      {drafts.length > 0 && <ProgramGroup title="Drafts" programs={drafts} activate={activateProgram} archive={archiveProgram} />}
      {archived.length > 0 && <ProgramGroup title="Archived" programs={archived} activate={activateProgram} faded />}
    </div>
  )
}

function ProgramGroup({ title, programs, activate, archive, faded }: {
  title: string
  programs: any[]
  activate?: (id: string) => Promise<void>
  archive?: (id: string) => Promise<void>
  faded?: boolean
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{
        color: faded ? '#4b5563' : '#9ca3af',
        fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: 1, margin: '0 0 14px',
      }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {programs.map(p => (
          <div key={p.id} style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
            padding: 22, opacity: faded ? 0.6 : 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0, lineHeight: 1.4 }}>{p.name}</h3>
              {p.level && (
                <span style={{
                  background: `${LEVEL_COLORS[p.level]}20`,
                  color: LEVEL_COLORS[p.level],
                  border: `1px solid ${LEVEL_COLORS[p.level]}40`,
                  borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                  textTransform: 'capitalize', flexShrink: 0, marginLeft: 8,
                }}>{p.level}</span>
              )}
            </div>
            {p.description && (
              <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>{p.description}</p>
            )}
            {p.duration_weeks && (
              <p style={{ color: '#4b5563', fontSize: 12, margin: '0 0 14px' }}>
                {p.duration_weeks} week{p.duration_weeks !== 1 ? 's' : ''}
              </p>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {activate && (
                <form action={activate.bind(null, p.id)}>
                  <button type="submit" style={{
                    background: '#10b98120', color: '#10b981', border: '1px solid #10b98140',
                    borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>Activate</button>
                </form>
              )}
              {archive && (
                <form action={archive.bind(null, p.id)}>
                  <button type="submit" style={{
                    background: '#6b728020', color: '#6b7280', border: '1px solid #6b728040',
                    borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>Archive</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
