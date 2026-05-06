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

// Cheap in-memory IP rate limit for the anonymous endpoint.
// Public surface — without this, anyone can rack up Anthropic costs.
// Authed callers (signed-in trainees) skip the limit.
const HOUR_MS = 60 * 60 * 1000
const ANON_LIMIT_PER_HOUR = 5
const hits = new Map<string, number[]>()

function tooManyAnonHits(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter(t => now - t < HOUR_MS)
  if (arr.length >= ANON_LIMIT_PER_HOUR) {
    hits.set(ip, arr)
    return true
  }
  arr.push(now)
  hits.set(ip, arr)
  return false
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
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

  // Clamp scores to the schema range — defensive against client tampering
  const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n)))
  body.mood_score = clamp(body.mood_score)
  body.energy_score = clamp(body.energy_score)
  body.focus_score = clamp(body.focus_score)

  // Cap free-text fields so the prompt can't be ballooned by an attacker
  const cap = (s: string | undefined) => (typeof s === 'string' ? s.slice(0, 500) : undefined)
  body.win_today = cap(body.win_today)
  body.challenge_today = cap(body.challenge_today)
  body.intention = cap(body.intention)

  // Resolve auth once; anon callers face a per-IP rate limit
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && tooManyAnonHits(getIp(req))) {
    return NextResponse.json(
      { error: 'Too many free reflections in the last hour. Try again later or sign up to keep going.' },
      { status: 429 },
    )
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
