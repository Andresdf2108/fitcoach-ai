'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createAccount } from '@/app/actions/auth'

const SPECIALIZATIONS = [
  'Strength Training', 'Hypertrophy', 'Fat Loss', 'Athletic Performance',
  'Rehab & Mobility', 'Nutrition Coaching', 'Online Coaching', 'Beginner Fitness',
]

const GOALS = [
  { value: 'lose_fat',        label: 'Lose Fat' },
  { value: 'build_muscle',    label: 'Build Muscle' },
  { value: 'get_stronger',    label: 'Get Stronger' },
  { value: 'improve_fitness', label: 'General Fitness' },
  { value: 'rehab',           label: 'Injury Rehab' },
  { value: 'performance',     label: 'Athletic Performance' },
]

const FITNESS_LEVELS = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Less than 1 year of training' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years of training' },
  { value: 'advanced',     label: 'Advanced',     desc: '3+ years of training' },
]

type Profile = { id: string; role: string; full_name: string }

interface Props {
  defaultRole: 'trainer' | 'trainee'
}

export default function OnboardingWizard({ defaultRole }: Props) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [isNewUser, setIsNewUser] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupError, setSignupError] = useState('')

  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [specializations, setSpecializations] = useState<string[]>([])
  const [goal, setGoal] = useState('')
  const [fitnessLevel, setFitnessLevel] = useState('')
  const [injuries, setInjuries] = useState('')

  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    let prof = null
    for (let i = 0; i < 8; i++) {
      const { data } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', user.id)
        .single()
      if (data) { prof = data; break }
      await new Promise((r) => setTimeout(r, 600))
    }
    if (prof) setProfile(prof)
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsNewUser(true)
        setLoading(false)
        return
      }

      let prof = null
      for (let i = 0; i < 5; i++) {
        const { data } = await supabase
          .from('profiles')
          .select('id, role, full_name')
          .eq('id', user.id)
          .single()
        if (data) { prof = data; break }
        await new Promise((r) => setTimeout(r, 600))
      }
      setProfile(prof)
      setFullName('')
      setLoading(false)
    }
    load()
  }, [router])

  function toggleSpec(s: string) {
    setSpecializations((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  async function handleSignup() {
    if (!fullName.trim() || !signupEmail.trim() || signupPassword.length < 6) return
    setSaving(true)
    setSignupError('')

    const fd = new FormData()
    fd.set('email', signupEmail.trim())
    fd.set('password', signupPassword)
    fd.set('fullName', fullName.trim())
    fd.set('role', defaultRole)

    const result = await createAccount(fd)
    if (result.error) {
      setSignupError(result.error)
      setSaving(false)
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: signupEmail.trim(),
      password: signupPassword,
    })

    if (signInError) {
      setSignupError(signInError.message)
      setSaving(false)
      return
    }

    await loadProfile()
    setSaving(false)
    setIsNewUser(false)
    setStep(2)
  }

  async function saveName() {
    if (!profile || !fullName.trim()) return
    const supabase = createClient()
    await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', profile.id)
    setProfile({ ...profile, full_name: fullName.trim() })
    setStep(2)
  }

  async function finish() {
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    const role = profile.role || defaultRole

    if (role === 'trainer') {
      await supabase.from('trainers').upsert({ id: profile.id, bio, specializations })
    } else {
      await supabase.from('trainees').upsert({
        id: profile.id,
        goals: goal,
        fitness_level: fitnessLevel,
        injury_notes: injuries,
      })
    }

    await supabase.from('profiles').update({ onboarded: true }).eq('id', profile.id)
    router.push(role === 'trainer' ? '/trainer/dashboard' : '/trainee/dashboard')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#000', margin: '0 auto 16px' }}>FC</div>
          <p style={{ color: '#6b7280', fontSize: 15 }}>Setting up your account…</p>
        </div>
      </div>
    )
  }

  const isTrainer = defaultRole === 'trainer'
  const firstName = (fullName || profile?.full_name)?.split(' ')[0] ?? 'there'
  const totalSteps = 4

  const Progress = () => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < step ? '#FACC15' : '#e5e7eb', transition: 'background 0.3s' }} />
      ))}
    </div>
  )

  const card = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: 24 }
  const inner = { width: '100%', maxWidth: 520, background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }
  const h2 = { fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 8px' }
  const sub = { fontSize: 15, color: '#6b7280', margin: '0 0 28px', lineHeight: 1.6 }
  const btnPrimary = { height: 50, padding: '0 28px', background: '#FACC15', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, color: '#000', cursor: 'pointer', marginTop: 8 }
  const btnSecondary = { height: 50, padding: '0 20px', background: 'transparent', border: '1.5px solid #e5e7eb', borderRadius: 12, fontWeight: 600, fontSize: 15, color: '#374151', cursor: 'pointer', marginTop: 8 }
  const inputStyle = { display: 'block', width: '100%', padding: '12px 14px', fontSize: 15, border: '1.5px solid #e5e7eb', borderRadius: 12, background: '#fafafa', color: '#111827', outline: 'none', boxSizing: 'border-box' as const, marginTop: 6 }
  const labelStyle = { fontSize: 14, fontWeight: 600, color: '#374151' }
  const Logo = () => (
    <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#000', marginBottom: 20 }}>FC</div>
  )

  // ── STEP 1: Signup (new) or name update (existing) ────────────
  if (step === 1) {
    if (isNewUser) return (
      <div style={card}>
        <div style={inner}>
          <Logo />
          <Progress />
          <h2 style={h2}>{isTrainer ? 'Start coaching with AI' : 'Start your fitness journey'}</h2>
          <p style={sub}>Create your free FitCoach AI account — no credit card required.</p>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full name</label>
            <input type="text" placeholder="e.g. Alex Johnson" value={fullName} onChange={(e) => setFullName(e.target.value)} autoFocus style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" placeholder="At least 6 characters" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSignup() }} style={inputStyle} />
          </div>

          {signupError && (
            <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>{signupError}</p>
          )}

          <button
            style={{ ...btnPrimary, width: '100%', opacity: (fullName.trim() && signupEmail.trim() && signupPassword.length >= 6 && !saving) ? 1 : 0.5, cursor: (fullName.trim() && signupEmail.trim() && signupPassword.length >= 6 && !saving) ? 'pointer' : 'not-allowed' }}
            onClick={handleSignup}
            disabled={!fullName.trim() || !signupEmail.trim() || signupPassword.length < 6 || saving}
          >
            {saving ? 'Creating account…' : 'Create free account →'}
          </button>

          <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 16 }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#374151', fontWeight: 600, textDecoration: 'none' }}>Log in</a>
          </p>
        </div>
      </div>
    )

    return (
      <div style={card}>
        <div style={inner}>
          <Logo />
          <Progress />
          <h2 style={h2}>What&apos;s your name?</h2>
          <p style={sub}>This is how you&apos;ll appear to {isTrainer ? 'your clients' : 'your trainer'} on FitCoach AI.</p>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Full name</label>
            <input type="text" placeholder="e.g. Alex Johnson" value={fullName} onChange={(e) => setFullName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && fullName.trim()) saveName() }} autoFocus style={inputStyle} />
          </div>
          <button style={{ ...btnPrimary, width: '100%', opacity: fullName.trim() ? 1 : 0.5, cursor: fullName.trim() ? 'pointer' : 'not-allowed' }} onClick={saveName} disabled={!fullName.trim()}>
            Continue →
          </button>
        </div>
      </div>
    )
  }

  // ── STEP 2: Welcome ───────────────────────────────────────────
  if (step === 2) return (
    <div style={card}>
      <div style={inner}>
        <Logo />
        <Progress />
        <h2 style={h2}>Welcome, {firstName}! 👋</h2>
        <p style={sub}>
          {isTrainer
            ? "You're joining FitCoach AI as a Coach. Let's set up your profile in 2 quick steps so you can start bringing in clients."
            : "You're joining FitCoach AI as a Trainee. Let's set up your profile in 2 quick steps so your coach can build the perfect plan for you."}
        </p>
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 14, padding: '16px 20px', marginBottom: 28 }}>
          <p style={{ fontSize: 14, color: '#713f12', margin: 0, lineHeight: 1.6 }}>
            {isTrainer
              ? 'Your free plan includes up to 5 active clients. Upgrade anytime as you grow.'
              : 'Your trainer will assign your first workout plan after reviewing your profile.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={btnSecondary} onClick={() => setStep(1)}>← Back</button>
          <button style={{ ...btnPrimary, flex: 1 }} onClick={() => setStep(3)}>Let&apos;s go →</button>
        </div>
      </div>
    </div>
  )

  // ── STEP 3: Role-specific setup ───────────────────────────────
  if (step === 3) return (
    <div style={card}>
      <div style={inner}>
        <Progress />
        {isTrainer ? (
          <>
            <h2 style={h2}>Your coaching profile</h2>
            <p style={sub}>Help clients understand who you are and what you offer.</p>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Short bio</label>
              <textarea placeholder="e.g. Online strength coach with 5 years experience helping busy professionals build muscle and lose fat." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} style={{ ...inputStyle, height: 'auto', padding: '12px 14px', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 10 }}>
                Specializations <span style={{ color: '#9ca3af', fontWeight: 400 }}>(pick all that apply)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SPECIALIZATIONS.map((s) => (
                  <button key={s} type="button" onClick={() => toggleSpec(s)} style={{ padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: `2px solid ${specializations.includes(s) ? '#FACC15' : '#e5e7eb'}`, background: specializations.includes(s) ? '#fefce8' : '#fafafa', color: specializations.includes(s) ? '#713f12' : '#374151', cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 style={h2}>Your fitness goals</h2>
            <p style={sub}>This helps your trainer build the right program from day one.</p>
            <div style={{ marginBottom: 24 }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 10 }}>Primary goal</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {GOALS.map((g) => (
                  <button key={g.value} type="button" onClick={() => setGoal(g.value)} style={{ padding: '14px 16px', borderRadius: 12, textAlign: 'left', border: `1.5px solid ${goal === g.value ? '#FACC15' : '#e5e7eb'}`, background: goal === g.value ? '#fefce8' : '#fafafa', cursor: 'pointer' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{g.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 10 }}>Fitness level</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FITNESS_LEVELS.map((l) => (
                  <button key={l.value} type="button" onClick={() => setFitnessLevel(l.value)} style={{ padding: '14px 16px', borderRadius: 12, textAlign: 'left', border: `2px solid ${fitnessLevel === l.value ? '#FACC15' : '#e5e7eb'}`, background: fitnessLevel === l.value ? '#fefce8' : '#fafafa', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{l.label}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{l.desc}</p>
                    </div>
                    {fitnessLevel === l.value && <span style={{ color: '#FACC15', fontSize: 18 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button style={btnSecondary} onClick={() => setStep(2)}>← Back</button>
          <button style={{ ...btnPrimary, flex: 1 }} onClick={() => setStep(4)} disabled={isTrainer ? false : (!goal || !fitnessLevel)}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  )

  // ── STEP 4: Finish ────────────────────────────────────────────
  return (
    <div style={card}>
      <div style={inner}>
        <Progress />
        {isTrainer ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 20px rgba(234,179,8,0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={{ ...h2, textAlign: 'center' }}>You&apos;re all set!</h2>
              <p style={{ ...sub, textAlign: 'center' }}>Your coaching profile is ready. Start by adding your first lead or inviting a client.</p>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 14, padding: '20px 24px', marginBottom: 28 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>What you can do next:</p>
              {['Add your first lead to the CRM', 'Build a program template', 'Message a client', 'Check your dashboard stats'].map((item) => (
                <p key={item} style={{ fontSize: 13, color: '#6b7280', margin: '6px 0', lineHeight: 1.5, paddingLeft: 16, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#FACC15' }}>›</span>{item}
                </p>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 style={h2}>Almost done!</h2>
            <p style={sub}>Any injuries or physical limitations your trainer should know about?</p>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Injuries / notes <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <textarea placeholder="e.g. Lower back pain, avoid heavy deadlifts. Previous ACL surgery on right knee." value={injuries} onChange={(e) => setInjuries(e.target.value)} rows={4} style={{ ...inputStyle, height: 'auto', padding: '12px 14px', resize: 'vertical' }} />
            </div>
            <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: '#713f12', margin: 0, lineHeight: 1.6 }}>Your trainer will review this before assigning your first program.</p>
            </div>
          </>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={btnSecondary} onClick={() => setStep(3)}>← Back</button>
          <button style={{ ...btnPrimary, flex: 1, opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }} onClick={finish} disabled={saving}>
            {saving ? 'Saving…' : isTrainer ? 'Go to my dashboard →' : 'Complete setup →'}
          </button>
        </div>
      </div>
    </div>
  )
}
