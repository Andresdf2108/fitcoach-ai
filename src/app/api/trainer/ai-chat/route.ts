import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ reply: 'AI features require an ANTHROPIC_API_KEY. Please add it to your environment variables.' }, { status: 200 })
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are an expert fitness coaching assistant helping a personal trainer.
You help with:
- Creating workout programs and training plans
- Writing client communications (check-ins, motivation, proposals)
- Business advice (client retention, pricing, marketing)
- Exercise science questions
- Nutrition guidance

Keep responses concise, practical, and actionable. Use bullet points where helpful.`,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Anthropic API error:', err)
    return NextResponse.json({ reply: 'AI is temporarily unavailable. Please try again.' }, { status: 200 })
  }

  const data = await res.json()
  const reply = data.content?.[0]?.text ?? 'No response.'
  return NextResponse.json({ reply })
}
