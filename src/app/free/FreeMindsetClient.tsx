'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RotateCcw } from 'lucide-react'
import Link from 'next/link'

function ScoreSlider({ label, hint, value, onChange, color }: { label: string; hint: string; value: number; onChange: (n: number) => void; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: 13, color: '#fafafa', fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 12, color: '#52525b', marginLeft: 8 }}>{hint}</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}<span style={{ fontSize: 12, color: '#52525b', fontWeight: 600 }}> /10</span></span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer' }}
      />
    </div>
  )
}

export default function FreeMindsetClient() {
  const [mood, setMood] = useState(7)
  const [energy, setEnergy] = useState(7)
  const [focus, setFocus] = useState(7)
  const [win, setWin] = useState('')
  const [challenge, setChallenge] = useState('')
  const [intention, setIntention] = useState('')
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
          visitor_id: getVisitorId(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setReflection(data.reflection)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setReflection('')
    setError('')
  }

  if (reflection) {
    return (
      <div>
        <div style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.1) 0%, rgba(250,204,21,0.02) 100%)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 16, padding: '28px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Sparkles size={16} color="#FACC15" strokeWidth={2.2} />
            <span style={{ fontSize: 12, color: '#FACC15', fontWeight: 700, letterSpacing: '0.08em' }}>YOUR REFLECTION</span>
          </div>
          <p style={{ color: '#fafafa', fontSize: 16, lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>{reflection}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'transparent', color: '#a1a1aa', borderRadius: 9, fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
          >
            <RotateCcw size={13} strokeWidth={2.2} /> Try again
          </button>
          <Link
            href="/signup"
            style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', background: '#FACC15', color: '#000', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
          >
            Save to your journal — sign up
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px 30px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 24 }}>
        <ScoreSlider label="Mood" hint="how you feel" value={mood} onChange={setMood} color="#FACC15" />
        <ScoreSlider label="Energy" hint="physical fuel" value={energy} onChange={setEnergy} color="#4ade80" />
        <ScoreSlider label="Focus" hint="mental clarity" value={focus} onChange={setFocus} color="#60a5fa" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <textarea value={win} onChange={e => setWin(e.target.value)} placeholder="A win from today (optional)" rows={2} style={inputStyle} />
        <textarea value={challenge} onChange={e => setChallenge(e.target.value)} placeholder="A challenge or friction (optional)" rows={2} style={inputStyle} />
        <textarea value={intention} onChange={e => setIntention(e.target.value)} placeholder="Your intention for tomorrow (optional)" rows={2} style={inputStyle} />
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 13, margin: '14px 0 0' }}>{error}</p>}

      <button
        onClick={submit}
        disabled={loading}
        style={{
          marginTop: 22,
          width: '100%',
          padding: '13px 18px',
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
        {loading ? 'Generating reflection…' : 'Generate my reflection'}
      </button>
    </div>
  )
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr'
  const KEY = 'fc_visitor_id'
  let id = window.localStorage.getItem(KEY)
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    try { window.localStorage.setItem(KEY, id) } catch {}
  }
  return id
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  background: '#070707',
  border: '1px solid rgba(255,255,255,0.07)',
  color: '#fafafa',
  fontSize: 13,
  fontFamily: 'inherit',
  resize: 'vertical',
  outline: 'none',
  lineHeight: 1.5,
}
