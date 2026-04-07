import Link from 'next/link'
import { signUp } from '@/app/actions/auth'

const inputStyle = {
  display: 'block', width: '100%', height: 44,
  padding: '0 14px', fontSize: 14,
  border: '1px solid #e5e7eb', borderRadius: 10,
  background: '#fafafa', color: '#111827',
  outline: 'none', boxSizing: 'border-box' as const, marginTop: 5,
  transition: 'border-color 0.15s',
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; confirm?: string }>
}) {
  const { error, confirm } = await searchParams

  if (confirm) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, #EAB308, #a16207)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 26,
          boxShadow: '0 0 24px rgba(234,179,8,0.3)',
        }}>✉️</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Check your email
        </h2>
        <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
          We sent a confirmation link to<br />
          <strong style={{ color: '#111827' }}>{decodeURIComponent(confirm)}</strong>
        </p>
        <div style={{
          background: '#fefce8', border: '1px solid #fef08a',
          borderRadius: 12, padding: '14px 18px', marginBottom: 24, textAlign: 'left',
        }}>
          <p style={{ fontSize: 13, color: '#713f12', margin: 0, lineHeight: 1.8 }}>
            1. Open the email from FitCoach AI<br />
            2. Click the confirmation link<br />
            3. You&apos;ll be taken to your setup wizard
          </p>
        </div>
        <Link href="/signup" style={{ color: '#EAB308', fontWeight: 600, fontSize: 13 }}>
          ← Try a different email
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 5px', letterSpacing: '-0.02em' }}>Get started</h2>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 26px' }}>Create your FitCoach AI account</p>

      <form action={signUp}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18,
          }}>{decodeURIComponent(error)}</div>
        )}

        {/* Role selector */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>I am a…</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { value: 'trainer', label: 'Trainer', desc: 'I coach clients' },
              { value: 'trainee', label: 'Trainee', desc: 'I am being coached' },
            ].map(r => (
              <label key={r.value} style={{ cursor: 'pointer' }}>
                <input type="radio" name="role" value={r.value} defaultChecked={r.value === 'trainer'}
                  style={{ display: 'none' }} />
                <div style={{
                  padding: '13px 15px', borderRadius: 10,
                  border: '1.5px solid #e5e7eb', background: '#fafafa',
                  cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{r.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>Full name</label>
          <input name="fullName" placeholder="Alex Johnson" required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>Email</label>
          <input name="email" type="email" placeholder="you@example.com" required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
          <input name="password" type="password" placeholder="Min. 8 characters" minLength={8} required style={inputStyle} />
        </div>

        <button type="submit" style={{
          display: 'block', width: '100%', height: 46,
          background: 'linear-gradient(135deg, #EAB308 0%, #a16207 100%)',
          color: '#000', fontWeight: 700, fontSize: 14,
          border: 'none', borderRadius: 10, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(234,179,8,0.3)',
          letterSpacing: '-0.01em',
        }}>
          Create account
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 20 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#EAB308', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  )
}
