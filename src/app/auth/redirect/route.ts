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

  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const destination = ROLE_DESTINATIONS[profile?.role ?? 'trainee'] ?? '/trainee/dashboard'
  return NextResponse.redirect(`${origin}${destination}`)
}
