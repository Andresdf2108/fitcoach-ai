import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

type Body = {
  mood_score: number
  energy_score: number
  focus_score: number
  win_today?: string
  challenge_today?: string
  intention?: string
  visitor_id?: string
}

function buildPrompt(b: Body) {
  return `You are a thoughtful, evidence-informed mindset coach for a fitness client. They have just completed a daily mindset check-in:

- Mood: ${b.mood_score}/10
- Energy: ${b.energy_score}/10
- Focus: ${b.focus_score}/10
${b.win_today ? `- Today's win: "${b.win_today}"` : ''}
${b.challenge_today ? `- Today's challenge: "${b.challenge_today}"` : ''}
${b.intention ? `- Their intention: "${b.intention}"` : ''}

Write a short reflection (3–4 sentences, max 120 words) that:
1. Acknowledges what they shared without judgement
2. Names one specific psychological pattern or strength you notice
3. Offers one concrete, low-friction action for the next 24 hours

Be warm but not saccharine. Avoid clichés like "you've got this." Speak in second person. Do not list the scores back to them — they already know them.`
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body

  if (
    typeof body.mood_score !== 'number' ||
    typeof body.energy_score !== 'number' ||
    typeof body.focus_score !== 'number'
  ) {
    return NextResponse.json({ error: 'mood_score, energy_score, focus_score required' }, { status: 400 })
  }

  let reflection = ''
  try {
    const { text } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      prompt: buildPrompt(body),
    })
    reflection = text.trim()
  } catch (e) {
    console.error('Mindset reflect error:', e)
    return NextResponse.json({ error: 'AI temporarily unavailable' }, { status: 503 })
  }

  // Persist: authed → mindset_checkins, anonymous → public_mindset_checkins
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: trainee } = await supabase.from('trainees').select('id').eq('id', user.id).single()
    if (trainee) {
      await supabase.from('mindset_checkins').insert({
        trainee_id: user.id,
        mood_score: body.mood_score,
        energy_score: body.energy_score,
        focus_score: body.focus_score,
        win_today: body.win_today ?? null,
        challenge_today: body.challenge_today ?? null,
        intention: body.intention ?? null,
        ai_reflection: reflection,
      })
    }
  } else {
    await supabase.from('public_mindset_checkins').insert({
      mood_score: body.mood_score,
      energy_score: body.energy_score,
      focus_score: body.focus_score,
      free_text: [body.win_today, body.challenge_today, body.intention].filter(Boolean).join(' | ') || null,
      ai_reflection: reflection,
      visitor_id: body.visitor_id ?? null,
    })
  }

  return NextResponse.json({ reflection })
}
