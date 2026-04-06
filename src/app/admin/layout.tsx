import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'

const NAV = [
  { label: 'Overview',       href: '/admin/dashboard',   icon: '📊' },
  { label: 'Trainers',       href: '/admin/trainers',    icon: '🏋️' },
  { label: 'Trainees',       href: '/admin/trainees',    icon: '👥' },
  { label: 'Revenue',        href: '/admin/revenue',     icon: '💰' },
  { label: 'Subscriptions',  href: '/admin/subscriptions', icon: '📦' },
  { label: 'Analytics',      href: '/admin/analytics',   icon: '📈' },
  { label: 'AI Insights',    href: '/admin/ai-insights', icon: '🤖' },
  { label: 'Settings',       href: '/admin/settings',    icon: '⚙️' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/auth/redirect')

  return (
    <div className="flex min-h-screen">
      <Sidebar title="FitCoach AI" nav={NAV} role="admin" />
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
