import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      reply: 'AI features require an ANTHROPIC_API_KEY. Add it to your Vercel environment variables and redeploy.',
    }, { status: 200 })
  }

  // Fetch trainer context to personalise the system prompt
  let trainerContext = ''
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const [{ data: trainer }, { count: clientCount }, { count: pendingCheckins }] = await Promise.all([
        supabase
          .from('trainers')
          .select('bio, specializations, subscription_plans(name)')
          .eq('id', user.id)
          .single(),
        supabase
          .from('trainees')
          .select('*', { count: 'exact', head: true })
          .eq('trainer_id', user.id)
          .eq('status', 'active'),
        supabase
          .from('checkins')
          .select('*', { count: 'exact', head: true })
          .eq('trainer_id', user.id)
          .eq('reviewed', false),
      ])

      const specializations: string[] = (trainer as any)?.specializations ?? []
      const planName: string = (trainer as any)?.subscription_plans?.name ?? 'free'

      const parts = [
        `This trainer currently has ${clientCount ?? 0} active clients.`,
        specializations.length > 0
          ? `Their coaching specializations are: ${specializations.join(', ')}.`
          : 'They have not yet set their specializations.',
        `They are on the ${planName} plan.`,
        (pendingCheckins ?? 0) > 0
          ? `They have ${pendingCheckins} pending client check-ins awaiting review.`
          : '',
        (trainer as any)?.bio
          ? `Their bio: "${(trainer as any).bio}"`
          : '',
      ].filter(Boolean)

      if (parts.length > 0) {
        trainerContext = parts.join(' ')
      }
    }
  } catch {
    // Non-blocking — proceed without context if DB is unavailable
  }

  const systemPrompt = `You are an expert fitness coaching assistant helping a personal trainer manage their business and clients on FitCoach AI.
${trainerContext ? `\nContext about this trainer: ${trainerContext}\n` : ''}
You help with:
- Creating and structuring workout programs (F45-style circuits, progressive overload, periodization)
- Writing personalised client communications (motivational check-ins, progress summaries, proposals)
- Business and retention strategy (client acquisition, pricing, reducing churn)
- Exercise science: programming, movement patterns, energy systems
- Nutrition guidance aligned with client goals

Keep responses concise, practical, and directly actionable. Use bullet points and structure where it aids clarity. Reference the trainer's actual context (client count, specializations) when relevant.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)

  let res: Response
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
      signal: controller.signal,
    })
  } catch (e: any) {
    clearTimeout(timeout)
    if (e?.name === 'AbortError') {
      return NextResponse.json({ reply: 'The request timed out. Please try again.' }, { status: 200 })
    }
    return NextResponse.json({ reply: 'AI is temporarily unavailable. Please try again.' }, { status: 200 })
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    const err = await res.text()
    console.error('Anthropic API error:', err)
    return NextResponse.json({ reply: 'AI is temporarily unavailable. Please try again.' }, { status: 200 })
  }

  const data = await res.json()
  const reply = data.content?.[0]?.text ?? 'No response.'
  return NextResponse.json({ reply })
}
