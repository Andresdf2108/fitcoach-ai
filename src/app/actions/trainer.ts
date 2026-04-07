'use server'

import { createClient } from '@/lib/supabase/server'
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
  await supabase.from('leads').update({ stage }).eq('id', id)
  revalidatePath('/trainer/leads')
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
