'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const PHOTOS = {
  hero:    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80',
  break1:  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80',
  gallery1:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=600&q=80',
  gallery2:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
  gallery3:'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=600&q=80',
  feat1:   'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=800&q=80',
  feat2:   'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
  feat3:   'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
}

const features = [
  { icon: '👥', title: 'Client & Lead Pipeline', desc: 'Track every prospect from first inquiry to long-term client. See exactly who needs follow-up, who is crushing it, and who might churn — all in one dashboard.' },
  { icon: '🤖', title: 'AI Coaching Assistant', desc: 'Your AI co-coach is always on. Draft programs, write check-in feedback, craft client emails, and brainstorm business strategy in seconds — powered by Claude.' },
  { icon: '📋', title: 'Program Builder', desc: 'Build reusable, professional workout programs with a drag-and-drop editor. Assign to any client in one click. No more copy-pasting spreadsheets.' },
  { icon: '✅', title: 'Weekly Check-ins', desc: "Clients submit structured check-ins every week. You review, leave video or text feedback, and adjust their plan — all without a single WhatsApp message." },
  { icon: '💬', title: 'Built-in Messaging', desc: 'One inbox for all your clients. No more scattered DMs across Instagram, WhatsApp, and email. Everything is searchable and in context.' },
  { icon: '📊', title: 'Business Reports', desc: 'See your revenue trends, client retention, check-in completion rates, and more. Know exactly where your business stands at all times.' },
]

const testimonials = [
  { name: 'Marcus Webb', title: 'Online Strength Coach · 47 clients', quote: "I used to spend 3 hours on Sundays just reviewing check-ins and replying to messages. Now I do it in 30 minutes. The AI drafts the feedback and I just tweak it. It's honestly changed my life.", avatar: 'MW', color: '#FACC15' },
  { name: 'Sofia Reyes', title: 'Nutrition & Fitness Coach · 31 clients', quote: "The program builder alone was worth it. I used to build every plan from scratch in Google Docs. Now I have templates for everything and assigning a new program takes literally 10 seconds.", avatar: 'SR', color: '#4ade80' },
  { name: 'James Okafor', title: 'Performance Coach · 62 clients', quote: "Scaling past 50 clients felt impossible before this. The lead pipeline and messaging system means nothing falls through the cracks. I finally feel like I'm running a real business.", avatar: 'JO', color: '#60a5fa' },
]

const problems = [
  { before: 'Spreadsheets for client tracking', after: 'Live client dashboard' },
  { before: 'WhatsApp flooded with check-ins', after: 'Structured weekly check-ins' },
  { before: 'Writing programs from scratch', after: 'Reusable program templates' },
  { before: 'Guessing your monthly revenue', after: 'Real-time business reports' },
]

const bigFeatures = [
  { photo: PHOTOS.feat1, icon: '👥', title: 'Every client. One dashboard.', desc: "Track every client's progress, check-in history, and program in one place. No more spreadsheets, no more sticky notes, no more guessing who needs follow-up." },
  { photo: PHOTOS.feat2, icon: '📋', title: 'Programs that write themselves.', desc: 'Build reusable templates once. Assign to any client in seconds. Our AI can generate a full 12-week program from a single prompt — you just personalize and send.' },
  { photo: PHOTOS.feat3, icon: '📊', title: 'Know your numbers.', desc: "Revenue, client retention, check-in completion, capacity — all live. You'll always know exactly where your business stands and what to focus on next." },
]

export default function CoachesPage() {
  const [scrollY, setScrollY] = useState(0)
  const sectionsRef = useRef<NodeListOf<Element> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    sectionsRef.current = els
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ background: '#0a0a0a', color: 'white', minHeight: '100vh', fontFamily: 'var(--font-geist-sans, sans-serif)' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 4px 24px rgba(234,179,8,0.4); }
          50%       { box-shadow: 0 6px 48px rgba(234,179,8,0.75); }
        }
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .feature-card:hover { border-color: rgba(234,179,8,0.3) !important; transform: translateY(-4px); }
        .feature-card { transition: border-color 0.2s, transform 0.2s; }
        .cta-btn { animation: pulseGlow 2.5s ease-in-out infinite; }
        .float { animation: float 4s ease-in-out infinite; }
        .photo-card:hover .photo-card-img { transform: scale(1.06); }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        position: 'fixed', top: 0, left: 0, right: 0,
        background: scrollY > 40 ? 'rgba(10,10,10,0.96)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        zIndex: 100, transition: 'all 0.3s',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#000', boxShadow: '0 0 18px rgba(234,179,8,0.4)' }}>FC</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>FitCoach AI</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/trainees" style={{ fontSize: 13, color: '#71717a', fontWeight: 500, textDecoration: 'none', padding: '8px 16px' }}>For Trainees</Link>
          <Link href="/login" style={{ fontSize: 13, color: 'white', fontWeight: 600, textDecoration: 'none', padding: '9px 18px', background: 'rgba(255,255,255,0.07)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>Sign in</Link>
          <Link href="/onboarding/trainer" style={{ fontSize: 13, color: '#000', fontWeight: 700, textDecoration: 'none', padding: '9px 20px', background: '#FACC15', borderRadius: 8, boxShadow: '0 2px 12px rgba(234,179,8,0.35)' }}>Get early access →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: 0, right: 0, bottom: '-15%', backgroundImage: `url(${PHOTOS.hero})`, backgroundSize: 'cover', backgroundPosition: 'center', transform: `translateY(${scrollY * 0.35}px)`, willChange: 'transform' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: ['linear-gradient(to bottom, transparent 40%, #0a0a0a 100%)', 'linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.72))'].join(', ') }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 900, margin: '0 auto', paddingTop: 80 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 999, padding: '6px 16px', fontSize: 11, color: '#FACC15', marginBottom: 32, letterSpacing: '0.1em', fontWeight: 800, animation: 'fadeSlideUp 0.6s ease both' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }} />
            BUILT FOR COACHES
          </div>
          <h1 style={{ fontSize: 'clamp(46px, 8vw, 86px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.05em', margin: '0 0 24px', color: 'white', animation: 'fadeSlideUp 0.7s 0.15s ease both' }}>
            The operating system<br />for serious <span style={{ color: '#FACC15' }}>coaches.</span>
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 44px', fontWeight: 400, animation: 'fadeSlideUp 0.7s 0.3s ease both' }}>
            Manage every client, lead, program, and check-in from one place — with an AI assistant that helps you do in minutes what used to take hours.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeSlideUp 0.7s 0.45s ease both' }}>
            <Link href="/onboarding/trainer" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#000', textDecoration: 'none', padding: '15px 34px', background: '#FACC15', borderRadius: 10, letterSpacing: '-0.01em' }}>
              Get early access — it&apos;s free →
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '15px 34px', background: 'rgba(255,255,255,0.06)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}>
              Sign in
            </Link>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'fadeSlideUp 0.8s 0.8s ease both' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', fontWeight: 600 }}>SCROLL</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="reveal" style={{ maxWidth: 800, margin: '0 auto', padding: '64px 48px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 2, border: '1px solid rgba(255,255,255,0.07)' }}>
          {[{ value: '3×', label: 'faster client onboarding' }, { value: '80%', label: 'less admin time' }, { value: 'AI', label: 'at every step' }].map(({ value, label }) => (
            <div key={label} style={{ padding: '24px 32px', textAlign: 'center', borderRadius: 18, background: '#111' }}>
              <p style={{ fontSize: 34, fontWeight: 900, color: '#FACC15', margin: 0, letterSpacing: '-0.04em' }}>{value}</p>
              <p style={{ fontSize: 11, color: '#52525b', margin: '6px 0 0', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Photo gallery strip ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { photo: PHOTOS.gallery1, label: 'Online Coaching' },
            { photo: PHOTOS.gallery2, label: 'Strength Programs' },
            { photo: PHOTOS.gallery3, label: 'Client Results' },
          ].map(({ photo, label }, i) => (
            <div key={label} className={`reveal reveal-delay-${i + 1} photo-card`} style={{ position: 'relative', height: 240, borderRadius: 18, overflow: 'hidden', cursor: 'default' }}>
              <div className="photo-card-img" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%)' }} />
              <div style={{ position: 'absolute', bottom: 18, left: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '0.06em' }}>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="reveal" style={{ maxWidth: 860, margin: '0 auto', padding: '0 48px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#FACC15', letterSpacing: '0.12em', marginBottom: 14 }}>THE DIFFERENCE</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Stop duct-taping your business together.</h2>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {problems.map(({ before, after }, i) => (
            <div key={before} className={`reveal reveal-delay-${i + 1}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16, background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 16 }}>😤</span><span style={{ fontSize: 14, color: '#52525b', textDecoration: 'line-through', fontWeight: 500 }}>{before}</span></div>
              <span style={{ fontSize: 18, color: '#FACC15', fontWeight: 900 }}>→</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 16 }}>✅</span><span style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>{after}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Full-bleed photo break ── */}
      <div style={{ position: 'relative', height: 440, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: 0, right: 0, bottom: '-20%', backgroundImage: `url(${PHOTOS.break1})`, backgroundSize: 'cover', backgroundPosition: 'center 40%', transform: `translateY(${(scrollY - 1800) * 0.2}px)`, willChange: 'transform' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.68)' }} />
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px' }}>
          <p style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', margin: '0 0 16px', lineHeight: 1.1 }}>
            Scale your coaching.<br /><span style={{ color: '#FACC15' }}>Without burning out.</span>
          </p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 440, margin: '0 0 32px' }}>Handle more clients, deliver better results, and spend less time on admin than ever before.</p>
          <Link href="/onboarding/trainer" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 700, color: '#000', textDecoration: 'none', padding: '12px 28px', background: '#FACC15', borderRadius: 10 }}>
            Start for free →
          </Link>
        </div>
      </div>

      {/* ── Big feature photo cards ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 48px 60px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#FACC15', letterSpacing: '0.12em', marginBottom: 14 }}>BUILT FOR GROWTH</p>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Everything you need to run a serious coaching business.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {bigFeatures.map(({ photo, icon, title, desc }, i) => (
            <div key={title} className={`reveal reveal-delay-${i + 1} photo-card`} style={{ position: 'relative', height: 380, borderRadius: 20, overflow: 'hidden', cursor: 'default' }}>
              <div className="photo-card-img" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.6s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.05) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, padding: '28px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 }}>{icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: 0, lineHeight: 1.65 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Full features grid ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 100px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#FACC15', letterSpacing: '0.12em', marginBottom: 14 }}>ALL FEATURES</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>One platform. Zero excuses.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {features.map(({ icon, title, desc }, i) => (
            <div key={title} className={`reveal reveal-delay-${(i % 3) + 1} feature-card`} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '26px 24px', cursor: 'default' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(234,179,8,0.09)', border: '1px solid rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#52525b', margin: 0, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Spotlight ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 100px' }}>
        <div className="reveal" style={{ background: '#111', border: '1px solid rgba(234,179,8,0.15)', borderRadius: 24, padding: '64px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.18)', borderRadius: 999, padding: '5px 14px', fontSize: 11, color: '#FACC15', marginBottom: 24, letterSpacing: '0.1em', fontWeight: 800 }}>🤖 AI ASSISTANT</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 18px', lineHeight: 1.1 }}>Your AI coach<br />works 24/7.</h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, margin: '0 0 28px' }}>Powered by Claude, the AI assistant understands your clients, your programs, and your coaching style. Ask it anything — from drafting a 12-week program to writing a motivation message to a struggling client.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Draft full workout programs in seconds', 'Write personalized check-in feedback', 'Create client email templates', 'Get business strategy advice'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'white', fontWeight: 500 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#4ade80', flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="float" style={{ background: '#0a0a0a', borderRadius: 16, padding: '24px', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
              {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            {[
              { role: 'you', text: 'Write a 4-week beginner strength program for Sarah. She trains 3x/week and wants to build confidence in the gym.' },
              { role: 'ai', text: "Here's a 4-week linear progression program for Sarah:\n\nWeek 1–2: Foundation\n• Squat 3×8 @ RPE 6\n• Bench 3×8 @ RPE 6\n• Deadlift 2×5 @ RPE 7\n\nWeek 3–4: Building...\n\nKept loads conservative to build her confidence. Want me to add cardio finishers?" },
            ].map(({ role, text }) => (
              <div key={role} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 10, color: role === 'you' ? '#FACC15' : '#4ade80', fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 5px' }}>{role === 'you' ? 'YOU' : 'FITCOACH AI'}</p>
                <p style={{ fontSize: 12, color: role === 'you' ? '#a1a1aa' : 'white', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{text}</p>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
              <div style={{ flex: 1, height: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }} />
              <div style={{ width: 32, height: 32, background: '#FACC15', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>↑</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 100px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#FACC15', letterSpacing: '0.12em', marginBottom: 14 }}>EARLY COACHES LOVE IT</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Don&apos;t take our word for it.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {testimonials.map(({ name, title, quote, avatar, color }, i) => (
            <div key={name} className={`reveal reveal-delay-${i + 1}`} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>&ldquo;{quote}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#000', flexShrink: 0 }}>{avatar}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: 0 }}>{name}</p>
                  <p style={{ fontSize: 12, color: '#52525b', margin: '2px 0 0' }}>{title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="reveal" style={{ maxWidth: 680, margin: '0 auto', padding: '0 48px 100px' }}>
        <div style={{ background: '#111', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 24, padding: '56px 52px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.18)', borderRadius: 999, padding: '5px 14px', fontSize: 11, color: '#FACC15', marginBottom: 24, letterSpacing: '0.1em', fontWeight: 800 }}>🚀 PRE-LAUNCH</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 14px' }}>Pricing coming soon.</h2>
          <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, margin: '0 0 10px' }}>We&apos;re in early access. Right now, <strong style={{ color: 'white' }}>it&apos;s completely free</strong> to get started.</p>
          <p style={{ fontSize: 14, color: '#52525b', margin: '0 0 36px' }}>Early access coaches will lock in exclusive founder pricing when we launch.</p>
          <Link href="/onboarding/trainer" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 700, color: '#000', textDecoration: 'none', padding: '14px 36px', background: '#FACC15', borderRadius: 10 }}>
            Join for free — claim your spot →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 9, color: '#000' }}>FC</div>
          <span style={{ fontSize: 13, color: '#3f3f46', fontWeight: 500 }}>FitCoach AI</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/trainees" style={{ fontSize: 13, color: '#3f3f46', textDecoration: 'none' }}>For Trainees</Link>
          <Link href="/login" style={{ fontSize: 13, color: '#3f3f46', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/onboarding/trainer" style={{ fontSize: 13, color: '#3f3f46', textDecoration: 'none' }}>Get started</Link>
        </div>
      </footer>
    </div>
  )
}
