import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ROLE_DESTINATIONS: Record<string, string> = {
  admin: '/admin/dashboard',
  trainer: '/trainer/dashboard',
  trainee: '/trainee/dashboard',
}

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarded')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'trainee'

  // New users (no profile yet, or not onboarded) go to wizard
  if (!profile || (!profile.onboarded && role !== 'admin')) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}${ROLE_DESTINATIONS[role] ?? '/trainee/dashboard'}`)
}
