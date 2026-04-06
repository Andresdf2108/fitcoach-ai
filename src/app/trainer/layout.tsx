import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'

const NAV = [
  { label: 'Dashboard',    href: '/trainer/dashboard',  icon: '🏠' },
  { label: 'Leads',        href: '/trainer/leads',      icon: '🎯' },
  { label: 'Clients',      href: '/trainer/clients',    icon: '👥' },
  { label: 'Programs',     href: '/trainer/programs',   icon: '📋' },
  { label: 'Check-ins',    href: '/trainer/checkins',   icon: '✅' },
  { label: 'Messages',     href: '/trainer/messages',   icon: '💬' },
  { label: 'Calendar',     href: '/trainer/calendar',   icon: '📅' },
  { label: 'Billing',      href: '/trainer/billing',    icon: '💳' },
  { label: 'Reports',      href: '/trainer/reports',    icon: '📊' },
  { label: 'AI Assistant', href: '/trainer/ai',         icon: '🤖' },
  { label: 'Settings',     href: '/trainer/settings',   icon: '⚙️' },
]

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'trainer') redirect('/auth/redirect')

  return (
    <div className="flex min-h-screen">
      <Sidebar title="FitCoach AI" nav={NAV} role="trainer" />
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
