import { createClient } from '@/lib/supabase/server'

const PLAN_PRICE: Record<string, number> = { free: 0, gold: 49, platinum: 99, diamond: 199, enterprise: 499 }

export default async function AdminRevenuePage() {
  const supabase = await createClient()

  const { data: trainers } = await supabase
    .from('trainers')
    .select('status, subscription_plans(name, price_monthly)')
    .eq('status', 'active')

  const mrr = (trainers ?? []).reduce((sum, t) => {
    const price = (t as any).subscription_plans?.price_monthly ?? 0
    return sum + Number(price)
  }, 0)

  const arr = mrr * 12

  const byPlan: Record<string, number> = {}
  for (const t of trainers ?? []) {
    const name = (t as any).subscription_plans?.name ?? 'free'
    byPlan[name] = (byPlan[name] ?? 0) + 1
  }

  const planRevenue = Object.entries(byPlan).map(([name, count]) => ({
    name, count,
    revenue: (PLAN_PRICE[name] ?? 0) * count,
    color: { free: '#52525b', gold: '#FACC15', platinum: '#8b5cf6', diamond: '#3b82f6', enterprise: '#10b981' }[name] ?? '#52525b',
  })).sort((a, b) => b.revenue - a.revenue)

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Revenue</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>Platform subscription revenue</p>
      </div>

      {/* MRR / ARR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'MRR', value: fmt(mrr), color: '#FACC15' },
          { label: 'ARR', value: fmt(arr), color: '#10b981' },
          { label: 'Paying trainers', value: planRevenue.filter(p => p.name !== 'free').reduce((s, p) => s + p.count, 0), color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px' }}>
            <p style={{ color: '#52525b', fontSize: 12, margin: '0 0 8px', fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: 0, letterSpacing: '-0.03em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* By plan */}
      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px' }}>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 18px', letterSpacing: '-0.01em' }}>Revenue by plan</h2>
        {planRevenue.length === 0 && <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>No active subscriptions yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {planRevenue.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 600, textTransform: 'capitalize', width: 100 }}>{p.name}</span>
              <span style={{ color: '#52525b', fontSize: 13, width: 60 }}>{p.count} trainer{p.count !== 1 ? 's' : ''}</span>
              <div style={{ flex: 1, height: 5, background: '#1f1f1f', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: p.color, borderRadius: 99, width: mrr > 0 ? `${(p.revenue / mrr) * 100}%` : '0%' }} />
              </div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, width: 70, textAlign: 'right' }}>{fmt(p.revenue)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
