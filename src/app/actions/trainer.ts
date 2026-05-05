'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// ── Leads ────────────────────────────────────────────────────

export async function createLead(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('leads').insert({
    trainer_id: user.id,
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    source: formData.get('source') as string,
    goals: formData.get('goals') as string,
    stage: 'new',
  })
  revalidatePath('/trainer/leads')
}

export async function updateLeadStage(id: string, stage: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('leads').update({ stage }).eq('id', id)
  revalidatePath('/trainer/leads')

  if (stage === 'won') {
    const { data: lead } = await supabase.from('leads').select('email, full_name').eq('id', id).single()

    // Create invite token
    const { data: invite } = await supabase.from('trainer_invites').insert({
      trainer_id: user.id,
      lead_id: id,
      email: lead?.email ?? null,
      full_name: lead?.full_name ?? null,
    }).select('token').single()

    // Send invite email via Supabase if the lead has an email
    if (lead?.email && invite?.token) {
      const admin = createAdminClient()
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fitcoach-ai-beryl.vercel.app'
      await admin.auth.admin.inviteUserByEmail(lead.email, {
        redirectTo: `${appUrl}/auth/callback?invite_token=${invite.token}`,
        data: { full_name: lead.full_name ?? '', role: 'trainee' },
      })
    }

    revalidatePath('/trainer/clients')
  }
}

export async function acceptInvite(formData: FormData): Promise<{ error?: string }> {
  const token = formData.get('token') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const supabase = await createClient()

  // Validate invite
  const { data: invite } = await supabase
    .from('trainer_invites')
    .select('id, trainer_id, used_at, expires_at')
    .eq('token', token)
    .single()

  if (!invite) return { error: 'Invalid invite link.' }
  if (invite.used_at) return { error: 'This invite has already been used.' }
  if (new Date(invite.expires_at) < new Date()) return { error: 'This invite has expired. Ask your trainer for a new one.' }

  // Create account via admin (no email confirmation)
  const admin = createAdminClient()
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'trainee' },
  })
  if (createError) return { error: createError.message }

  // Sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) return { error: signInError.message }

  // Wait for profile trigger, then link trainee to trainer
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // Poll for profile
    for (let i = 0; i < 8; i++) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
      if (profile) break
      await new Promise(r => setTimeout(r, 600))
    }
    await supabase.from('trainees').upsert({
      id: user.id,
      trainer_id: invite.trainer_id,
      status: 'onboarding',
    })
    // Mark invite used
    await supabase.from('trainer_invites').update({ used_at: new Date().toISOString() }).eq('id', invite.id)
  }

  return {}
}

export async function deleteLead(id: string) {
  const supabase = await createClient()
  await supabase.from('leads').delete().eq('id', id)
  revalidatePath('/trainer/leads')
}

// ── Trainees ─────────────────────────────────────────────────

export async function updateTraineeStatus(id: string, status: string) {
  const supabase = await createClient()
  await supabase.from('trainees').update({ status }).eq('id', id)
  revalidatePath('/trainer/clients')
}

// ── Programs ─────────────────────────────────────────────────

export async function assignProgram(programId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const traineeId = formData.get('trainee_id') as string
  if (!traineeId) return

  const { data: program } = await supabase
    .from('programs')
    .select('duration_weeks')
    .eq('id', programId)
    .single()

  const startDate = new Date().toISOString().split('T')[0]
  let endDate: string | null = null
  if (program?.duration_weeks) {
    const end = new Date()
    end.setDate(end.getDate() + program.duration_weeks * 7)
    endDate = end.toISOString().split('T')[0]
  }

  await supabase.from('program_assignments').upsert({
    program_id: programId,
    trainee_id: traineeId,
    trainer_id: user.id,
    start_date: startDate,
    end_date: endDate,
    status: 'active',
  }, { onConflict: 'program_id,trainee_id' })

  revalidatePath('/trainer/programs')
  revalidatePath(`/trainer/programs/${programId}`)
}

export async function unassignTrainee(assignmentId: string, programId: string) {
  const supabase = await createClient()
  await supabase.from('program_assignments').delete().eq('id', assignmentId)
  revalidatePath(`/trainer/programs/${programId}`)
}

export async function moveExercise(exerciseId: string, newDayNumber: number, programId: string) {
  const supabase = await createClient()
  await supabase.from('program_exercises').update({ day_number: newDayNumber }).eq('id', exerciseId)
  revalidatePath(`/trainer/programs/${programId}`)
}

export async function assignTrainees(programId: string, traineeIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !traineeIds.length) return

  const { data: program } = await supabase
    .from('programs')
    .select('duration_weeks')
    .eq('id', programId)
    .single()

  const startDate = new Date().toISOString().split('T')[0]
  let endDate: string | null = null
  if (program?.duration_weeks) {
    const end = new Date()
    end.setDate(end.getDate() + program.duration_weeks * 7)
    endDate = end.toISOString().split('T')[0]
  }

  const rows = traineeIds.map(traineeId => ({
    program_id: programId,
    trainee_id: traineeId,
    trainer_id: user.id,
    start_date: startDate,
    end_date: endDate,
    status: 'active',
  }))

  await supabase.from('program_assignments').upsert(rows, { onConflict: 'program_id,trainee_id' })
  revalidatePath('/trainer/programs')
  revalidatePath(`/trainer/programs/${programId}`)
}

export async function copyTemplate(templateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: tpl } = await supabase
    .from('program_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (!tpl) return

  await supabase.from('programs').insert({
    trainer_id: user.id,
    name: tpl.name,
    description: tpl.description,
    duration_weeks: tpl.duration_weeks,
    level: tpl.level,
    status: 'draft',
  })
  revalidatePath('/trainer/programs')
}

// ── Sessions ─────────────────────────────────────────────────

export async function createSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const traineeId = formData.get('trainee_id') as string
  await supabase.from('sessions').insert({
    trainer_id: user.id,
    trainee_id: traineeId || null,
    title: formData.get('title') as string || 'Training Session',
    session_date: formData.get('session_date') as string,
    session_time: formData.get('session_time') as string,
    duration_minutes: Number(formData.get('duration_minutes')) || 60,
    notes: formData.get('notes') as string || null,
    status: 'scheduled',
    booked_by: 'trainer',
  })
  revalidatePath('/trainer/calendar')
}

export async function updateSessionStatus(id: string, status: string) {
  const supabase = await createClient()
  await supabase.from('sessions').update({ status }).eq('id', id)
  revalidatePath('/trainer/calendar')
}

export async function deleteSession(id: string) {
  const supabase = await createClient()
  await supabase.from('sessions').delete().eq('id', id)
  revalidatePath('/trainer/calendar')
}

// ── Availability ──────────────────────────────────────────────

export async function addAvailability(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('trainer_availability').insert({
    trainer_id: user.id,
    day_of_week: Number(formData.get('day_of_week')),
    start_time: formData.get('start_time') as string,
    end_time: formData.get('end_time') as string,
  })
  revalidatePath('/trainer/calendar')
}

export async function removeAvailability(id: string) {
  const supabase = await createClient()
  await supabase.from('trainer_availability').delete().eq('id', id)
  revalidatePath('/trainer/calendar')
}

// ── Program Builder ───────────────────────────────────────────

export async function addExercise(programId: string, weekNumber: number, dayNumber: number, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const name = (formData.get('name') as string)?.trim()
  if (!name) return

  const { data: existing } = await supabase
    .from('program_exercises')
    .select('order_index')
    .eq('program_id', programId)
    .eq('week_number', weekNumber)
    .eq('day_number', dayNumber)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  await supabase.from('program_exercises').insert({
    program_id: programId,
    week_number: weekNumber,
    day_number: dayNumber,
    name,
    sets: Number(formData.get('sets')) || null,
    reps: Number(formData.get('reps')) || null,
    duration_minutes: Number(formData.get('duration_minutes')) || null,
    rest_seconds: Number(formData.get('rest_seconds')) || 60,
    notes: (formData.get('notes') as string) || null,
    order_index: nextIndex,
  })

  revalidatePath(`/trainer/programs/${programId}`)
}

export async function removeExercise(exerciseId: string, programId: string) {
  const supabase = await createClient()
  await supabase.from('program_exercises').delete().eq('id', exerciseId)
  revalidatePath(`/trainer/programs/${programId}`)
}

export async function copyWeek(programId: string, fromWeek: number, toWeek: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: exercises } = await supabase
    .from('program_exercises')
    .select('*')
    .eq('program_id', programId)
    .eq('week_number', fromWeek)

  if (!exercises || exercises.length === 0) return

  // Delete existing exercises in target week first
  await supabase
    .from('program_exercises')
    .delete()
    .eq('program_id', programId)
    .eq('week_number', toWeek)

  const copies = exercises.map(({ id: _id, created_at: _c, week_number: _w, ...rest }) => ({
    ...rest,
    program_id: programId,
    week_number: toWeek,
  }))

  await supabase.from('program_exercises').insert(copies)
  revalidatePath(`/trainer/programs/${programId}`)
}

// ── Settings ─────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').update({
    full_name: formData.get('full_name') as string,
  }).eq('id', user.id)

  const specializations = formData.getAll('specializations') as string[]

  await supabase.from('trainers').upsert({
    id: user.id,
    bio: formData.get('bio') as string,
    specializations,
  })

  revalidatePath('/trainer/settings')
  revalidatePath('/trainer/dashboard')
}

// ── Exercise videos ──────────────────────────────────────────

export async function setExerciseVideo(exerciseId: string, videoUrl: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // RLS on program_exercises restricts updates to the trainer's own programs
  await supabase.from('program_exercises').update({
    video_url: videoUrl,
    video_uploaded_at: videoUrl ? new Date().toISOString() : null,
  }).eq('id', exerciseId)

  revalidatePath('/trainer/videos')
}

// Apply a video URL to every program_exercise (across this trainer's programs)
// that shares the given exercise name. A single "Squat" upload then shows up
// everywhere the trainer has programmed a Squat.
export async function setExerciseVideoByName(exerciseName: string, videoUrl: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: programs } = await supabase
    .from('programs')
    .select('id')
    .eq('trainer_id', user.id)

  const programIds = (programs ?? []).map(p => p.id)
  if (programIds.length === 0) return

  await supabase.from('program_exercises').update({
    video_url: videoUrl,
    video_uploaded_at: videoUrl ? new Date().toISOString() : null,
  }).in('program_id', programIds).eq('name', exerciseName)

  revalidatePath('/trainer/videos')
}
