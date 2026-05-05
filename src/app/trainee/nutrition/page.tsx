'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Upload, Loader2, Flame, Beef, Wheat, Droplets, Leaf, ChevronDown } from 'lucide-react'

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

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
const MEAL_LABELS: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }

function MacroChip({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: number; unit: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, flex: 1, minWidth: 70 }}>
      <div style={{ color }}>{icon}</div>
      <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{Math.round(value)}</span>
      <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 500 }}>{unit}</span>
      <span style={{ fontSize: 10, color: '#4b5563' }}>{label}</span>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function NutritionPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<{ base64: string; mediaType: string } | null>(null)
  const [mealType, setMealType] = useState<string>('snack')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<NutritionLog | null>(null)
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<NutritionLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)

  // Daily totals from today's logs
  const today = new Date().toISOString().split('T')[0]
  const todayLogs = logs.filter(l => l.logged_at.startsWith(today))
  const todayCalories = todayLogs.reduce((s, l) => s + (l.calories ?? 0), 0)
  const todayProtein = todayLogs.reduce((s, l) => s + (l.protein_g ?? 0), 0)
  const todayCarbs = todayLogs.reduce((s, l) => s + (l.carbs_g ?? 0), 0)
  const todayFat = todayLogs.reduce((s, l) => s + (l.fat_g ?? 0), 0)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('nutrition_logs')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setLogs(data ?? [])
        setLoadingLogs(false)
      })
  }, [])

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type || 'image/jpeg'
      setImageData({ base64, mediaType })
      setResult(null)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  async function analyze() {
    if (!imageData) return
    setAnalyzing(true)
    setError('')
    try {
      const res = await fetch('/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageData.base64, mediaType: imageData.mediaType, mealType }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Analysis failed'); return }
      setResult(data)
      setLogs(prev => [data, ...prev])
    } catch {
      setError('Network error — please try again')
    } finally {
      setAnalyzing(false)
    }
  }

  function reset() {
    setPreview(null)
    setImageData(null)
    setResult(null)
    setError('')
  }

  const s = {
    page: { padding: '40px 40px 80px' },
    card: { background: '#111', border: '1px solid #222', borderRadius: 16 },
    label: { fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
  }

  return (
    <div style={s.page}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Nutrition</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Take a photo of your meal — AI will estimate the calories and macros.</p>
      </div>

      {/* Today's summary */}
      {todayLogs.length > 0 && (
        <div style={{ ...s.card, padding: '20px 24px', marginBottom: 24 }}>
          <p style={{ ...s.label, marginBottom: 14 }}>Today&apos;s total</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <MacroChip icon={<Flame size={14} />} label="Calories" value={todayCalories} unit="kcal" color="#FACC15" />
            <MacroChip icon={<Beef size={14} />} label="Protein" value={todayProtein} unit="g" color="#f87171" />
            <MacroChip icon={<Wheat size={14} />} label="Carbs" value={todayCarbs} unit="g" color="#fb923c" />
            <MacroChip icon={<Droplets size={14} />} label="Fat" value={todayFat} unit="g" color="#60a5fa" />
          </div>
        </div>
      )}

      {/* Photo upload area */}
      <div style={{ ...s.card, padding: 24, marginBottom: 24 }}>
        <p style={{ ...s.label, marginBottom: 16 }}>Log a meal</p>

        {!preview ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: '100%', maxWidth: 400, aspectRatio: '4/3',
              background: '#0d0d0d', border: '2px dashed #2a2a2a',
              borderRadius: 14, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
              cursor: 'pointer', margin: '0 auto',
            }}
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={36} color="#4b5563" strokeWidth={1.5} />
              <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Tap to choose a photo</p>
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 400 }}>
              <button
                onClick={() => cameraRef.current?.click()}
                style={{ flex: 1, height: 44, background: '#FACC15', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Camera size={16} /> Take Photo
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ flex: 1, height: 44, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, fontWeight: 600, fontSize: 14, color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Upload size={16} /> Upload
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <img src={preview} alt="Food preview" style={{ width: '100%', maxWidth: 400, maxHeight: 300, objectFit: 'cover', borderRadius: 12, margin: '0 auto', display: 'block' }} />

            {/* Meal type */}
            <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
              <label style={{ ...s.label, display: 'block', marginBottom: 8 }}>Meal type</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  style={{ width: '100%', height: 44, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, color: '#fff', fontSize: 14, padding: '0 36px 0 14px', appearance: 'none', cursor: 'pointer' }}
                >
                  {MEAL_TYPES.map(t => <option key={t} value={t}>{MEAL_LABELS[t]}</option>)}
                </select>
                <ChevronDown size={14} color="#6b7280" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            {!result && (
              <div style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto', width: '100%' }}>
                <button onClick={reset} style={{ height: 44, padding: '0 20px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  onClick={analyze}
                  disabled={analyzing}
                  style={{ flex: 1, height: 44, background: '#FACC15', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, color: '#000', cursor: analyzing ? 'not-allowed' : 'pointer', opacity: analyzing ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {analyzing ? <><Loader2 size={16} className="animate-spin" /> Analyzing…</> : '✦ Analyze with AI'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hidden inputs */}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {error && (
          <p style={{ fontSize: 13, color: '#f87171', marginTop: 12, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, border: '1px solid rgba(248,113,113,0.2)' }}>{error}</p>
        )}
      </div>

      {/* Analysis result */}
      {result && (
        <div style={{ ...s.card, padding: 24, marginBottom: 24, border: '1px solid rgba(250,204,21,0.2)', background: 'rgba(250,204,21,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ ...s.label, marginBottom: 4 }}>AI Analysis — {MEAL_LABELS[result.meal_type]}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#e5e5e5', margin: 0 }}>{result.food_description}</p>
            </div>
            <button onClick={reset} style={{ fontSize: 12, color: '#FACC15', background: 'none', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
              + New
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <MacroChip icon={<Flame size={14} />} label="Calories" value={result.calories} unit="kcal" color="#FACC15" />
            <MacroChip icon={<Beef size={14} />} label="Protein" value={result.protein_g} unit="g" color="#f87171" />
            <MacroChip icon={<Wheat size={14} />} label="Carbs" value={result.carbs_g} unit="g" color="#fb923c" />
            <MacroChip icon={<Droplets size={14} />} label="Fat" value={result.fat_g} unit="g" color="#60a5fa" />
            <MacroChip icon={<Leaf size={14} />} label="Fiber" value={result.fiber_g} unit="g" color="#4ade80" />
          </div>
          {result.ai_notes && <p style={{ fontSize: 12, color: '#6b7280', margin: 0, fontStyle: 'italic' }}>{result.ai_notes}</p>}
        </div>
      )}

      {/* Log history */}
      <div>
        <p style={{ ...s.label, marginBottom: 14 }}>Recent meals</p>
        {loadingLogs ? (
          <div style={{ textAlign: 'center', padding: 32 }}><Loader2 size={20} color="#4b5563" className="animate-spin" style={{ margin: '0 auto' }} /></div>
        ) : logs.length === 0 ? (
          <div style={{ ...s.card, padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#4b5563', fontSize: 14, margin: 0 }}>No meals logged yet. Take a photo to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {logs.map(log => (
              <div key={log.id} style={{ ...s.card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#FACC15', background: 'rgba(250,204,21,0.1)', padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {MEAL_LABELS[log.meal_type] ?? log.meal_type}
                    </span>
                    <span style={{ fontSize: 11, color: '#4b5563' }}>{formatDate(log.logged_at)}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#e5e5e5', margin: '0 0 6px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.food_description}</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#FACC15', fontWeight: 700 }}>{log.calories} kcal</span>
                    <span style={{ fontSize: 12, color: '#f87171' }}>{log.protein_g}g protein</span>
                    <span style={{ fontSize: 12, color: '#fb923c' }}>{log.carbs_g}g carbs</span>
                    <span style={{ fontSize: 12, color: '#60a5fa' }}>{log.fat_g}g fat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
