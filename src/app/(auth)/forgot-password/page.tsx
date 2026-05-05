import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'

const inputStyle = {
  display: 'block', width: '100%', height: 44,
  padding: '0 14px', fontSize: 14,
  border: '1px solid #e5e7eb', borderRadius: 10,
  background: '#fafafa', color: '#111827',
  outline: 'none', boxSizing: 'border-box' as const, marginTop: 5,
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>
}) {
  const { error, sent } = await searchParams

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 5px', letterSpacing: '-0.02em' }}>Reset your password</h2>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 28px' }}>
        Enter your email and we&apos;ll send you a link to set a new password.
      </p>

      {sent ? (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
          padding: '16px 18px', fontSize: 14, color: '#166534',
        }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700 }}>Check your inbox</p>
          <p style={{ margin: 0, lineHeight: 1.55 }}>
            We sent a reset link to <strong>{decodeURIComponent(sent)}</strong>. Click it to set a new password. The link expires in 1 hour.
          </p>
        </div>
      ) : (
        <form action={requestPasswordReset}>
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18,
            }}>{decodeURIComponent(error)}</div>
          )}

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>Email</label>
            <input name="email" type="email" placeholder="you@example.com" required style={inputStyle} />
          </div>

          <button type="submit" style={{
            display: 'block', width: '100%', height: 46,
            background: '#FACC15',
            color: '#000', fontWeight: 700, fontSize: 14,
            border: 'none', borderRadius: 10, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(234,179,8,0.3)',
            letterSpacing: '-0.01em',
          }}>
            Send reset link
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 20 }}>
        Remember it now?{' '}
        <Link href="/login" style={{ color: '#FACC15', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  )
}
