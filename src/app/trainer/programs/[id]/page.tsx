import { createClient } from '@/lib/supabase/server'
import { copyWeek } from '@/app/actions/trainer'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import DayGridClient from './DayGridClient'

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
}

export default async function ProgramBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ week?: string }>
}) {
  const { id } = await params
  const { week } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .eq('trainer_id', user!.id)
    .single()

  if (!program) {
    return (
      <div style={{ padding: 40 }}>
        <Link href="/trainer/programs" style={{ color: '#FACC15', textDecoration: 'none', fontSize: 13 }}>
          ← Back to Programs
        </Link>
        <p style={{ color: '#52525b', marginTop: 24 }}>Program not found.</p>
      </div>
    )
  }

  // Exercises (graceful fallback if migration 007 hasn't run)
  let exercises: any[] = []
  try {
    const { data } = await supabase
      .from('program_exercises')
      .select('*')
      .eq('program_id', id)
      .order('day_number')
      .order('order_index')
    exercises = data ?? []
  } catch {
    // table not yet created
  }

  // Enrollments + all active trainees for this trainer
  const [{ data: enrollmentsRaw }, { data: allTraineesRaw }] = await Promise.all([
    supabase
      .from('program_assignments')
      .select('id, trainee_id, start_date, profiles!trainee_id(full_name)')
      .eq('program_id', id)
      .eq('status', 'active'),
    supabase
      .from('trainees')
      .select('id, profiles(full_name)')
      .eq('trainer_id', user!.id)
      .eq('status', 'active'),
  ])
  const enrollments = (enrollmentsRaw ?? []) as any[]
  const allTrainees = (allTraineesRaw ?? []) as any[]
  const enrolledIds = new Set(enrollments.map((e: any) => e.trainee_id))
  const unenrolled = allTrainees.filter((t: any) => !enrolledIds.has(t.id))

  const totalWeeks = program.duration_weeks ?? 1
  const currentWeek = Math.min(Math.max(Number(week) || 1, 1), totalWeeks)

  const weekExercises = exercises.filter(e => e.week_number === currentWeek)
  const byDay: Record<number, any[]> = {}
  for (let d = 1; d <= 7; d++) byDay[d] = weekExercises.filter(e => e.day_number === d)

  const weeksWithContent = new Set(exercises.map(e => e.week_number))
  const totalExCount = exercises.length
  const levelColor = LEVEL_COLORS[program.level] ?? '#6b7280'

  return (
    <div style={{ padding: '32px 40px 80px' }}>

      {/* Back */}
      <Link href="/trainer/programs" style={{
        color: '#52525b', textDecoration: 'none', fontSize: 13,
        display: 'inline-flex', alignItems: 'center', gap: 3, marginBottom: 20,
      }}>
        <ChevronLeft size={14} strokeWidth={2} /> Programs
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
            {program.name}
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {program.level && (
              <span style={{
                background: `${levelColor}20`, color: levelColor,
                border: `1px solid ${levelColor}40`,
                borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
              }}>{program.level}</span>
            )}
            <span style={{ color: '#3f3f46', fontSize: 13 }}>
              {totalWeeks} week{totalWeeks !== 1 ? 's' : ''}
            </span>
            <span style={{ color: '#2a2a2a' }}>·</span>
            <span style={{ color: '#3f3f46', fontSize: 13 }}>
              {totalExCount} exercise{totalExCount !== 1 ? 's' : ''} built
              {weeksWithContent.size > 0 && ` across ${weeksWithContent.size} week${weeksWithContent.size !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* Copy week shortcut */}
        {currentWeek > 1 && weeksWithContent.has(currentWeek - 1) && weekExercises.length === 0 && (
          <form action={copyWeek.bind(null, id, currentWeek - 1, currentWeek)}>
            <button type="submit" style={{
              background: '#1a1a1a', color: '#FACC15', border: '1px solid #FACC1530',
              borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Copy from Week {currentWeek - 1}
            </button>
          </form>
        )}
      </div>

      {/* Week tabs */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => {
          const active = currentWeek === w
          const hasContent = weeksWithContent.has(w)
          return (
            <Link key={w} href={`/trainer/programs/${id}?week=${w}`} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: active ? 700 : 500,
              textDecoration: 'none', flexShrink: 0,
              background: active ? '#FACC15' : '#111',
              color: active ? '#000' : hasContent ? '#a1a1aa' : '#3f3f46',
              border: `1px solid ${active ? '#FACC15' : hasContent ? '#2a2a2a' : '#1a1a1a'}`,
              position: 'relative' as const,
            }}>
              W{w}
              {hasContent && !active && (
                <span style={{
                  position: 'absolute', top: 3, right: 3,
                  width: 5, height: 5, borderRadius: '50%', background: '#FACC15',
                }} />
              )}
            </Link>
          )
        })}
      </div>

      {/* Interactive day grid + trainees sidebar */}
      <DayGridClient
        programId={id}
        currentWeek={currentWeek}
        byDay={byDay}
        enrollments={enrollments}
        unenrolled={unenrolled}
        allTraineesCount={allTrainees.length}
      />

      <p style={{ color: '#252525', fontSize: 12, marginTop: 20, textAlign: 'center' }}>
        Build Week 1 → use "Copy from Week N" to duplicate structure · trainees see their current week automatically
      </p>
    </div>
  )
}
