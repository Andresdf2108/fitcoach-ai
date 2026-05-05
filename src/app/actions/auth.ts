'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function createAccount(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })

  if (error) return { error: error.message }
  return {}
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // Email confirmation required — tell user to check inbox
  if (!data.session) {
    redirect(`/signup?confirm=${encodeURIComponent(email)}`)
  }

  // Logged in immediately — go to onboarding
  redirect('/auth/redirect')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/auth/redirect')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const h = await headers()
  const origin = h.get('origin') ?? `https://${h.get('host')}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset`,
  })

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }
  redirect(`/forgot-password?sent=${encodeURIComponent(email)}`)
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  if (!password || password.length < 8) {
    redirect(`/reset?error=${encodeURIComponent('Password must be at least 8 characters')}`)
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect(`/reset?error=${encodeURIComponent(error.message)}`)
  }
  redirect('/auth/redirect')
}
