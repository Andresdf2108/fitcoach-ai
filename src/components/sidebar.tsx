'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { LogOut, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface SidebarProps {
  nav: NavItem[]
  role: string
  userName?: string
}

export function Sidebar({ nav, role, userName }: SidebarProps) {
  const pathname = usePathname()
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
            background: 'linear-gradient(135deg, #EAB308 0%, #a16207 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(234,179,8,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
            flexShrink: 0,
          }}>
            <Zap size={16} color="#000" strokeWidth={3} fill="#000" />
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
                color: active ? '#EAB308' : '#52525b',
                background: active ? 'rgba(234,179,8,0.07)' : 'transparent',
                transition: 'color 0.1s, background 0.1s',
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
              background: 'linear-gradient(135deg, #EAB308, #a16207)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: '#000',
              boxShadow: '0 0 8px rgba(234,179,8,0.3)',
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
            border: 'none', cursor: 'pointer', fontSize: 13, color: '#3f3f46', fontWeight: 400,
          }}>
            <LogOut size={13} strokeWidth={1.8} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
