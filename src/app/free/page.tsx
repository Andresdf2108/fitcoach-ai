import Link from 'next/link'
import { Brain, Sparkles, ArrowRight } from 'lucide-react'
import FreeMindsetClient from './FreeMindsetClient'

export const metadata = {
  title: 'Free Mindset Check-in — FitCoach AI',
  description: 'A 30-second AI-powered mindset reflection. No signup required.',
}

export default function FreeMindsetPage() {
  return (
    <div style={{ background: '#070707', color: '#fafafa', minHeight: '100vh', fontFamily: 'var(--font-geist-sans, sans-serif)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#000' }}>FC</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>FitCoach AI</span>
        </Link>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href="/login" style={{ fontSize: 13, color: '#a1a1aa', textDecoration: 'none', padding: '7px 14px', borderRadius: 8 }}>Sign in</Link>
          <Link href="/signup" style={{ fontSize: 13, color: '#000', fontWeight: 700, textDecoration: 'none', padding: '8px 16px', background: '#FACC15', borderRadius: 8 }}>Sign up free</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', fontSize: 11, color: '#FACC15', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 20 }}>
            <Sparkles size={12} strokeWidth={2.4} />
            FREE · NO SIGNUP NEEDED
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, margin: '0 0 18px' }}>
            A 30-second mindset<br />check-in.
          </h1>
          <p style={{ fontSize: 17, color: '#a1a1aa', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
            Workouts move your body. This moves your head. Three sliders, three optional notes, one personalized reflection from Claude.
          </p>
        </div>

        <FreeMindsetClient />

        <div style={{ marginTop: 60, padding: '28px 28px', background: '#101010', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Brain size={14} color="#FACC15" strokeWidth={2.2} />
              <span style={{ fontSize: 11, color: '#FACC15', fontWeight: 700, letterSpacing: '0.06em' }}>FOR COACHES</span>
            </div>
            <p style={{ fontSize: 15, color: '#fafafa', fontWeight: 600, margin: '0 0 4px' }}>Track this for every client, every day.</p>
            <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>See trends, intervene early, retain longer.</p>
          </div>
          <Link href="/coaches" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#FACC15', color: '#000', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            See coach plans <ArrowRight size={14} strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </div>
  )
}
