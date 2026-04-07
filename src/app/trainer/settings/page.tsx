import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/app/actions/trainer'

const SPECIALIZATIONS = [
  'Weight Loss', 'Muscle Building', 'Athletic Performance', 'Mobility & Flexibility',
  'Nutrition Coaching', 'HIIT', 'Strength Training', 'Rehab & Recovery',
  'Yoga', 'Pilates', 'Boxing / MMA', 'Endurance / Running',
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: trainer }] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('id', user!.id).single(),
    supabase.from('trainers').select('bio, specializations, subscription_plans(name, max_trainees)').eq('id', user!.id).single(),
  ])

  const plan = (trainer as any)?.subscription_plans
  const specializations: string[] = (trainer as any)?.specializations ?? []

  return (
    <div style={{ padding: 40, maxWidth: 640 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Settings</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Manage your profile and account</p>
      </div>

      {/* Plan badge */}
      <div style={{
        background: '#1a1a1a', border: '1px solid #EAB30830', borderRadius: 12,
        padding: '14px 20px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 2px', fontWeight: 500 }}>Current Plan</p>
          <p style={{ color: '#EAB308', fontWeight: 700, fontSize: 16, margin: 0, textTransform: 'capitalize' }}>
            {plan?.name ?? 'Free'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 2px' }}>Max Trainees</p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0 }}>{plan?.max_trainees ?? 5}</p>
        </div>
      </div>

      {/* Profile form */}
      <form action={updateProfile}>
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28, marginBottom: 20,
        }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>Profile</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                name="full_name"
                type="text"
                defaultValue={profile?.full_name ?? ''}
                placeholder="Your full name"
                style={{
                  width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8,
                  padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={profile?.email ?? ''}
                disabled
                style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
                  padding: '10px 14px', color: '#4b5563', fontSize: 14, boxSizing: 'border-box', cursor: 'not-allowed',
                }}
              />
            </div>

            <div>
              <label style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Bio
              </label>
              <textarea
                name="bio"
                defaultValue={(trainer as any)?.bio ?? ''}
                placeholder="Tell your clients a bit about you, your coaching style, and your background..."
                rows={4}
                style={{
                  width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8,
                  padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
                  resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28, marginBottom: 20,
        }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>Specializations</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px' }}>Select all that apply</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {SPECIALIZATIONS.map(spec => {
              const checked = specializations.includes(spec)
              return (
                <label key={spec} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: checked ? '#EAB30820' : '#111',
                  border: `1px solid ${checked ? '#EAB30860' : '#2a2a2a'}`,
                  borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                  color: checked ? '#EAB308' : '#9ca3af', fontSize: 13, fontWeight: checked ? 600 : 400,
                }}>
                  <input
                    type="checkbox"
                    name="specializations"
                    value={spec}
                    defaultChecked={checked}
                    style={{ display: 'none' }}
                  />
                  {spec}
                </label>
              )
            })}
          </div>
        </div>

        <button type="submit" style={{
          background: '#EAB308', color: '#000', fontWeight: 700, fontSize: 15,
          border: 'none', borderRadius: 10, padding: '12px 28px', cursor: 'pointer',
        }}>
          Save Changes
        </button>
      </form>
    </div>
  )
}
