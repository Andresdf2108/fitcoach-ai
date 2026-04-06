'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  icon: string
}

interface SidebarProps {
  title: string
  nav: NavItem[]
  role: string
}

export function Sidebar({ title, nav, role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-600',
    trainer: 'bg-blue-600',
    trainee: 'bg-emerald-600',
  }

  return (
    <aside className={`w-60 min-h-screen flex flex-col ${roleColors[role] ?? 'bg-gray-800'} text-white`}>
      <div className="px-5 py-6 border-b border-white/10">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{role}</p>
        <h1 className="text-lg font-bold mt-0.5">{title}</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-white/20 font-medium' : 'hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          <span>↩</span> Sign out
        </button>
      </div>
    </aside>
  )
}
