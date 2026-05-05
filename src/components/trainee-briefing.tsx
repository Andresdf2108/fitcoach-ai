'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const SESSION_KEY = 'trainee_briefing_shown'
const VISITED_KEY = 'trainee_dashboard_visited'

interface Props {
  firstName: string
  streak: number
  pendingCheckin: boolean
  unreadMessages: number
  hasWorkoutToday: boolean
  workoutName: string
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

function getMotivation(streak: number): string {
  if (streak === 0) return "Today's a great day to start your streak. Let's go! 🔥"
  if (streak < 7) return `${streak}-day streak — you're building momentum. Don't stop now! 💪`
  if (streak < 30) return `${streak}-day streak! You're on a serious roll. Keep pushing! 🚀`
  return `${streak}-day streak — you're an absolute machine. Legendary consistency! 🏆`
}

export default function TraineeBriefing({ firstName, streak, pendingCheckin, unreadMessages, hasWorkoutToday, workoutName }: Props) {
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
    hasWorkoutToday
      ? { icon: '🏋️', text: `Today: ${workoutName}`, href: '/trainee/workouts', highlight: true }
      : { icon: '🏋️', text: 'No workout assigned yet — check back soon', href: '/trainee/workouts', highlight: false },
    { icon: '🔥', text: getMotivation(streak), href: '/trainee/progress', highlight: streak > 0 },
    pendingCheckin
      ? { icon: '✅', text: 'Your weekly check-in is due — your coach is waiting!', href: '/trainee/checkins', highlight: true }
      : { icon: '✅', text: 'Check-in submitted — great job staying accountable', href: '/trainee/checkins', highlight: false },
    unreadMessages > 0
      ? { icon: '💬', text: `${unreadMessages} new message${unreadMessages > 1 ? 's' : ''} from your coach`, href: '/trainee/messages', highlight: true }
      : { icon: '💬', text: 'No new messages from your coach', href: '/trainee/messages', highlight: false },
  ]

  const actionItems = items.filter(i => i.highlight).length

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
          background: 'linear-gradient(135deg, rgba(74,222,128,0.1) 0%, rgba(74,222,128,0.03) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, color: '#4ade80', fontWeight: 800, letterSpacing: '0.1em', margin: '0 0 8px' }}>
                YOUR DAILY BRIEF
              </p>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: '0 0 5px', letterSpacing: '-0.03em' }}>
                {getGreeting()}, {firstName}! 💪
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

          {hasWorkoutToday && (
            <div style={{ marginTop: 16, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px rgba(74,222,128,0.6)' }} />
              <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>
                {actionItems > 0 ? `${actionItems} thing${actionItems > 1 ? 's' : ''} to do today` : "You're all caught up — go crush that workout!"}
              </span>
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(({ icon, text, href, highlight }) => (
            <Link key={href} href={href} onClick={dismiss} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '13px 16px', borderRadius: 12,
                background: highlight ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${highlight ? 'rgba(74,222,128,0.18)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <span style={{ fontSize: 14, color: highlight ? '#e5e5e5' : '#a3a3a3', fontWeight: highlight ? 600 : 400, flex: 1, lineHeight: 1.5 }}>{text}</span>
                {highlight && <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>→</span>}
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
            Skip
          </button>
          <button
            onClick={dismiss}
            style={{ flex: 2, height: 46, background: '#FACC15', border: 'none', borderRadius: 12, color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: '0 4px 16px rgba(234,179,8,0.35)' }}
          >
            {hasWorkoutToday ? "Let's train →" : "Let's go →"}
          </button>
        </div>
      </div>
    </div>
  )
}
