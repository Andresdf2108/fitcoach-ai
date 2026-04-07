import Link from 'next/link'
import { signIn } from '@/app/actions/auth'

const inputStyle = {
  display: 'block', width: '100%', height: 44,
  padding: '0 14px', fontSize: 14,
  border: '1px solid #e5e7eb', borderRadius: 10,
  background: '#fafafa', color: '#111827',
  outline: 'none', boxSizing: 'border-box' as const, marginTop: 5,
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 5px', letterSpacing: '-0.02em' }}>Welcome back</h2>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 28px' }}>Sign in to your FitCoach AI account</p>

      <form action={signIn}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18,
          }}>{decodeURIComponent(error)}</div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>Email</label>
          <input name="email" type="email" placeholder="you@example.com" required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
          <input name="password" type="password" placeholder="••••••••" required style={inputStyle} />
        </div>

        <button type="submit" style={{
          display: 'block', width: '100%', height: 46,
          background: '#FACC15',
          color: '#000', fontWeight: 700, fontSize: 14,
          border: 'none', borderRadius: 10, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(234,179,8,0.3)',
          letterSpacing: '-0.01em',
        }}>
          Sign in
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 20 }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: '#FACC15', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
      </p>
    </div>
  )
}
