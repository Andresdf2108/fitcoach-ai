'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bookSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify this trainee has a trainer
  const { data: trainee } = await supabase
    .from('trainees')
    .select('trainer_id')
    .eq('id', user.id)
    .single()

  if (!trainee?.trainer_id) return

  // Slot is combined "YYYY-MM-DD|HH:MM" — split server-side (no client JS needed)
  const slot = formData.get('slot') as string
  if (!slot || !slot.includes('|')) return

  const [sessionDate, sessionTime] = slot.split('|')

  await supabase.from('sessions').insert({
    trainer_id: trainee.trainer_id,
    trainee_id: user.id,
    title: 'Training Session',
    session_date: sessionDate,
    session_time: sessionTime,
    duration_minutes: 45,
    status: 'scheduled',
    booked_by: 'trainee',
  })

  revalidatePath('/trainee/sessions')
}

export async function cancelSession(id: string) {
  const supabase = await createClient()
  await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', id)
  revalidatePath('/trainee/sessions')
}

export async function logWorkout(exerciseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('trainee_id', user.id)
    .eq('exercise_id', exerciseId)
    .single()

  if (existing) {
    await supabase.from('workout_logs').delete().eq('id', existing.id)
  } else {
    await supabase.from('workout_logs').insert({
      trainee_id: user.id,
      exercise_id: exerciseId,
      completed_at: new Date().toISOString(),
    })
  }

  revalidatePath('/trainee/workouts')
}
