import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const inviteToken = searchParams.get('invite_token')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    if (inviteToken) {
      const { data: invite } = await supabase
        .from('trainer_invites')
        .select('id, trainer_id, used_at, expires_at')
        .eq('token', inviteToken)
        .single()

      if (invite && !invite.used_at && new Date(invite.expires_at) >= new Date()) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('trainees').upsert({
            id: user.id,
            trainer_id: invite.trainer_id,
            status: 'onboarding',
          })
          await supabase
            .from('trainer_invites')
            .update({ used_at: new Date().toISOString() })
            .eq('id', invite.id)
          return NextResponse.redirect(`${origin}/onboarding/trainee?skip_account=1`)
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/redirect`)
}
