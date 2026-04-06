'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ROLES = [
  { value: 'trainer', emoji: '🏋️', label: 'Trainer', desc: 'I coach clients' },
  { value: 'trainee', emoji: '💪', label: 'Trainee', desc: 'I am being coached' },
]

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('trainer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/auth/redirect')
  }

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Get started</h2>
      <p className="text-gray-500 mt-2 mb-8 text-sm">Create your FitCoach AI account</p>

      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Role selector */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">I am a…</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.value} type="button" onClick={() => setRole(r.value)}
                className="p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: role === r.value ? 'var(--brand)' : '#e5e7eb',
                  background: role === r.value ? 'var(--brand-light)' : 'white',
                }}
              >
                <span className="text-xl">{r.emoji}</span>
                <p className="text-sm font-bold text-gray-900 mt-1">{r.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full name</Label>
          <Input
            id="fullName" placeholder="Alex Johnson"
            value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="h-12 rounded-xl bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
          <Input
            id="email" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
          <Input
            id="password" type="password" placeholder="Min. 8 characters"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl bg-white border-gray-200 text-gray-900 focus-visible:ring-blue-500"
            minLength={8} required
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full h-12 rounded-xl font-semibold text-white text-sm mt-2 transition-opacity disabled:opacity-60"
          style={{ background: loading ? '#93c5fd' : 'var(--brand)' }}
        >
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
