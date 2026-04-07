'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      window.location.href = '/auth/redirect'
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

  return (
    <div>
      <h2 style={{ fontSize: 30, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Welcome back</h2>
      <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 32px' }}>Sign in to your FitCoach AI account</p>

      <form onSubmit={handleLogin}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '12px 16px', fontSize: 14, color: '#dc2626', marginBottom: 20,
          }}>{error}</div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151' }}>Email</label>
          <input
            type="email" placeholder="you@example.com" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151' }}>Password</label>
          <input
            type="password" placeholder="••••••••" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
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
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 24 }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: '#EAB308', fontWeight: 700, textDecoration: 'none' }}>
          Sign up free
        </Link>
      </p>
    </div>
  )
}
