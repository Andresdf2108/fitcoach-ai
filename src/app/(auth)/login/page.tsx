'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/auth/redirect')
  }

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
      <p className="text-gray-500 mt-2 mb-8 text-sm">Sign in to your FitCoach AI account</p>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

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
            id="password" type="password" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl bg-white border-gray-200 text-gray-900 focus-visible:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl font-semibold text-white text-sm mt-2 transition-opacity disabled:opacity-60"
          style={{ background: loading ? '#93c5fd' : 'var(--brand)' }}
        >
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold" style={{ color: 'var(--brand)' }}>
          Sign up free
        </Link>
      </p>
    </div>
  )
}
