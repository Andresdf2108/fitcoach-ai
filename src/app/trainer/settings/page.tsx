import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/app/actions/trainer'

const SPECIALIZATIONS = [
  'Weight Loss', 'Muscle Building', 'Athletic Performance', 'Mobility & Flexibility',
  'Nutrition Coaching', 'HIIT', 'Strength Training', 'Rehab & Recovery',
  'Yoga', 'Pilates', 'Boxing / MMA', 'Endurance / Running',
]

const PLANS = [
  { name: 'free',       label: 'Free',       price: 0,   trainees: 5,    color: '#6b7280' },
  { name: 'gold',       label: 'Gold',       price: 49,  trainees: 25,   color: '#FACC15' },
  { name: 'platinum',   label: 'Platinum',   price: 99,  trainees: 75,   color: '#8b5cf6' },
  { name: 'diamond',    label: 'Diamond',    price: 199, trainees: 200,  color: '#3b82f6' },
  { name: 'enterprise', label: 'Enterprise', price: 499, trainees: 9999, color: '#10b981' },
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: trainer }] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('id', user!.id).single(),
    supabase.from('trainers').select('bio, specializations, active_trainee_count, subscription_plans(name, max_trainees, price_monthly)').eq('id', user!.id).single(),
  ])

  const plan = (trainer as any)?.subscription_plans
  const specializations: string[] = (trainer as any)?.specializations ?? []
  const currentPlanName: string = plan?.name ?? 'free'
  const activeCount: number = (trainer as any)?.active_trainee_count ?? 0

  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8,
    padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const,
  }

  const cardStyle = {
    background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28, marginBottom: 20,
  }

  return (
    <div style={{ padding: 40, maxWidth: 660 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Settings</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Profile, specializations, and subscription</p>
      </div>

      {/* Profile form */}
      <form action={updateProfile}>
        <div style={cardStyle}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>Profile</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Full Name</label>
              <input name="full_name" type="text" defaultValue={profile?.full_name ?? ''} placeholder="Your full name" style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={profile?.email ?? ''} disabled style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #222', color: '#4b5563', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Bio</label>
              <textarea
                name="bio"
                defaultValue={(trainer as any)?.bio ?? ''}
                placeholder="Tell your clients about your coaching style and background..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div style={cardStyle}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>Specializations</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px' }}>Select all that apply to your coaching practice</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {SPECIALIZATIONS.map(spec => {
              const checked = specializations.includes(spec)
              return (
                <label key={spec} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: checked ? '#FACC1520' : '#111',
                  border: `1px solid ${checked ? '#FACC1560' : '#2a2a2a'}`,
                  borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                  color: checked ? '#FACC15' : '#9ca3af', fontSize: 13, fontWeight: checked ? 600 : 400,
                }}>
                  <input type="checkbox" name="specializations" value={spec} defaultChecked={checked} style={{ display: 'none' }} />
                  {spec}
                </label>
              )
            })}
          </div>
        </div>

        <button type="submit" style={{
          background: '#FACC15', color: '#000', fontWeight: 700, fontSize: 15,
          border: 'none', borderRadius: 10, padding: '12px 28px', cursor: 'pointer',
        }}>
          Save Changes
        </button>
      </form>

      {/* Billing — OUTSIDE the form (HTML: no nested forms) */}
      <div style={{ ...cardStyle, marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 4px' }}>Subscription</h2>
            <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
              {activeCount} of {plan?.max_trainees ?? 5} client slots used
            </p>
          </div>
          <span style={{
            background: '#FACC1520', color: '#FACC15', border: '1px solid #FACC1540',
            borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
          }}>{currentPlanName}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PLANS.map(p => {
            const isCurrent = p.name === currentPlanName
            return (
              <div key={p.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: 11,
                background: isCurrent ? `${p.color}12` : '#111',
                border: `1px solid ${isCurrent ? p.color + '40' : '#222'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <div>
                    <span style={{ color: isCurrent ? '#fff' : '#9ca3af', fontWeight: isCurrent ? 700 : 500, fontSize: 14 }}>
                      {p.label}
                    </span>
                    <span style={{ color: '#4b5563', fontSize: 13, marginLeft: 10 }}>
                      up to {p.trainees === 9999 ? '∞' : p.trainees} clients
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: isCurrent ? '#fff' : '#6b7280', fontWeight: 700, fontSize: 14 }}>
                    {p.price === 0 ? 'Free' : `$${p.price}/mo`}
                  </span>
                  {isCurrent ? (
                    <span style={{
                      background: `${p.color}25`, color: p.color,
                      borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                    }}>Current</span>
                  ) : (
                    <a
                      href={`mailto:support@fitcoachai.com?subject=Plan Upgrade Request — ${p.label}&body=Hi, I'd like to upgrade my plan to ${p.label} ($${p.price}/mo).`}
                      style={{
                        background: '#1f1f1f', color: '#9ca3af', border: '1px solid #2a2a2a',
                        borderRadius: 7, padding: '4px 12px', fontSize: 11, fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      Upgrade
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p style={{ color: '#3f3f46', fontSize: 12, margin: '16px 0 0', lineHeight: 1.6 }}>
          To change your plan, contact <span style={{ color: '#6b7280' }}>support@fitcoachai.com</span>.
          Stripe billing integration coming soon.
        </p>
      </div>
    </div>
  )
}
