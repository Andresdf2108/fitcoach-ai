'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import {
  LogOut, Zap,
  LayoutDashboard, Target, Users, BookOpen,
  ClipboardCheck, MessageCircle, CalendarDays,
  CreditCard, BarChart3, Sparkles, Settings2,
  Home, Dumbbell, TrendingUp, Utensils,
  UserCheck, DollarSign, Package, LineChart,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const TRAINER_NAV: NavItem[] = [
  { label: 'Dashboard',    href: '/trainer/dashboard',  icon: LayoutDashboard },
  { label: 'Leads',        href: '/trainer/leads',      icon: Target },
  { label: 'Clients',      href: '/trainer/clients',    icon: Users },
  { label: 'Programs',     href: '/trainer/programs',   icon: BookOpen },
  { label: 'Check-ins',    href: '/trainer/checkins',   icon: ClipboardCheck },
  { label: 'Messages',     href: '/trainer/messages',   icon: MessageCircle },
  { label: 'Calendar',     href: '/trainer/calendar',   icon: CalendarDays },
  { label: 'Reports',      href: '/trainer/reports',    icon: BarChart3 },
  { label: 'AI Assistant', href: '/trainer/ai',         icon: Sparkles },
  { label: 'Settings',     href: '/trainer/settings',   icon: Settings2 },
]

const TRAINEE_NAV: NavItem[] = [
  { label: 'Home',       href: '/trainee/dashboard', icon: Home },
  { label: 'Workouts',   href: '/trainee/workouts',  icon: Dumbbell },
  { label: 'Progress',   href: '/trainee/progress',  icon: TrendingUp },
  { label: 'Check-ins',  href: '/trainee/checkins',  icon: ClipboardCheck },
  { label: 'Messages',   href: '/trainee/messages',  icon: MessageCircle },
  { label: 'Nutrition',  href: '/trainee/nutrition', icon: Utensils },
  { label: 'Sessions',   href: '/trainee/sessions',  icon: CalendarDays },
  { label: 'Billing',    href: '/trainee/billing',   icon: CreditCard },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview',      href: '/admin/dashboard',     icon: LayoutDashboard },
  { label: 'Trainers',      href: '/admin/trainers',      icon: UserCheck },
  { label: 'Trainees',      href: '/admin/trainees',      icon: Users },
  { label: 'Revenue',       href: '/admin/revenue',       icon: DollarSign },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: Package },
  { label: 'Analytics',     href: '/admin/analytics',     icon: LineChart },
  { label: 'AI Insights',   href: '/admin/ai-insights',   icon: Sparkles },
  { label: 'Settings',      href: '/admin/settings',      icon: Settings2 },
]

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  trainer: TRAINER_NAV,
  trainee: TRAINEE_NAV,
  admin:   ADMIN_NAV,
}

interface SidebarProps {
  role: string
  userName?: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const nav = NAV_BY_ROLE[role] ?? []
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside style={{
      width: 232, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: '18px 14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: '#FACC15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Zap size={16} color="#000" strokeWidth={2.5} fill="#000" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>FitCoach AI</div>
            <div style={{ fontSize: 9.5, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginTop: 2 }}>{role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? '#FACC15' : '#a1a1aa',
                background: active ? 'rgba(250,204,21,0.07)' : 'transparent',
              }}
            >
              <Icon
                size={14}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px 6px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {userName && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '7px 10px', marginBottom: 1,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: '#FACC15',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: '#000',
            }}>{initials}</div>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
            </div>
          </div>
        )}
        <form action={signOut}>
          <button type="submit" style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '7px 10px', borderRadius: 7, background: 'transparent',
            border: 'none', cursor: 'pointer', fontSize: 13, color: '#71717a', fontWeight: 400,
          }}>
            <LogOut size={13} strokeWidth={1.8} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
