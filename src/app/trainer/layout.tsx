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
    .from('profiles').select('role, full_name').eq('id', user.id).single()

  if (profile?.role !== 'trainer') redirect('/auth/redirect')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar nav={NAV} role="trainer" userName={profile?.full_name ?? ''} />
      <main style={{ flex: 1, background: '#111111', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
