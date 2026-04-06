export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left: Brand panel ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 text-white"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center font-black text-white text-lg tracking-tight">
            FC
          </div>
          <span className="text-xl font-bold tracking-tight">FitCoach AI</span>
        </div>

        {/* Hero copy */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm text-blue-100 w-fit">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Now in early access
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight">
            Your coaching<br />business,<br />
            <span className="text-blue-200">powered by AI.</span>
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-xs">
            Manage leads, clients, programs, and check-ins — all in one platform built for serious coaches.
          </p>
        </div>

        {/* Social proof */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { stat: '3×', label: 'faster onboarding' },
            { stat: '80%', label: 'less admin work' },
            { stat: 'AI', label: 'at every step' },
          ].map(({ stat, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-2xl font-black text-white">{stat}</p>
              <p className="text-xs text-blue-200 mt-1 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm"
              style={{ background: 'var(--brand)' }}
            >
              FC
            </div>
            <span className="text-lg font-bold text-gray-900">FitCoach AI</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
