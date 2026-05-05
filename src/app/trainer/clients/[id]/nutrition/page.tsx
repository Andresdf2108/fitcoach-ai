import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Flame, Beef, Wheat, Droplets, Leaf } from 'lucide-react'

interface NutritionLog {
  id: string
  meal_type: string
  food_description: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  ai_notes: string
  logged_at: string
}

const MEAL_LABELS: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }

function MacroChip({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 18, fontWeight: 800, color, margin: 0 }}>{Math.round(value)}</p>
      <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{unit}</p>
      <p style={{ fontSize: 10, color: '#4b5563', margin: 0 }}>{label}</p>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ClientNutritionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Verify this trainee belongs to the trainer
  const { data: trainee } = await supabase
    .from('trainees')
    .select('id, profiles(full_name, email)')
    .eq('id', id)
    .eq('trainer_id', user!.id)
    .single()

  if (!trainee) notFound()

  const { data: logs } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('trainee_id', id)
    .order('logged_at', { ascending: false })
    .limit(50)

  const allLogs: NutritionLog[] = logs ?? []

  // Today's totals
  const today = new Date().toISOString().split('T')[0]
  const todayLogs = allLogs.filter(l => l.logged_at.startsWith(today))
  const todayCalories = todayLogs.reduce((s, l) => s + (l.calories ?? 0), 0)
  const todayProtein = todayLogs.reduce((s, l) => s + (l.protein_g ?? 0), 0)
  const todayCarbs = todayLogs.reduce((s, l) => s + (l.carbs_g ?? 0), 0)
  const todayFat = todayLogs.reduce((s, l) => s + (l.fat_g ?? 0), 0)

  // 7-day avg calories
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const weekLogs = allLogs.filter(l => l.logged_at >= sevenDaysAgo)
  const days = new Set(weekLogs.map(l => l.logged_at.split('T')[0])).size
  const avgCalories = days > 0 ? Math.round(weekLogs.reduce((s, l) => s + (l.calories ?? 0), 0) / days) : 0

  const clientName = (trainee as any).profiles?.full_name ?? 'Client'

  const s = {
    card: { background: '#111', border: '1px solid #222', borderRadius: 16 },
    label: { fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
  }

  return (
    <div style={{ padding: '40px 40px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/trainer/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', marginBottom: 16 }}>
          <ArrowLeft size={13} /> Back to Clients
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{clientName} — Nutrition Log</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>{allLogs.length} meal{allLogs.length !== 1 ? 's' : ''} logged total</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: "Today's calories", value: todayCalories > 0 ? `${todayCalories} kcal` : '—', color: '#FACC15' },
          { label: '7-day avg calories', value: avgCalories > 0 ? `${avgCalories} kcal/day` : '—', color: '#a78bfa' },
          { label: 'Meals logged today', value: String(todayLogs.length), color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} style={{ ...s.card, padding: '18px 22px' }}>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px', fontWeight: 500 }}>{stat.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Today's macros */}
      {todayLogs.length > 0 && (
        <div style={{ ...s.card, padding: '20px 24px', marginBottom: 24 }}>
          <p style={{ ...s.label, marginBottom: 16 }}>Today&apos;s macros</p>
          <div style={{ display: 'flex', gap: 32 }}>
            <MacroChip label="Calories" value={todayCalories} unit="kcal" color="#FACC15" />
            <MacroChip label="Protein" value={todayProtein} unit="g" color="#f87171" />
            <MacroChip label="Carbs" value={todayCarbs} unit="g" color="#fb923c" />
            <MacroChip label="Fat" value={todayFat} unit="g" color="#60a5fa" />
          </div>
        </div>
      )}

      {/* Meal log */}
      <p style={{ ...s.label, marginBottom: 14 }}>Full log</p>
      {allLogs.length === 0 ? (
        <div style={{ ...s.card, padding: 48, textAlign: 'center' }}>
          <p style={{ color: '#4b5563', fontSize: 14, margin: 0 }}>
            {clientName} hasn&apos;t logged any meals yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allLogs.map(log => (
            <div key={log.id} style={{ ...s.card, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#FACC15', background: 'rgba(250,204,21,0.1)', padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {MEAL_LABELS[log.meal_type] ?? log.meal_type}
                    </span>
                    <span style={{ fontSize: 11, color: '#4b5563' }}>{formatDate(log.logged_at)}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#e5e5e5', margin: '0 0 8px', fontWeight: 500 }}>{log.food_description}</p>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 12, color: '#FACC15', fontWeight: 700 }}><Flame size={10} style={{ display: 'inline', marginRight: 3 }} />{log.calories} kcal</span>
                    <span style={{ fontSize: 12, color: '#f87171' }}><Beef size={10} style={{ display: 'inline', marginRight: 3 }} />{log.protein_g}g protein</span>
                    <span style={{ fontSize: 12, color: '#fb923c' }}><Wheat size={10} style={{ display: 'inline', marginRight: 3 }} />{log.carbs_g}g carbs</span>
                    <span style={{ fontSize: 12, color: '#60a5fa' }}><Droplets size={10} style={{ display: 'inline', marginRight: 3 }} />{log.fat_g}g fat</span>
                    <span style={{ fontSize: 12, color: '#4ade80' }}><Leaf size={10} style={{ display: 'inline', marginRight: 3 }} />{log.fiber_g}g fiber</span>
                  </div>
                  {log.ai_notes && <p style={{ fontSize: 11, color: '#4b5563', margin: '6px 0 0', fontStyle: 'italic' }}>{log.ai_notes}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
