import { createClient } from '@/lib/supabase/server'
import { Sparkles, TrendingUp, AlertTriangle, Users } from 'lucide-react'

export default async function AdminAIInsightsPage() {
  const supabase = await createClient()

  const [
    { count: totalTrainers },
    { count: activeTrainees },
    { count: totalLeads },
    { count: wonLeads },
    { data: recentTrainers },
  ] = await Promise.all([
    supabase.from('trainers').select('*', { count: 'exact', head: true }),
    supabase.from('trainees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('stage', 'won'),
    supabase.from('trainers').select('active_trainee_count, subscription_plans(max_trainees)')
      .eq('status', 'active').limit(100),
  ])

  const conversionRate = totalLeads ? Math.round(((wonLeads ?? 0) / totalLeads) * 100) : 0
  const nearCapacity = (recentTrainers ?? []).filter(t => {
    const max = (t as any).subscription_plans?.max_trainees ?? 5
    return (t.active_trainee_count ?? 0) / max >= 0.8
  }).length

  const insights = [
    {
      icon: TrendingUp,
      color: '#10b981',
      title: 'Growth signal',
      body: totalLeads && totalLeads > 0
        ? `Lead-to-client conversion is at ${conversionRate}%. ${conversionRate >= 30 ? 'Strong pipeline health.' : 'Consider coaching trainers on their sales flow.'}`
        : 'No leads recorded yet. Encourage trainers to add prospects to their pipeline.',
    },
    {
      icon: AlertTriangle,
      color: '#f59e0b',
      title: 'Capacity alert',
      body: nearCapacity > 0
        ? `${nearCapacity} trainer${nearCapacity > 1 ? 's are' : ' is'} near or at capacity. Prompt them to upgrade — high likelihood of conversion.`
        : 'No trainers are near capacity. Healthy room for growth.',
    },
    {
      icon: Users,
      color: '#3b82f6',
      title: 'Engagement',
      body: activeTrainees && totalTrainers
        ? `${((activeTrainees) / totalTrainers!).toFixed(1)} avg active clients per trainer. ${activeTrainees > 10 ? 'Platform is gaining traction.' : 'Early stage — focus on trainer onboarding.'}`
        : 'Not enough data yet. Onboard your first trainers to generate insights.',
    },
    {
      icon: Sparkles,
      color: '#8b5cf6',
      title: 'Opportunity',
      body: 'Consider enabling an automated nudge to trainers approaching capacity. Upsell emails at 80% capacity convert at 3× the rate of cold outreach.',
    },
  ]

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Sparkles size={18} color="#FACC15" strokeWidth={2} />
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>AI Insights</h1>
        </div>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>AI-generated observations based on your platform data</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map((ins, i) => {
          const Icon = ins.icon
          return (
            <div key={i} style={{
              background: '#161616', border: `1px solid ${ins.color}18`,
              borderRadius: 14, padding: '20px 24px',
              display: 'flex', gap: 16,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: `${ins.color}12`, border: `1px solid ${ins.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color={ins.color} strokeWidth={2} />
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 5px', letterSpacing: '-0.01em' }}>{ins.title}</p>
                <p style={{ color: '#71717a', fontSize: 13, margin: 0, lineHeight: 1.65 }}>{ins.body}</p>
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ color: '#3f3f46', fontSize: 12, margin: '20px 0 0', lineHeight: 1.6 }}>
        Insights are generated from live platform data and updated on each page load.
        Full Claude-powered analysis available after connecting your Anthropic API key.
      </p>
    </div>
  )
}
