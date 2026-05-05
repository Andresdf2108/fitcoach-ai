'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { acceptInvite } from '@/app/actions/trainer'

interface InviteInfo {
  full_name: string | null
  email: string | null
  trainer_name: string
  used_at: string | null
  expires_at: string
}

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(async ({ token: t }) => {
      setToken(t)
      const supabase = createClient()
      const { data } = await supabase
        .from('trainer_invites')
        .select('full_name, email, used_at, expires_at, trainer_id')
        .eq('token', t)
        .single()

      if (!data) { setInvalid(true); setLoading(false); return }

      // Get trainer name
      const { data: trainerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.trainer_id)
        .single()

      setInvite({
        full_name: data.full_name,
        email: data.email,
        trainer_name: trainerProfile?.full_name ?? 'Your Coach',
        used_at: data.used_at,
        expires_at: data.expires_at,
      })
      if (data.email) setEmail(data.email)
      if (data.full_name) setFullName(data.full_name)
      setLoading(false)
    })
  }, [params])

  async function handleSubmit() {
    if (!fullName.trim() || !email.trim() || password.length < 6) return
    setSubmitting(true)
    setError('')

    const fd = new FormData()
    fd.set('token', token)
    fd.set('email', email.trim())
    fd.set('password', password)
    fd.set('fullName', fullName.trim())

    const result = await acceptInvite(fd)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    // Sign in client-side to persist the session in the browser
    const supabase = createClient()
    await supabase.auth.signInWithPassword({ email: email.trim(), password })
    router.push('/onboarding/trainee?skip_account=1')
  }

  const inputStyle = {
    display: 'block', width: '100%', padding: '12px 14px', fontSize: 15,
    border: '1.5px solid #2a2a2a', borderRadius: 12, background: '#111',
    color: '#fff', outline: 'none', boxSizing: 'border-box' as const, marginTop: 6,
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#000', margin: '0 auto 16px' }}>FC</div>
        <p style={{ color: '#6b7280', fontSize: 15 }}>Loading your invitation…</p>
      </div>
    </div>
  )

  if (invalid) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#000', margin: '0 auto 20px' }}>FC</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Invalid invite link</h2>
        <p style={{ color: '#6b7280', fontSize: 15 }}>This link is invalid or has expired. Ask your coach to send you a new one.</p>
      </div>
    </div>
  )

  if (invite?.used_at) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#000', margin: '0 auto 20px' }}>FC</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Already used</h2>
        <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 20px' }}>This invite has already been accepted.</p>
        <a href="/login" style={{ display: 'inline-block', padding: '12px 28px', background: '#FACC15', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Log in →
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460, background: '#111', border: '1px solid #222', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div style={{ padding: '28px 32px 24px', background: 'linear-gradient(135deg, rgba(250,204,21,0.1) 0%, rgba(250,204,21,0.03) 100%)', borderBottom: '1px solid #1a1a1a' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#000', marginBottom: 16 }}>FC</div>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#FACC15', letterSpacing: '0.1em', margin: '0 0 6px' }}>YOU'VE BEEN INVITED</p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {invite?.trainer_name} invited you to FitCoach AI
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Create your free account and start your fitness journey.</p>
        </div>

        {/* Form */}
        <div style={{ padding: '24px 32px 32px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa' }}>Your name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Alex Johnson" autoFocus style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} style={inputStyle} />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, border: '1px solid rgba(248,113,113,0.2)' }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !fullName.trim() || !email.trim() || password.length < 6}
            style={{
              width: '100%', height: 50, background: '#FACC15', border: 'none', borderRadius: 12,
              fontWeight: 800, fontSize: 15, color: '#000', cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: (submitting || !fullName.trim() || !email.trim() || password.length < 6) ? 0.5 : 1,
            }}
          >
            {submitting ? 'Creating account…' : 'Accept invite & get started →'}
          </button>

          <p style={{ fontSize: 13, color: '#4b5563', textAlign: 'center', marginTop: 16 }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#a1a1aa', fontWeight: 600, textDecoration: 'none' }}>Log in</a>
          </p>
        </div>
      </div>
    </div>
  )
}
