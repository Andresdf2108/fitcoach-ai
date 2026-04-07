import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import {
  Home, Dumbbell, TrendingUp, ClipboardCheck,
  MessageCircle, CalendarDays, CreditCard,
} from 'lucide-react'

const NAV = [
  { label: 'Home',       href: '/trainee/dashboard', icon: Home },
  { label: 'Workouts',   href: '/trainee/workouts',  icon: Dumbbell },
  { label: 'Progress',   href: '/trainee/progress',  icon: TrendingUp },
  { label: 'Check-ins',  href: '/trainee/checkins',  icon: ClipboardCheck },
  { label: 'Messages',   href: '/trainee/messages',  icon: MessageCircle },
  { label: 'Sessions',   href: '/trainee/sessions',  icon: CalendarDays },
  { label: 'Billing',    href: '/trainee/billing',   icon: CreditCard },
]

export default async function TraineeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()

  if (profile?.role !== 'trainee') redirect('/auth/redirect')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar nav={NAV} role="trainee" userName={profile?.full_name ?? ''} />
      <main style={{ flex: 1, background: '#0f0f0f', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
