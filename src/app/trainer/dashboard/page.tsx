import { createClient } from '@/lib/supabase/server'
import { Target, Users, ClipboardCheck, MessageCircle, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import TrainerBriefing from '@/components/trainer-briefing'

export default async function TrainerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: trainer }, { count: leadCount }, { count: clientCount }, { count: programCount }] =
    await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user!.id).single(),
      supabase.from('trainers').select('active_trainee_count, plan_id, subscription_plans(name, max_trainees)').eq('id', user!.id).single(),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
      supabase.from('trainees').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
      supabase.from('programs').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
    ])

  // Graceful fallback if migrations 003/004 haven't been run yet
  let pendingCheckins = 0
  let unreadMessages = 0
  try {
    const [{ count: ciCount }, { count: msgCount }] = await Promise.all([
      supabase
        .from('checkins')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', user!.id)
        .eq('reviewed', false),
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user!.id)
        .eq('read', false),
    ])
    pendingCheckins = ciCount ?? 0
    unreadMessages = msgCount ?? 0
  } catch {
    // Tables don't exist yet
  }

  const plan = (trainer as any)?.subscription_plans
  const activeCount = (trainer as any)?.active_trainee_count ?? 0
  const maxCount = plan?.max_trainees ?? 5
  const capacityPct = Math.min(Math.round((activeCount / maxCount) * 100), 100)
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Coach'

  const stats = [
    { label: 'Active Leads',      value: leadCount ?? 0,   icon: Target,         href: '/trainer/leads',    color: '#3b82f6' },
    { label: 'Active Clients',    value: clientCount ?? 0, icon: Users,          href: '/trainer/clients',  color: '#10b981' },
    { label: 'Pending Check-ins', value: pendingCheckins,  icon: ClipboardCheck, href: '/trainer/checkins', color: '#f59e0b' },
    { label: 'Unread Messages',   value: unreadMessages,   icon: MessageCircle,  href: '/trainer/messages', color: '#8b5cf6' },
  ]

  const quickLinks = [
    { label: 'Add a lead',          href: '/trainer/leads',    icon: Target },
    { label: 'View your clients',   href: '/trainer/clients',  icon: Users },
    { label: 'Review check-ins',    href: '/trainer/checkins', icon: ClipboardCheck },
    { label: 'See business report', href: '/trainer/reports',  icon: TrendingUp },
  ]

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <TrainerBriefing
        firstName={firstName}
        pendingCheckins={pendingCheckins}
        unreadMessages={unreadMessages}
        leadCount={leadCount ?? 0}
        clientCount={clientCount ?? 0}
      />
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>
          Good day, {firstName}
        </h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>Here&apos;s your coaching overview.</p>
      </div>

      {/* New-coach nudge: surface the template library before they build from scratch */}
      {(programCount ?? 0) === 0 && (
        <Link
          href="/trainer/programs"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            padding: '18px 22px', marginBottom: 20,
            background: 'linear-gradient(135deg, rgba(250,204,21,0.1) 0%, rgba(250,204,21,0.02) 100%)',
            border: '1px solid rgba(250,204,21,0.3)', borderRadius: 14,
            textDecoration: 'none',
          }}
        >
          <div>
            <p style={{ fontSize: 11, color: '#FACC15', fontWeight: 700, letterSpacing: '0.06em', margin: '0 0 4px' }}>NEW HERE? START IN MINUTES</p>
            <p style={{ fontSize: 15, color: '#fafafa', fontWeight: 600, margin: '0 0 4px' }}>Copy a starter program template</p>
            <p style={{ fontSize: 13, color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>24 ready-built programs across strength, weight loss, mobility, performance — clone, customize, assign.</p>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#FACC15', color: '#000', borderRadius: 9, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
            Browse templates <ArrowRight size={14} strokeWidth={2.4} />
          </span>
        </Link>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map(s => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#161616', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '20px 22px',
                transition: 'border-color 0.15s',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: `${s.color}15`,
                  border: `1px solid ${s.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  <Icon size={16} color={s.color} strokeWidth={2} />
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.03em' }}>{s.value}</p>
                <p style={{ fontSize: 12, color: '#52525b', margin: 0, fontWeight: 500 }}>{s.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Capacity + Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>

        {/* Capacity bar */}
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 3px', letterSpacing: '-0.01em' }}>Capacity</h2>
              <p style={{ fontSize: 12, color: '#52525b', margin: 0 }}>
                {activeCount} of {maxCount} trainees &nbsp;·&nbsp;
                <span style={{ color: '#FACC15', fontWeight: 600, textTransform: 'capitalize' }}>{plan?.name ?? 'Free'}</span>
              </p>
            </div>
            <span style={{
              fontSize: 18, fontWeight: 800,
              color: capacityPct >= 80 ? '#f59e0b' : '#FACC15',
              letterSpacing: '-0.02em',
            }}>{capacityPct}%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: '#1f1f1f', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${capacityPct}%`,
              background: capacityPct >= 100 ? '#ef4444' : capacityPct >= 80 ? '#f59e0b' : '#FACC15',
              transition: 'width 0.4s',
            }} />
          </div>
          {capacityPct >= 80 && (
            <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 10, margin: '10px 0 0' }}>
              {capacityPct >= 100 ? 'Capacity reached — upgrade to add more clients.' : 'Approaching capacity — consider upgrading.'}
            </p>
          )}
        </div>

        {/* Quick links */}
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.01em' }}>Quick actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {quickLinks.map(q => {
              const Icon = q.icon
              return (
                <Link key={q.label} href={q.href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
                  color: '#a1a1aa', fontSize: 13,
                  transition: 'color 0.1s, background 0.1s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Icon size={13} strokeWidth={1.8} />
                    {q.label}
                  </div>
                  <ArrowRight size={12} strokeWidth={1.8} style={{ opacity: 0.4 }} />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
