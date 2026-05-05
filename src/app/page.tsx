import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-glow { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .animate-float { animation: float 6s ease-in-out infinite }
        .animate-glow { animation: pulse-glow 3s ease-in-out infinite }
        .marquee-track { display:flex; animation: marquee 20s linear infinite; width:max-content }
        .card-hover { transition: border-color .2s, transform .2s }
        .card-hover:hover { border-color: rgba(250,204,21,.25) !important; transform: translateY(-2px) }
        .btn-primary { transition: box-shadow .2s, transform .15s }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 36px rgba(234,179,8,.55) !important }
        .grad-text {
          background: linear-gradient(135deg, #FACC15 0%, #ffffff 60%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div style={{ background: '#070707', color: 'white', minHeight: '100vh', fontFamily: 'var(--font-geist-sans, sans-serif)', overflowX: 'hidden' }}>

        {/* ─────────────────────────────────────────
            NAV
        ───────────────────────────────────────── */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,7,7,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#000', boxShadow: '0 0 20px rgba(234,179,8,.45)', letterSpacing: '-.5px' }}>FC</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-.02em' }}>FitCoach AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href="/coaches" style={{ fontSize: 13, color: '#737373', fontWeight: 500, textDecoration: 'none', padding: '8px 14px', borderRadius: 8 }}>For Coaches</Link>
            <Link href="/trainees" style={{ fontSize: 13, color: '#737373', fontWeight: 500, textDecoration: 'none', padding: '8px 14px', borderRadius: 8 }}>For Trainees</Link>
            <Link href="/login" style={{ fontSize: 13, color: '#a3a3a3', fontWeight: 500, textDecoration: 'none', padding: '8px 16px', borderRadius: 8 }}>Sign in</Link>
            <Link href="/signup" className="btn-primary" style={{ fontSize: 13, color: '#000', fontWeight: 700, textDecoration: 'none', padding: '9px 20px', background: '#FACC15', borderRadius: 8, boxShadow: '0 2px 16px rgba(234,179,8,.35)', letterSpacing: '-.01em', display: 'inline-block' }}>
              Get started free →
            </Link>
          </div>
        </nav>

        {/* ─────────────────────────────────────────
            HERO
        ───────────────────────────────────────── */}
        <section style={{
          position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '80px 48px 60px',
          textAlign: 'center', overflow: 'hidden',
          backgroundImage: [
            'linear-gradient(to bottom, transparent 60%, #070707 100%)',
            'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)',
            'linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75))',
            'url(https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80)',
          ].join(', '),
          backgroundSize: 'auto, auto, auto, cover',
          backgroundPosition: 'center',
        }}>

          {/* Glow orbs */}
          <div className="animate-glow" style={{ position: 'absolute', inset: 0, top: '10%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div className="animate-glow" style={{ position: 'absolute', bottom: '5%', right: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,.08) 0%, transparent 65%)', pointerEvents: 'none', animationDelay: '1.5s' }} />

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(234,179,8,.12)', border: '1px solid rgba(234,179,8,.3)', borderRadius: 999, padding: '7px 18px', fontSize: 11, color: '#FACC15', marginBottom: 32, letterSpacing: '.1em', fontWeight: 800 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }} />
            EARLY ACCESS · 100% FREE TO JOIN
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(52px, 8.5vw, 96px)', fontWeight: 900, lineHeight: .98, letterSpacing: '-.055em', margin: '0 0 28px', maxWidth: 900 }}>
            <span className="grad-text">The smarter way</span>
            <br />to coach & train.
          </h1>

          <p style={{ fontSize: 20, color: '#f0f0f0', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 48px', fontWeight: 400 }}>
            One platform that connects coaches and trainees — with AI that saves hours, programs that adapt, and check-ins that actually work.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <Link href="/signup" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#000', textDecoration: 'none', padding: '15px 36px', background: '#FACC15', borderRadius: 10, boxShadow: '0 4px 28px rgba(234,179,8,.45)', letterSpacing: '-.02em' }}>
              Start for free — no card needed →
            </Link>
            <Link href="/free" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: '#FACC15', textDecoration: 'none', padding: '15px 28px', background: 'rgba(250,204,21,0.08)', borderRadius: 10, border: '1px solid rgba(250,204,21,0.25)' }}>
              ✨ Try the free mindset check-in
            </Link>
            <Link href="/coaches" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: '#a3a3a3', textDecoration: 'none', padding: '15px 28px', background: 'rgba(255,255,255,.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,.08)' }}>
              See how it works
            </Link>
          </div>
          <p style={{ fontSize: 12, color: '#d4d4d4', margin: '0 0 72px' }}>No credit card · Founding pricing locked in at launch</p>

          {/* ── Product mock ── */}
          <div className="animate-float" style={{ position: 'relative', width: '100%', maxWidth: 860, background: 'rgba(15,15,15,.9)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.05)', backdropFilter: 'blur(20px)' }}>

            {/* Window chrome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ef4444','#f59e0b','#22c55e'].map(c=><div key={c} style={{ width:11,height:11,borderRadius:'50%',background:c,opacity:.8 }}/>)}
              </div>
              <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
                <div style={{ background:'rgba(255,255,255,.05)', borderRadius:6, padding:'4px 20px', fontSize:11, color:'#525252' }}>fitcoach-ai · Dashboard</div>
              </div>
            </div>

            {/* Dashboard layout */}
            <div style={{ display: 'flex', height: 360 }}>

              {/* Sidebar */}
              <div style={{ width: 200, borderRight: '1px solid rgba(255,255,255,.06)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255,255,255,.01)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 10px', borderRadius:8, background:'rgba(234,179,8,.1)', marginBottom:8 }}>
                  <div style={{ width:8,height:8,borderRadius:'50%',background:'#FACC15' }}/>
                  <span style={{ fontSize:12,fontWeight:700,color:'#FACC15' }}>Dashboard</span>
                </div>
                {['Clients','Programs','Check-ins','Messages','AI Assistant','Reports'].map((item,i) => (
                  <div key={item} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 10px', borderRadius:8, opacity: i===0?1:.5 }}>
                    <div style={{ width:7,height:7,borderRadius:'50%',background:'#404040' }}/>
                    <span style={{ fontSize:12,color:'#737373',fontWeight:500 }}>{item}</span>
                    {item==='Check-ins' && <div style={{ marginLeft:'auto', background:'rgba(234,179,8,.15)', borderRadius:99, padding:'1px 7px', fontSize:10, color:'#FACC15', fontWeight:700 }}>5</div>}
                    {item==='Messages' && <div style={{ marginLeft:'auto', background:'rgba(74,222,128,.15)', borderRadius:99, padding:'1px 7px', fontSize:10, color:'#4ade80', fontWeight:700 }}>3</div>}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div style={{ flex:1, padding:'24px 28px', overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <div>
                    <p style={{ fontSize:18,fontWeight:800,color:'white',margin:0,letterSpacing:'-.02em' }}>Good morning, Coach</p>
                    <p style={{ fontSize:12,color:'#525252',margin:'3px 0 0' }}>You have 5 check-ins to review today</p>
                  </div>
                  <div style={{ background:'#FACC15', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, color:'#000', cursor:'pointer' }}>+ Add Client</div>
                </div>

                {/* Stats row */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:20 }}>
                  {[{l:'Active Clients',v:'47',c:'#FACC15'},{l:'Check-ins Due',v:'5',c:'#f97316'},{l:'New Leads',v:'3',c:'#4ade80'},{l:'Monthly Rev.',v:'$8.4k',c:'#60a5fa'}].map(({l,v,c}) => (
                    <div key={l} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10, padding:'12px 14px' }}>
                      <p style={{ fontSize:11,color:'#525252',margin:'0 0 5px',fontWeight:500 }}>{l}</p>
                      <p style={{ fontSize:20,fontWeight:900,color:c,margin:0,letterSpacing:'-.02em' }}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* Client list */}
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { name:'Sarah M.', goal:'Fat Loss', status:'Check-in ready', dot:'#FACC15' },
                    { name:'James R.', goal:'Strength', status:'On track', dot:'#4ade80' },
                    { name:'Priya K.', goal:'Fitness', status:'Missed session', dot:'#f97316' },
                  ].map(({name,goal,status,dot}) => (
                    <div key={name} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:9, padding:'10px 14px' }}>
                      <div style={{ width:28,height:28,borderRadius:'50%',background:'rgba(234,179,8,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#FACC15',flexShrink:0 }}>{name.charAt(0)}</div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:12,fontWeight:700,color:'white',margin:0 }}>{name}</p>
                        <p style={{ fontSize:11,color:'#525252',margin:0 }}>{goal}</p>
                      </div>
                      <div style={{ display:'flex',alignItems:'center',gap:5 }}>
                        <div style={{ width:6,height:6,borderRadius:'50%',background:dot }}/>
                        <span style={{ fontSize:11,color:'#737373',fontWeight:500 }}>{status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────
            STATS STRIP
        ───────────────────────────────────────── */}
        <section style={{ borderTop:'1px solid rgba(255,255,255,.06)', borderBottom:'1px solid rgba(255,255,255,.06)', padding:'40px 0', background:'rgba(255,255,255,.01)' }}>
          <div style={{ maxWidth:860, margin:'0 auto', padding:'0 48px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}>
            {[
              { value:'10 hrs', label:'saved per week, per coach' },
              { value:'3×', label:'faster client onboarding' },
              { value:'92%', label:'check-in completion rate' },
              { value:'4.9★', label:'average user rating' },
            ].map(({ value, label }, i) => (
              <div key={label} style={{ textAlign:'center', padding:'0 24px', borderRight: i<3 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                <p style={{ fontSize:'clamp(28px,4vw,40px)', fontWeight:900, color:'#FACC15', margin:'0 0 6px', letterSpacing:'-.03em' }}>{value}</p>
                <p style={{ fontSize:12, color:'#525252', margin:0, lineHeight:1.5, fontWeight:500 }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────
            FOR COACHES
        ───────────────────────────────────────── */}
        <section style={{ maxWidth:1100, margin:'0 auto', padding:'120px 48px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(234,179,8,.07)', border:'1px solid rgba(234,179,8,.18)', borderRadius:999, padding:'5px 14px', fontSize:11, color:'#FACC15', marginBottom:24, letterSpacing:'.1em', fontWeight:800 }}>FOR COACHES</div>
              <h2 style={{ fontSize:'clamp(32px,4.5vw,52px)', fontWeight:900, letterSpacing:'-.04em', margin:'0 0 22px', lineHeight:1.05 }}>
                Stop running your business on WhatsApp and spreadsheets.
              </h2>
              <p style={{ fontSize:16, color:'#d4d4d4', lineHeight:1.8, margin:'0 0 36px', maxWidth:560 }}>
                FitCoach AI gives you a real operating system — client pipeline, program builder, weekly check-ins, AI assistant, and reporting. Everything in sync, nothing falling through the cracks.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:36 }}>
                {[
                  { t:'AI writes your check-in feedback', d:'Review 20 clients in the time it used to take for 5.' },
                  { t:'Reusable program library', d:'Build once. Assign to anyone. Modify per client in seconds.' },
                  { t:'Lead-to-client pipeline', d:'Never lose a prospect again. Know exactly where everyone stands.' },
                  { t:'Business analytics', d:'Revenue, retention, check-in rates. Know your numbers.' },
                ].map(({ t, d }) => (
                  <div key={t} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(234,179,8,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#FACC15', flexShrink:0, marginTop:1 }}>✓</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:'white', margin:0 }}>{t}</p>
                      <p style={{ fontSize:13, color:'#525252', margin:'2px 0 0', lineHeight:1.5 }}>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-primary" style={{ display:'inline-flex', alignItems:'center', fontSize:14, fontWeight:700, color:'#000', textDecoration:'none', padding:'13px 28px', background:'#FACC15', borderRadius:10, boxShadow:'0 4px 20px rgba(234,179,8,.35)' }}>
                Start coaching smarter →
              </Link>
            </div>

            {/* AI Chat Mock */}
            <div style={{ background:'#0f0f0f', border:'1px solid rgba(255,255,255,.07)', borderRadius:20, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,.4)' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.06)', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:'rgba(234,179,8,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🤖</div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'white', margin:0 }}>AI Coaching Assistant</p>
                  <p style={{ fontSize:11, color:'#4ade80', margin:0 }}>● Online</p>
                </div>
              </div>
              <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:14, minHeight:320 }}>
                <div style={{ alignSelf:'flex-end', background:'rgba(234,179,8,.1)', border:'1px solid rgba(234,179,8,.15)', borderRadius:'14px 14px 4px 14px', padding:'12px 16px', maxWidth:'80%' }}>
                  <p style={{ fontSize:13, color:'#fef9c3', margin:0, lineHeight:1.5 }}>Write feedback for Sarah's check-in. She lost 2lbs but missed 2 sessions this week.</p>
                </div>
                <div style={{ alignSelf:'flex-start', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'14px 14px 14px 4px', padding:'12px 16px', maxWidth:'88%' }}>
                  <p style={{ fontSize:13, color:'#e5e5e5', margin:0, lineHeight:1.6 }}>
                    <strong style={{ color:'#4ade80' }}>Great week, Sarah!</strong> Dropping 2lbs while being slightly off schedule means your nutrition is dialed in — that's a real skill. 💪
                    <br /><br />
                    For the missed sessions, let's not stress it. Next week, we'll prioritize the 2 most impactful workouts. Quality &gt; quantity.
                  </p>
                </div>
                <div style={{ alignSelf:'flex-start', display:'flex', gap:8 }}>
                  {['Send to Sarah','Edit first','Save as template'].map(t => (
                    <div key={t} style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', borderRadius:99, padding:'6px 12px', fontSize:11, color:'#a3a3a3', fontWeight:600, cursor:'pointer' }}>{t}</div>
                  ))}
                </div>
              </div>
              <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,.06)', display:'flex', gap:10 }}>
                <div style={{ flex:1, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#404040' }}>Ask anything about your clients…</div>
                <div style={{ width:36, height:36, background:'#FACC15', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#000', fontWeight:700, cursor:'pointer' }}>↑</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────
            FOR TRAINEES
        ───────────────────────────────────────── */}
        <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 48px 120px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>

            {/* Trainee app mock */}
            <div style={{ background:'#0f0f0f', border:'1px solid rgba(255,255,255,.07)', borderRadius:20, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,.4)' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.06)', background:'rgba(255,255,255,.02)' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'white', margin:0 }}>Your workout today</p>
                <p style={{ fontSize:11, color:'#525252', margin:'2px 0 0' }}>Week 6 · Day 3 · Upper Body Power</p>
              </div>
              <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { ex:'Bench Press', sets:'4×6', weight:'75kg', status:'done' },
                  { ex:'Weighted Pull-ups', sets:'3×8', weight:'+10kg', status:'done' },
                  { ex:'Overhead Press', sets:'3×10', weight:'50kg', status:'active' },
                  { ex:'Cable Rows', sets:'3×12', weight:'60kg', status:'pending' },
                  { ex:'Face Pulls', sets:'3×15', weight:'25kg', status:'pending' },
                ].map(({ ex, sets, weight, status }) => (
                  <div key={ex} style={{ display:'flex', alignItems:'center', gap:12, background: status==='active' ? 'rgba(234,179,8,.07)' : 'rgba(255,255,255,.02)', border:`1px solid ${status==='active' ? 'rgba(234,179,8,.2)' : 'rgba(255,255,255,.05)'}`, borderRadius:10, padding:'10px 14px' }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background: status==='done' ? '#4ade80' : status==='active' ? '#FACC15' : 'rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0 }}>
                      {status==='done' ? '✓' : status==='active' ? '▶' : ''}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:700, color: status==='pending' ? '#525252' : 'white', margin:0 }}>{ex}</p>
                      <p style={{ fontSize:11, color:'#525252', margin:0 }}>{sets} · {weight}</p>
                    </div>
                    {status==='active' && <div style={{ background:'#FACC15', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:700, color:'#000' }}>Log</div>}
                  </div>
                ))}
              </div>
              <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', gap:6 }}>
                  <span style={{ fontSize:11, color:'#525252' }}>🔥 14-day streak</span>
                  <span style={{ fontSize:11, color:'#525252' }}>· 3/5 done</span>
                </div>
                <div style={{ background:'rgba(74,222,128,.1)', borderRadius:6, padding:'5px 12px', fontSize:11, color:'#4ade80', fontWeight:700 }}>On track</div>
              </div>
            </div>

            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(74,222,128,.07)', border:'1px solid rgba(74,222,128,.18)', borderRadius:999, padding:'5px 14px', fontSize:11, color:'#4ade80', marginBottom:24, letterSpacing:'.1em', fontWeight:800 }}>FOR TRAINEES</div>
              <h2 style={{ fontSize:'clamp(32px,4.5vw,52px)', fontWeight:900, letterSpacing:'-.04em', margin:'0 0 22px', lineHeight:1.05 }}>
                A real coach. A real plan. Real results.
              </h2>
              <p style={{ fontSize:16, color:'#d4d4d4', lineHeight:1.8, margin:'0 0 36px', maxWidth:560 }}>
                Forget generic apps and cookie-cutter plans. FitCoach AI connects you with a coach who sees your progress every week and adjusts your program when life happens.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:36 }}>
                {[
                  { t:'Program built around you', d:'Your goals, schedule, and fitness level — not a template.' },
                  { t:'Weekly check-ins your coach reviews', d:'Stay accountable. Get feedback that actually helps.' },
                  { t:'Progress that compounds', d:'Every session logged, every milestone tracked.' },
                  { t:'One app, everything in it', d:'Workouts, messages, history — all in one place.' },
                ].map(({ t, d }) => (
                  <div key={t} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(74,222,128,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#4ade80', flexShrink:0, marginTop:1 }}>✓</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:'white', margin:0 }}>{t}</p>
                      <p style={{ fontSize:13, color:'#525252', margin:'2px 0 0', lineHeight:1.5 }}>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-primary" style={{ display:'inline-flex', alignItems:'center', fontSize:14, fontWeight:700, color:'#000', textDecoration:'none', padding:'13px 28px', background:'#FACC15', borderRadius:10, boxShadow:'0 4px 20px rgba(234,179,8,.35)' }}>
                Start training smarter →
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────
            TESTIMONIALS
        ───────────────────────────────────────── */}
        <section style={{ borderTop:'1px solid rgba(255,255,255,.06)', borderBottom:'1px solid rgba(255,255,255,.06)', padding:'100px 48px', background:'rgba(255,255,255,.01)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <p style={{ fontSize:11, fontWeight:800, color:'#FACC15', letterSpacing:'.12em', marginBottom:14 }}>WHAT PEOPLE SAY</p>
              <h2 style={{ fontSize:'clamp(30px,4.5vw,48px)', fontWeight:900, letterSpacing:'-.04em', margin:0 }}>Real coaches. Real trainees.<br />Real results.</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
              {[
                { name:'Marcus Webb', role:'Online Strength Coach · 47 clients', avatar:'MW', color:'#FACC15', quote:'I went from 3 hours reviewing check-ins on Sunday to 20 minutes. The AI drafts the feedback, I tweak it. I\'ve taken on 15 more clients since switching and I\'m working fewer hours than before.' },
                { name:'Priya Nair', role:'Trainee · 6 months in', avatar:'PN', color:'#4ade80', quote:'Every other app gave me the same plan as everyone else. Here my coach sees my check-ins every single week and adjusts my program. I hit a new deadlift PR last month. I\'m stronger than I\'ve ever been at 34.' },
                { name:'James Okafor', role:'Performance Coach · 62 clients', avatar:'JO', color:'#60a5fa', quote:'Scaling past 50 clients felt impossible before this. The lead pipeline and automated check-in flow means nothing falls through the cracks. I finally feel like I\'m running a real business, not just juggling clients.' },
                { name:'Aisha Mensah', role:'Trainee · 9 months in', avatar:'AM', color:'#f472b6', quote:'I had my workouts in one app, progress photos in my camera roll, and messages with my coach on Instagram. Having it all in one place changed everything. I actually follow through now because it\'s so easy.' },
              ].map(({ name, role, avatar, color, quote }) => (
                <div key={name} className="card-hover" style={{ background:'#0f0f0f', border:'1px solid rgba(255,255,255,.07)', borderRadius:18, padding:'36px 32px', display:'flex', flexDirection:'column', gap:22 }}>
                  <div style={{ display:'flex', gap:2 }}>
                    {[...Array(5)].map((_,i) => <span key={i} style={{ color:'#FACC15', fontSize:14 }}>★</span>)}
                  </div>
                  <p style={{ fontSize:15, color:'#a3a3a3', lineHeight:1.8, margin:0, fontStyle:'italic', flex:1 }}>"{quote}"</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, color:'#000', flexShrink:0 }}>{avatar}</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:'white', margin:0 }}>{name}</p>
                      <p style={{ fontSize:12, color:'#525252', margin:'2px 0 0' }}>{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────
            FINAL CTA
        ───────────────────────────────────────── */}
        <section style={{ padding:'120px 48px', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:800, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(234,179,8,.07) 0%, transparent 60%)', pointerEvents:'none' }} />
          <div style={{ maxWidth:680, margin:'0 auto', position:'relative' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(74,222,128,.07)', border:'1px solid rgba(74,222,128,.18)', borderRadius:999, padding:'6px 16px', fontSize:11, color:'#4ade80', marginBottom:32, letterSpacing:'.1em', fontWeight:800 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block', boxShadow:'0 0 8px #4ade80' }}/>
              EARLY ACCESS — JOIN FREE TODAY
            </div>
            <h2 style={{ fontSize:'clamp(36px,6vw,64px)', fontWeight:900, letterSpacing:'-.045em', margin:'0 0 22px', lineHeight:1.02 }}>
              Join free today.<br /><span className="grad-text">Lock in founder pricing forever.</span>
            </h2>
            <p style={{ fontSize:17, color:'#d4d4d4', lineHeight:1.7, margin:'0 auto 44px', maxWidth:620 }}>
              Early access is 100% free. When we launch paid plans, founding members lock in exclusive pricing — permanently.
            </p>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
              <Link href="/signup" className="btn-primary" style={{ display:'inline-flex', alignItems:'center', gap:10, fontSize:16, fontWeight:800, color:'#000', textDecoration:'none', padding:'18px 48px', background:'#FACC15', borderRadius:12, boxShadow:'0 6px 32px rgba(234,179,8,.45)', letterSpacing:'-.02em' }}>
                Claim your free spot →
              </Link>
              <p style={{ fontSize:13, color:'#404040', margin:0 }}>No credit card · No commitment · Cancel anytime</p>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────
            FOOTER
        ───────────────────────────────────────── */}
        <footer style={{ borderTop:'1px solid rgba(255,255,255,.05)', padding:'32px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:8, background:'#FACC15', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:9, color:'#000' }}>FC</div>
            <span style={{ fontSize:13, color:'#404040', fontWeight:500 }}>FitCoach AI</span>
          </div>
          <div style={{ display:'flex', gap:28 }}>
            <Link href="/coaches" style={{ fontSize:13, color:'#404040', textDecoration:'none' }}>For Coaches</Link>
            <Link href="/trainees" style={{ fontSize:13, color:'#404040', textDecoration:'none' }}>For Trainees</Link>
            <Link href="/login" style={{ fontSize:13, color:'#404040', textDecoration:'none' }}>Sign in</Link>
            <Link href="/signup" style={{ fontSize:13, color:'#FACC15', textDecoration:'none', fontWeight:600 }}>Get started</Link>
          </div>
        </footer>

      </div>
    </>
  )
}
