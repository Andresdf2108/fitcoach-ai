import { createClient } from '@/lib/supabase/server'

const PLANS = [
  { name: 'free',       label: 'Free',       price: 0,   trainees: 5,    color: '#6b7280' },
  { name: 'gold',       label: 'Gold',       price: 49,  trainees: 25,   color: '#FACC15' },
  { name: 'platinum',   label: 'Platinum',   price: 99,  trainees: 75,   color: '#8b5cf6' },
  { name: 'diamond',    label: 'Diamond',    price: 199, trainees: 200,  color: '#3b82f6' },
  { name: 'enterprise', label: 'Enterprise', price: 499, trainees: 9999, color: '#10b981' },
]

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trainer } = await supabase
    .from('trainers')
    .select('plan_id, active_trainee_count, subscription_plans(name, max_trainees, price_monthly)')
    .eq('id', user!.id)
    .single()

  const plan = (trainer as any)?.subscription_plans
  const currentPlanName = plan?.name ?? 'free'
  const activeCount = (trainer as any)?.active_trainee_count ?? 0

  return (
    <div style={{ padding: 40, maxWidth: 700 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Billing</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Manage your plan and subscription</p>
      </div>

      {/* Current plan */}
      <div style={{
        background: '#1a1a1a', border: '1px solid #FACC1540', borderRadius: 16,
        padding: 24, marginBottom: 32,
      }}>
        <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>
          Current Plan
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#FACC15', fontWeight: 800, fontSize: 22, margin: '0 0 4px', textTransform: 'capitalize' }}>
              {currentPlanName}
            </p>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
              {activeCount} / {plan?.max_trainees ?? 5} active trainees
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 26, margin: 0 }}>
              ${plan?.price_monthly ?? 0}<span style={{ color: '#6b7280', fontSize: 14, fontWeight: 400 }}>/mo</span>
            </p>
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <h2 style={{ color: '#9ca3af', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>
        Available Plans
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PLANS.map(p => {
          const isCurrent = p.name === currentPlanName
          return (
            <div key={p.name} style={{
              background: '#1a1a1a',
              border: `1px solid ${isCurrent ? p.color + '60' : '#2a2a2a'}`,
              borderRadius: 12, padding: '18px 22px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: p.color, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, textTransform: 'capitalize' }}>{p.label}</span>
                  {isCurrent && (
                    <span style={{
                      background: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40`,
                      borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                    }}>Current</span>
                  )}
                </div>
                <p style={{ color: '#6b7280', fontSize: 13, margin: '2px 0 0' }}>
                  Up to {p.trainees === 9999 ? 'unlimited' : p.trainees} trainees
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: 18, margin: 0 }}>
                  {p.price === 0 ? 'Free' : `$${p.price}/mo`}
                </p>
              </div>
              {!isCurrent && (
                <button style={{
                  background: p.color, color: p.name === 'free' ? '#fff' : '#000',
                  fontWeight: 700, border: 'none', borderRadius: 8,
                  padding: '8px 16px', fontSize: 13, cursor: 'pointer', flexShrink: 0,
                }}>
                  {p.price > (plan?.price_monthly ?? 0) ? 'Upgrade' : 'Downgrade'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p style={{ color: '#374151', fontSize: 13, marginTop: 20, lineHeight: 1.6 }}>
        Plan changes take effect immediately. Downgrades do not remove existing clients.
        Contact support for enterprise pricing and custom contracts.
      </p>
    </div>
  )
}
