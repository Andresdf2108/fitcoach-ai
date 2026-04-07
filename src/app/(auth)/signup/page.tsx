import Link from 'next/link'
import { signUp } from '@/app/actions/auth'

const ROLES = [
  { value: 'trainer', emoji: '🏋️', label: 'Trainer', desc: 'I coach clients' },
  { value: 'trainee', emoji: '💪', label: 'Trainee', desc: 'I am being coached' },
]

const inputStyle = {
  display: 'block', width: '100%', height: 48,
  padding: '0 14px', fontSize: 15,
  border: '1.5px solid #e5e7eb', borderRadius: 12,
  background: '#fafafa', color: '#111827',
  outline: 'none', boxSizing: 'border-box' as const, marginTop: 6,
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; confirm?: string }>
}) {
  const { error, confirm } = await searchParams

  // ── Email confirmation sent ────────────────────────────────
  if (confirm) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>
          Check your email
        </h2>
        <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7, margin: '0 0 28px' }}>
          We sent a confirmation link to<br />
          <strong style={{ color: '#111827' }}>{decodeURIComponent(confirm)}</strong>
        </p>
        <div style={{
          background: '#fefce8', border: '1px solid #fef08a',
          borderRadius: 14, padding: '16px 20px', marginBottom: 24, textAlign: 'left',
        }}>
          <p style={{ fontSize: 13, color: '#713f12', margin: 0, lineHeight: 1.7 }}>
            1. Open the email from FitCoach AI<br />
            2. Click the confirmation link<br />
            3. You&apos;ll land on your setup wizard
          </p>
        </div>
        <Link href="/signup" style={{ color: '#EAB308', fontWeight: 700, fontSize: 14 }}>
          ← Try a different email
        </Link>
      </div>
    )
  }

  // ── Signup form ───────────────────────────────────────────
  return (
    <div>
      <h2 style={{ fontSize: 30, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Get started</h2>
      <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 28px' }}>Create your FitCoach AI account</p>

      <form action={signUp}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '12px 16px', fontSize: 14, color: '#dc2626', marginBottom: 20,
          }}>{decodeURIComponent(error)}</div>
        )}

        {/* Role selector — uses hidden input so value is sent with form */}
        <input type="hidden" name="role" id="role-input" defaultValue="trainer" />
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 10px' }}>I am a…</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {ROLES.map((r) => (
              <label key={r.value} style={{ cursor: 'pointer' }}>
                <input type="radio" name="role" value={r.value} defaultChecked={r.value === 'trainer'}
                  style={{ display: 'none' }} />
                <div style={{
                  padding: '14px 16px', borderRadius: 12,
                  border: '2px solid #e5e7eb', background: '#fafafa',
                }}>
                  <div style={{ fontSize: 20 }}>{r.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 6 }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{r.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151' }}>Full name</label>
          <input name="fullName" placeholder="Alex Johnson" required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151' }}>Email</label>
          <input name="email" type="email" placeholder="you@example.com" required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151' }}>Password</label>
          <input name="password" type="password" placeholder="Min. 8 characters" minLength={8} required style={inputStyle} />
        </div>

        <button type="submit" style={{
          display: 'block', width: '100%', height: 50,
          background: '#EAB308', color: '#000', fontWeight: 700, fontSize: 15,
          border: 'none', borderRadius: 12, cursor: 'pointer',
        }}>
          Create account →
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 24 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#EAB308', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  )
}
