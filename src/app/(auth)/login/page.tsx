import Link from 'next/link'
import { signIn } from '@/app/actions/auth'

const inputStyle = {
  display: 'block', width: '100%', height: 48,
  padding: '0 14px', fontSize: 15,
  border: '1.5px solid #e5e7eb', borderRadius: 12,
  background: '#fafafa', color: '#111827',
  outline: 'none', boxSizing: 'border-box' as const, marginTop: 6,
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div>
      <h2 style={{ fontSize: 30, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Welcome back</h2>
      <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 32px' }}>Sign in to your FitCoach AI account</p>

      <form action={signIn}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '12px 16px', fontSize: 14, color: '#dc2626', marginBottom: 20,
          }}>{decodeURIComponent(error)}</div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151' }}>Email</label>
          <input name="email" type="email" placeholder="you@example.com" required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151' }}>Password</label>
          <input name="password" type="password" placeholder="••••••••" required style={inputStyle} />
        </div>

        <button type="submit" style={{
          display: 'block', width: '100%', height: 50,
          background: '#EAB308', color: '#000', fontWeight: 700, fontSize: 15,
          border: 'none', borderRadius: 12, cursor: 'pointer',
        }}>
          Sign in →
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 24 }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: '#EAB308', fontWeight: 700, textDecoration: 'none' }}>Sign up free</Link>
      </p>
    </div>
  )
}
