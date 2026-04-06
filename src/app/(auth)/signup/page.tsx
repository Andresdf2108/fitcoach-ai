'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const ROLES = [
  { value: 'trainer', label: 'I am a Trainer', desc: 'I coach and manage clients' },
  { value: 'trainee', label: 'I am a Trainee', desc: 'I am being coached' },
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
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/auth/redirect')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
      <p className="text-gray-500 mb-8">Start your FitCoach AI journey</p>

      <form onSubmit={handleSignup} className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                role === r.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className={`text-sm font-semibold ${role === r.value ? 'text-blue-700' : 'text-gray-800'}`}>
                {r.label}
              </p>
              <p className={`text-xs mt-0.5 ${role === r.value ? 'text-blue-500' : 'text-gray-400'}`}>
                {r.desc}
              </p>
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-gray-700 font-medium">Full name</Label>
          <Input
            id="fullName"
            placeholder="Alex Johnson"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 bg-white"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-white"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 bg-white"
            minLength={8}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
