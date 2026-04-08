import { createClient } from '@/lib/supabase/server'

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient()

  const [{ data: plans }, { data: trainers }] = await Promise.all([
    supabase.from('subscription_plans').select('*').order('price_monthly'),
    supabase.from('trainers').select('plan_id, status, active_trainee_count'),
  ])

  const trainersByPlan = (trainers ?? []).reduce((acc, t) => {
    acc[t.plan_id] = (acc[t.plan_id] ?? 0) + 1
    return acc
  }, {} as Record<number, number>)

  const PLAN_COLORS: Record<string, string> = {
    free: '#52525b', gold: '#FACC15', platinum: '#8b5cf6',
    diamond: '#3b82f6', enterprise: '#10b981',
  }

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Subscriptions</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>Plan tiers and trainer distribution</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(plans ?? []).map(plan => {
          const count = trainersByPlan[plan.id] ?? 0
          const color = PLAN_COLORS[plan.name] ?? '#52525b'
          const max = Math.max(...Object.values(trainersByPlan), 1)

          return (
            <div key={plan.id} style={{
              background: '#161616', border: `1px solid ${count > 0 ? color + '20' : 'rgba(255,255,255,0.04)'}`,
              borderRadius: 13, padding: '20px 24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: count > 0 ? 14 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <div>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, textTransform: 'capitalize' }}>{plan.name}</span>
                    <span style={{ color: '#3f3f46', fontSize: 13, marginLeft: 10 }}>up to {plan.max_trainees === 9999 ? '∞' : plan.max_trainees} trainees</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ color: '#52525b', fontSize: 13 }}>
                    <span style={{ color: '#a1a1aa', fontWeight: 700 }}>{count}</span> trainer{count !== 1 ? 's' : ''}
                  </span>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>
                    {plan.price_monthly > 0 ? `$${plan.price_monthly}/mo` : 'Free'}
                  </span>
                </div>
              </div>
              {count > 0 && (
                <div style={{ height: 4, background: '#1f1f1f', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: color, borderRadius: 99, width: `${(count / max) * 100}%` }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
