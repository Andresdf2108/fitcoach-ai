'use client'

import { useState, useRef, useEffect } from 'react'

const SUGGESTED = [
  'Create a 4-week beginner weight loss program',
  'Write a motivational check-in message for a struggling client',
  'Give me 5 tips to improve client retention',
  'Draft a proposal for a new potential client',
  'Suggest a progressive overload plan for a client hitting a plateau',
]

type Message = { role: 'user' | 'assistant'; content: string }

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/trainer/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? 'Sorry, something went wrong.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 780 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>AI Assistant</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Your coaching copilot — powered by Claude</p>
      </div>

      {/* Suggested prompts (only before first message) */}
      {messages.length === 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: '#4b5563', fontSize: 13, margin: '0 0 12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Suggestions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SUGGESTED.map(s => (
              <button key={s} onClick={() => send(s)} style={{
                background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10,
                padding: '11px 16px', color: '#9ca3af', fontSize: 13, textAlign: 'left',
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#FACC1550')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat history */}
      {messages.length > 0 && (
        <div style={{
          flex: 1, overflowY: 'auto', marginBottom: 20,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%',
                background: m.role === 'user' ? '#FACC15' : '#1a1a1a',
                color: m.role === 'user' ? '#000' : '#e5e7eb',
                border: m.role === 'assistant' ? '1px solid #2a2a2a' : 'none',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '14px 18px',
                fontSize: 14, lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: '16px 16px 16px 4px', padding: '14px 18px',
              }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#FACC15',
                      animation: 'pulse 1.4s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`, opacity: 0.6,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
          }}
          placeholder="Ask your coaching copilot anything..."
          rows={2}
          style={{
            flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12,
            padding: '12px 16px', color: '#fff', fontSize: 14, resize: 'none',
            lineHeight: 1.6, outline: 'none',
          }}
        />
        <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{
          background: input.trim() ? '#FACC15' : '#1a1a1a',
          color: input.trim() ? '#000' : '#374151',
          border: '1px solid #2a2a2a',
          fontWeight: 700, borderRadius: 12, padding: '12px 20px',
          fontSize: 16, cursor: input.trim() ? 'pointer' : 'default',
          transition: 'background 0.15s',
        }}>↑</button>
      </div>
      <p style={{ color: '#374151', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
