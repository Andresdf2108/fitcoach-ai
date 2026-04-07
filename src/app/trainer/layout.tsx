import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import {
  LayoutDashboard, Target, Users, BookOpen,
  ClipboardCheck, MessageCircle, CalendarDays,
  CreditCard, BarChart3, Sparkles, Settings2,
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard',    href: '/trainer/dashboard',  icon: LayoutDashboard },
  { label: 'Leads',        href: '/trainer/leads',      icon: Target },
  { label: 'Clients',      href: '/trainer/clients',    icon: Users },
  { label: 'Programs',     href: '/trainer/programs',   icon: BookOpen },
  { label: 'Check-ins',    href: '/trainer/checkins',   icon: ClipboardCheck },
  { label: 'Messages',     href: '/trainer/messages',   icon: MessageCircle },
  { label: 'Calendar',     href: '/trainer/calendar',   icon: CalendarDays },
  { label: 'Billing',      href: '/trainer/billing',    icon: CreditCard },
  { label: 'Reports',      href: '/trainer/reports',    icon: BarChart3 },
  { label: 'AI Assistant', href: '/trainer/ai',         icon: Sparkles },
  { label: 'Settings',     href: '/trainer/settings',   icon: Settings2 },
]

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()

  if (profile?.role !== 'trainer') redirect('/auth/redirect')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar nav={NAV} role="trainer" userName={profile?.full_name ?? ''} />
      <main style={{ flex: 1, background: '#0f0f0f', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
