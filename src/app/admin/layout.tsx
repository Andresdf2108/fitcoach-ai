import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import {
  LayoutDashboard, UserCheck, Users, DollarSign,
  Package, LineChart, Sparkles, Settings2,
} from 'lucide-react'

const NAV = [
  { label: 'Overview',      href: '/admin/dashboard',     icon: LayoutDashboard },
  { label: 'Trainers',      href: '/admin/trainers',      icon: UserCheck },
  { label: 'Trainees',      href: '/admin/trainees',      icon: Users },
  { label: 'Revenue',       href: '/admin/revenue',       icon: DollarSign },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: Package },
  { label: 'Analytics',     href: '/admin/analytics',     icon: LineChart },
  { label: 'AI Insights',   href: '/admin/ai-insights',   icon: Sparkles },
  { label: 'Settings',      href: '/admin/settings',      icon: Settings2 },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/auth/redirect')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar nav={NAV} role="admin" userName={profile?.full_name ?? ''} />
      <main style={{ flex: 1, background: '#0f0f0f', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
