import { createClient } from '@/lib/supabase/server'
import { Dumbbell, Flame, ClipboardCheck, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default async function TraineeDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user!.id).single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Athlete'

  const cards = [
    { label: "Today's Workout",  value: 'Not assigned yet', icon: Dumbbell,       href: '/trainee/workouts',  color: '#EAB308' },
    { label: 'Current Streak',   value: '0 days',           icon: Flame,          href: '/trainee/progress',  color: '#f59e0b' },
    { label: 'Pending Check-in', value: 'None due',         icon: ClipboardCheck, href: '/trainee/checkins',  color: '#10b981' },
    { label: 'New Messages',     value: '0',                icon: MessageCircle,  href: '/trainee/messages',  color: '#8b5cf6' },
  ]

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>
          Let&apos;s go, {firstName}
        </h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>Your coaching hub.</p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        {cards.map(c => {
          const Icon = c.icon
          return (
            <Link key={c.label} href={c.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#161616', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '22px 24px',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${c.color}12`,
                  border: `1px solid ${c.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={17} color={c.color} strokeWidth={2} />
                </div>
                <p style={{ fontSize: 12, color: '#52525b', margin: '0 0 4px', fontWeight: 500 }}>{c.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{c.value}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Getting started */}
      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Getting started</h2>
        <p style={{ color: '#52525b', fontSize: 13, margin: 0, lineHeight: 1.7 }}>
          Your trainer will assign your first program shortly. Check back here for workouts, progress tracking, and messages from your coach.
        </p>
      </div>
    </div>
  )
}
