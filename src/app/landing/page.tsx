import Link from 'next/link'
import { Brain, Video, BookOpen, CalendarDays, Sparkles, ArrowRight, Check } from 'lucide-react'

export const metadata = {
  title: 'For Online Coaches — FitCoach AI',
  description: 'The coaching platform built around what online coaches actually need: structure, custom video, mindset, and templates that scale.',
}

export default function LandingPage() {
  return (
    <div style={{ background: '#070707', color: '#fafafa', minHeight: '100vh', fontFamily: 'var(--font-geist-sans, sans-serif)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,7,7,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#000' }}>FC</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>FitCoach AI</span>
        </Link>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href="/free" style={{ fontSize: 13, color: '#a1a1aa', textDecoration: 'none', padding: '7px 14px', borderRadius: 8 }}>Free mindset tool</Link>
          <Link href="/login" style={{ fontSize: 13, color: '#a1a1aa', textDecoration: 'none', padding: '7px 14px', borderRadius: 8 }}>Sign in</Link>
          <Link href="/signup" style={{ fontSize: 13, color: '#000', fontWeight: 700, textDecoration: 'none', padding: '8px 16px', background: '#FACC15', borderRadius: 8 }}>Start free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', fontSize: 11, color: '#FACC15', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 24 }}>
          <Sparkles size={12} strokeWidth={2.4} />
          BUILT WITH FEEDBACK FROM ONLINE COACHES
        </div>
        <h1 style={{ fontSize: 'clamp(44px, 7vw, 72px)', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 1.02, margin: '0 0 24px' }}>
          Coaching software that<br />actually fits how you coach.
        </h1>
        <p style={{ fontSize: 19, color: '#a1a1aa', lineHeight: 1.65, maxWidth: 640, margin: '0 auto 36px' }}>
          Most platforms make you bend to their workflow. FitCoach is built around the things real online coaches told us actually move clients: structure, your face on the screen, mindset, and starting points that don&apos;t take a week to build.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#FACC15', color: '#000', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 28px rgba(234,179,8,0.4)' }}>
            Start free — no card <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
          <Link href="/free" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'rgba(255,255,255,0.04)', color: '#fafafa', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            Try the mindset tool
          </Link>
        </div>
      </section>

      {/* Four pillars */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: '#FACC15', fontWeight: 700, letterSpacing: '0.1em', margin: '0 0 10px' }}>WHY COACHES PICK FITCOACH</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Four things you can&apos;t fake.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <Pillar
            icon={Brain}
            title="Mindset, not just sets and reps"
            quote="“Adding the mindset component is what will actually differentiate your app — depth beyond workouts.”"
            body="Daily check-ins for clients. Trend dashboard for coaches. Spot the dip a week before they ghost."
          />
          <Pillar
            icon={Video}
            title="Your face. Your form."
            quote="“Coaches filming their own exercises adds a lot — clients connect more vs. a generic demo.”"
            body="Upload custom video for any movement. Clients see you, not a stock model. Built-in storage, no extra tools."
          />
          <Pillar
            icon={CalendarDays}
            title="Structure that removes guesswork"
            quote="“Keeps clients clear on what they're doing each day. Structure is key.”"
            body="Calendar-first program delivery. Each day has a plan, a video, a check-in. Nothing for clients to figure out."
          />
          <Pillar
            icon={BookOpen}
            title="Templates so day one isn't blank"
            quote="“Templates would be great for new coaches starting up on the app.”"
            body="Starter programs you can clone and customize. Up and selling in an afternoon, not a month."
          />
        </div>
      </section>

      {/* Includes */}
      <section style={{ padding: '60px 24px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '36px 40px' }}>
          <p style={{ fontSize: 11, color: '#FACC15', fontWeight: 700, letterSpacing: '0.1em', margin: '0 0 8px' }}>EVERY PLAN INCLUDES</p>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 22px', letterSpacing: '-0.02em' }}>The full coaching OS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px 28px' }}>
            {[
              'AI assistant trained on your business',
              'Lead pipeline with CRM stages',
              'Client check-ins with photo + nutrition',
              'Drag-and-drop program builder',
              'Coach-filmed exercise videos',
              'Daily mindset module',
              'Calendar + session scheduling',
              'Trainee onboarding wizard',
              'Reports on retention & revenue',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Check size={15} color="#FACC15" strokeWidth={2.4} />
                <span style={{ fontSize: 14, color: '#d4d4d8' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '40px 24px 100px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 16px' }}>Try it before you commit.</h2>
        <p style={{ fontSize: 16, color: '#a1a1aa', lineHeight: 1.65, margin: '0 0 28px' }}>
          The free plan covers your first 5 clients. No card. No sales call. Get out of spreadsheets in an afternoon.
        </p>
        <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#FACC15', color: '#000', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Create your coach account <ArrowRight size={16} strokeWidth={2.4} />
        </Link>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#52525b' }}>
        <span>© FitCoach AI</span>
        <div style={{ display: 'flex', gap: 18 }}>
          <Link href="/" style={{ color: '#71717a', textDecoration: 'none' }}>Home</Link>
          <Link href="/coaches" style={{ color: '#71717a', textDecoration: 'none' }}>For Coaches</Link>
          <Link href="/trainees" style={{ color: '#71717a', textDecoration: 'none' }}>For Trainees</Link>
        </div>
      </footer>
    </div>
  )
}

function Pillar({ icon: Icon, title, quote, body }: { icon: any; title: string; quote: string; body: string }) {
  return (
    <div style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px 24px' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon size={17} color="#FACC15" strokeWidth={2.2} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.02em', color: '#fafafa' }}>{title}</h3>
      <p style={{ fontSize: 13, color: '#FACC15', fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.55, opacity: 0.85 }}>{quote}</p>
      <p style={{ fontSize: 14, color: '#a1a1aa', margin: 0, lineHeight: 1.65 }}>{body}</p>
    </div>
  )
}
