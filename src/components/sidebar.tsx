'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

interface NavItem {
  label: string
  href: string
  icon: string
}

interface SidebarProps {
  nav: NavItem[]
  role: string
  userName?: string
}

export function Sidebar({ nav, role, userName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: '#0f0f0f', borderRight: '1px solid #1f1f1f', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1f1f1f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: '#EAB308',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 13, color: '#000', letterSpacing: '-0.5px',
          }}>FC</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>FitCoach AI</div>
            <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, textDecoration: 'none',
              fontSize: 13, fontWeight: active ? 700 : 500,
              background: active ? '#1a1a0a' : 'transparent',
              color: active ? '#EAB308' : '#9ca3af',
              borderLeft: active ? '3px solid #EAB308' : '3px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user + sign out */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #1f1f1f' }}>
        {userName && (
          <div style={{ padding: '8px 12px', marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Signed in as</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db', marginTop: 2 }}>{userName}</div>
          </div>
        )}
        <form action={signOut}>
          <button type="submit" style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10, background: 'transparent',
            border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280',
            fontWeight: 500,
          }}>
            <span style={{ fontSize: 15 }}>↩</span> Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
