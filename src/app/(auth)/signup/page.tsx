'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ROLES = [
  { value: 'trainer', emoji: '🏋️', label: 'Trainer', desc: 'I coach clients' },
  { value: 'trainee', emoji: '💪', label: 'Trainee', desc: 'I am being coached' },
]

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('trainer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Session exists → email confirmation is OFF → go straight in
      if (data.session) {
        window.location.href = '/auth/redirect'
        return
      }

      // No session → email confirmation is ON → show check-email screen
      setEmailSent(true)
      setLoading(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputStyle = {
    display: 'block', width: '100%', height: 48,
    padding: '0 14px', fontSize: 15,
    border: '1.5px solid #e5e7eb', borderRadius: 12,
    background: '#fafafa', color: '#111827',
    outline: 'none', boxSizing: 'border-box' as const, marginTop: 6,
  }

  // ── Check your email screen ───────────────────────────────
  if (emailSent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>
          Check your email
        </h2>
        <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7, margin: '0 0 28px' }}>
          We sent a confirmation link to<br />
          <strong style={{ color: '#111827' }}>{email}</strong>
        </p>
        <div style={{
          background: '#fefce8', border: '1px solid #fef08a',
          borderRadius: 14, padding: '16px 20px', marginBottom: 24, textAlign: 'left',
        }}>
          <p style={{ fontSize: 13, color: '#713f12', margin: 0, lineHeight: 1.7 }}>
            1. Open the email from FitCoach AI<br />
            2. Click the confirmation link<br />
            3. You&apos;ll be taken straight to your setup wizard
          </p>
        </div>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>
          Wrong email?{' '}
          <button
            onClick={() => setEmailSent(false)}
            style={{ color: '#EAB308', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
          >
            Go back
          </button>
        </p>
      </div>
    )
  }

  // ── Signup form ───────────────────────────────────────────
  return (
    <div>
      <h2 style={{ fontSize: 30, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Get started</h2>
      <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 28px' }}>Create your FitCoach AI account</p>

      <form onSubmit={handleSignup}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '12px 16px', fontSize: 14, color: '#dc2626', marginBottom: 20,
          }}>{error}</div>
        )}

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 10px' }}>I am a…</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {ROLES.map((r) => (
              <button
                key={r.value} type="button" onClick={() => setRole(r.value)}
                style={{
                  padding: '14px 16px', borderRadius: 12, textAlign: 'left',
                  border: `2px solid ${role === r.value ? '#EAB308' : '#e5e7eb'}`,
                  background: role === r.value ? '#fefce8' : '#fafafa',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 20 }}>{r.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 6 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151' }}>Full name</label>
          <input placeholder="Alex Johnson" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151' }}>Email</label>
          <input type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151' }}>Password</label>
          <input type="password" placeholder="Min. 8 characters" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        </div>

        <button
          type="submit" disabled={loading}
          style={{
            display: 'block', width: '100%', height: 50,
            background: loading ? '#fde68a' : '#EAB308',
            color: '#000', fontWeight: 700, fontSize: 15,
            border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 24 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#EAB308', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  )
}
