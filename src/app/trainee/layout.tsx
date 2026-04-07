import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'

const NAV = [
  { label: 'Home',      href: '/trainee/dashboard', icon: '🏠' },
  { label: 'Workouts',  href: '/trainee/workouts',  icon: '💪' },
  { label: 'Progress',  href: '/trainee/progress',  icon: '📈' },
  { label: 'Check-ins', href: '/trainee/checkins',  icon: '✅' },
  { label: 'Messages',  href: '/trainee/messages',  icon: '💬' },
  { label: 'Sessions',  href: '/trainee/sessions',  icon: '📅' },
  { label: 'Billing',   href: '/trainee/billing',   icon: '💳' },
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
      <main style={{ flex: 1, background: '#111111', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
