'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const SESSION_KEY = 'trainer_briefing_shown'
const VISITED_KEY = 'trainer_dashboard_visited'

interface Props {
  firstName: string
  pendingCheckins: number
  unreadMessages: number
  leadCount: number
  clientCount: number
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDay() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function TrainerBriefing({ firstName, pendingCheckins, unreadMessages, leadCount, clientCount }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem(VISITED_KEY)
    if (!hasVisitedBefore) {
      localStorage.setItem(VISITED_KEY, '1')
      return
    }
    if (!sessionStorage.getItem(SESSION_KEY)) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const items = [
    pendingCheckins > 0
      ? { icon: '📋', text: `${pendingCheckins} check-in${pendingCheckins > 1 ? 's' : ''} waiting for your review`, href: '/trainer/checkins', urgent: true }
      : { icon: '📋', text: 'No pending check-ins — all caught up!', href: '/trainer/checkins', urgent: false },
    unreadMessages > 0
      ? { icon: '💬', text: `${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''} from your clients`, href: '/trainer/messages', urgent: true }
      : { icon: '💬', text: 'No new messages', href: '/trainer/messages', urgent: false },
    { icon: '👥', text: `${clientCount} active client${clientCount !== 1 ? 's' : ''} in your roster`, href: '/trainer/clients', urgent: false },
    leadCount > 0
      ? { icon: '🎯', text: `${leadCount} lead${leadCount > 1 ? 's' : ''} in your pipeline`, href: '/trainer/leads', urgent: false }
      : { icon: '🎯', text: 'No active leads — time to grow!', href: '/trainer/leads', urgent: false },
  ]

  const urgentCount = [pendingCheckins > 0, unreadMessages > 0].filter(Boolean).length

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 500,
        background: '#111', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>

        {/* Header */}
        <div style={{
          padding: '32px 32px 24px',
          background: 'linear-gradient(135deg, rgba(234,179,8,0.12) 0%, rgba(234,179,8,0.04) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, color: '#FACC15', fontWeight: 800, letterSpacing: '0.1em', margin: '0 0 8px' }}>
                DAILY BRIEFING
              </p>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: '0 0 5px', letterSpacing: '-0.03em' }}>
                {getGreeting()}, {firstName}! 👋
              </h2>
              <p style={{ fontSize: 13, color: '#737373', margin: 0 }}>{getDay()}</p>
            </div>
            <button
              onClick={dismiss}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#737373', fontSize: 16, flexShrink: 0 }}
            >
              ×
            </button>
          </div>

          {urgentCount > 0 && (
            <div style={{ marginTop: 16, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 10, padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FACC15', display: 'inline-block', boxShadow: '0 0 8px rgba(234,179,8,0.6)' }} />
              <span style={{ fontSize: 13, color: '#FACC15', fontWeight: 600 }}>
                {urgentCount === 1 ? '1 item needs your attention today' : `${urgentCount} items need your attention today`}
              </span>
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(({ icon, text, href, urgent }) => (
            <Link key={href} href={href} onClick={dismiss} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 16px', borderRadius: 12,
                background: urgent ? 'rgba(234,179,8,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${urgent ? 'rgba(234,179,8,0.18)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'background 0.15s',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 14, color: urgent ? '#e5e5e5' : '#a3a3a3', fontWeight: urgent ? 600 : 400, flex: 1 }}>{text}</span>
                {urgent && <span style={{ fontSize: 11, color: '#FACC15', fontWeight: 700 }}>→</span>}
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 24px', display: 'flex', gap: 10 }}>
          <button
            onClick={dismiss}
            style={{ flex: 1, height: 46, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#737373', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Skip for now
          </button>
          <button
            onClick={dismiss}
            style={{ flex: 2, height: 46, background: '#FACC15', border: 'none', borderRadius: 12, color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: '0 4px 16px rgba(234,179,8,0.35)' }}
          >
            Let's get to work →
          </button>
        </div>
      </div>
    </div>
  )
}
