import { createClient } from '@/lib/supabase/server'
import { Video, CheckCircle2 } from 'lucide-react'
import VideoUploadClient from './VideoUploadClient'

export default async function TrainerVideosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Pull all program_exercises for this trainer's programs.
  // RLS already constrains, but we also filter by program ownership for safety.
  const { data: programs } = await supabase
    .from('programs')
    .select('id, name')
    .eq('trainer_id', user!.id)

  const programIds = (programs ?? []).map(p => p.id)
  const programNameById = new Map((programs ?? []).map(p => [p.id, p.name]))

  const { data: exercises } = programIds.length
    ? await supabase
        .from('program_exercises')
        .select('id, name, program_id, video_url, video_uploaded_at')
        .in('program_id', programIds)
    : { data: [] as Array<{ id: string; name: string; program_id: string; video_url: string | null; video_uploaded_at: string | null }> }

  // Group by exercise name
  type Group = {
    name: string
    rowCount: number
    programs: string[]
    videoUrl: string | null
    uploadedAt: string | null
    sampleId: string
  }
  const groups = new Map<string, Group>()
  for (const ex of exercises ?? []) {
    const g: Group = groups.get(ex.name) ?? {
      name: ex.name,
      rowCount: 0,
      programs: [] as string[],
      videoUrl: ex.video_url,
      uploadedAt: ex.video_uploaded_at,
      sampleId: ex.id,
    }
    g.rowCount += 1
    const pName = programNameById.get(ex.program_id)
    if (pName && !g.programs.includes(pName)) g.programs.push(pName)
    if (ex.video_url && !g.videoUrl) {
      g.videoUrl = ex.video_url
      g.uploadedAt = ex.video_uploaded_at
    }
    groups.set(ex.name, g)
  }

  const sorted = Array.from(groups.values()).sort((a, b) => {
    // Without video first (need attention), then alphabetical
    if (!!a.videoUrl !== !!b.videoUrl) return a.videoUrl ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  const withVideo = sorted.filter(g => g.videoUrl).length

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 11px', borderRadius: 999, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', fontSize: 11, color: '#FACC15', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 12 }}>
          <Video size={12} strokeWidth={2.4} />
          YOUR EXERCISE LIBRARY
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>
          Coach-filmed videos
        </h1>
        <p style={{ color: '#71717a', fontSize: 14, margin: 0, maxWidth: 620, lineHeight: 1.55 }}>
          Upload your own demo for any exercise. Clients see <em>you</em> doing the movement instead of a generic clip — they connect more, they execute better.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 26 }}>
        <Stat label="Unique exercises" value={String(sorted.length)} color="#FACC15" />
        <Stat label="With your video" value={`${withVideo} / ${sorted.length || 0}`} color="#4ade80" />
        <Stat label="Still generic" value={String(sorted.length - withVideo)} color="#f87171" />
      </div>

      {sorted.length === 0 ? (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#71717a', margin: 0 }}>No exercises in your programs yet. Add some in <strong style={{ color: '#fafafa' }}>Programs</strong> first.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(g => (
            <div key={g.name} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, color: '#fafafa', fontWeight: 600 }}>{g.name}</span>
                  {g.videoUrl ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#4ade80', fontWeight: 600 }}>
                      <CheckCircle2 size={11} strokeWidth={2.4} /> Filmed
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>No video</span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>
                  Used in {g.rowCount} place{g.rowCount === 1 ? '' : 's'} · {g.programs.slice(0, 3).join(', ')}{g.programs.length > 3 ? ` +${g.programs.length - 3}` : ''}
                </p>
              </div>
              <VideoUploadClient
                exerciseName={g.name}
                trainerId={user!.id}
                currentVideoUrl={g.videoUrl}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
      <p style={{ fontSize: 11, color: '#71717a', margin: '0 0 6px', fontWeight: 600, letterSpacing: '0.04em' }}>{label.toUpperCase()}</p>
      <p style={{ fontSize: 24, fontWeight: 800, color, margin: 0, letterSpacing: '-0.03em' }}>{value}</p>
    </div>
  )
}
