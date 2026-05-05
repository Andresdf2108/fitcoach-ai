'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Existing = {
  id: string
  mood_score: number
  energy_score: number
  focus_score: number
  win_today: string | null
  challenge_today: string | null
  intention: string | null
  ai_reflection: string | null
  created_at: string
} | null

function ScoreSlider({ label, value, onChange, color }: { label: string; value: number; onChange: (n: number) => void; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#d4d4d8', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}<span style={{ fontSize: 12, color: '#52525b', fontWeight: 600 }}> /10</span></span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: color,
          cursor: 'pointer',
        }}
      />
    </div>
  )
}

export default function MindsetCheckinClient({ existing }: { existing: Existing }) {
  const router = useRouter()
  const [mood, setMood] = useState(existing?.mood_score ?? 7)
  const [energy, setEnergy] = useState(existing?.energy_score ?? 7)
  const [focus, setFocus] = useState(existing?.focus_score ?? 7)
  const [win, setWin] = useState(existing?.win_today ?? '')
  const [challenge, setChallenge] = useState(existing?.challenge_today ?? '')
  const [intention, setIntention] = useState(existing?.intention ?? '')
  const [reflection, setReflection] = useState(existing?.ai_reflection ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const alreadyDone = !!existing

  async function submit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mindset/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_score: mood,
          energy_score: energy,
          focus_score: focus,
          win_today: win || undefined,
          challenge_today: challenge || undefined,
          intention: intention || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setReflection(data.reflection)
      router.refresh()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (reflection) {
    return (
      <div style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.08) 0%, rgba(250,204,21,0.02) 100%)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: 16, padding: '24px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Sparkles size={16} color="#FACC15" strokeWidth={2.2} />
          <span style={{ fontSize: 12, color: '#FACC15', fontWeight: 700, letterSpacing: '0.06em' }}>
            {alreadyDone ? "TODAY'S REFLECTION" : "REFLECTION FOR YOU"}
          </span>
        </div>
        <p style={{ color: '#fafafa', fontSize: 15, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{reflection}</p>
        {alreadyDone && (
          <p style={{ color: '#71717a', fontSize: 12, margin: '14px 0 0' }}>
            Come back tomorrow for your next check-in.
          </p>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 26px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 22 }}>
        <ScoreSlider label="Mood" value={mood} onChange={setMood} color="#FACC15" />
        <ScoreSlider label="Energy" value={energy} onChange={setEnergy} color="#4ade80" />
        <ScoreSlider label="Focus" value={focus} onChange={setFocus} color="#60a5fa" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <textarea
          value={win}
          onChange={e => setWin(e.target.value)}
          placeholder="A win from today (optional)"
          rows={2}
          style={inputStyle}
        />
        <textarea
          value={challenge}
          onChange={e => setChallenge(e.target.value)}
          placeholder="A challenge or friction (optional)"
          rows={2}
          style={inputStyle}
        />
        <textarea
          value={intention}
          onChange={e => setIntention(e.target.value)}
          placeholder="Your intention for tomorrow (optional)"
          rows={2}
          style={inputStyle}
        />
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 13, margin: '14px 0 0' }}>{error}</p>}

      <button
        onClick={submit}
        disabled={loading}
        style={{
          marginTop: 18,
          width: '100%',
          padding: '12px 18px',
          borderRadius: 10,
          background: '#FACC15',
          color: '#000',
          border: 'none',
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} strokeWidth={2.2} />}
        {loading ? 'Generating reflection…' : 'Generate today’s reflection'}
      </button>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  background: '#0f0f0f',
  border: '1px solid rgba(255,255,255,0.07)',
  color: '#fafafa',
  fontSize: 13,
  fontFamily: 'inherit',
  resize: 'vertical',
  outline: 'none',
  lineHeight: 1.5,
}
