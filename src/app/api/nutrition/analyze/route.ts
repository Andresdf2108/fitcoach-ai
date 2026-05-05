import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

const PROMPT = `You are a nutrition expert. Analyze this food photo and estimate the nutritional content.
Respond ONLY with a valid JSON object — no extra text, no markdown fences — in exactly this shape:
{
  "description": "concise description of what you see, e.g. 'Grilled chicken breast with white rice and steamed broccoli'",
  "calories": <integer>,
  "protein_g": <number with 1 decimal>,
  "carbs_g": <number with 1 decimal>,
  "fat_g": <number with 1 decimal>,
  "fiber_g": <number with 1 decimal>,
  "notes": "brief note on portion size assumptions, e.g. 'Estimated 200g chicken, 150g rice'"
}
If the image is not food, set all numbers to 0 and explain in notes.`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { imageBase64, mediaType, mealType } = await req.json()
  if (!imageBase64) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  const { text } = await generateText({
    model: 'anthropic/claude-sonnet-4.6',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', image: imageBase64, mediaType: mediaType ?? 'image/jpeg' },
        { type: 'text', text: PROMPT },
      ],
    }],
  })

  let analysis: {
    description: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g: number
    notes: string
  }

  try {
    const match = text.match(/\{[\s\S]*\}/)
    analysis = JSON.parse(match![0])
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  const { data, error } = await supabase.from('nutrition_logs').insert({
    trainee_id: user.id,
    meal_type: mealType ?? 'snack',
    food_description: analysis.description,
    calories: analysis.calories,
    protein_g: analysis.protein_g,
    carbs_g: analysis.carbs_g,
    fat_g: analysis.fat_g,
    fiber_g: analysis.fiber_g,
    ai_notes: analysis.notes,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
