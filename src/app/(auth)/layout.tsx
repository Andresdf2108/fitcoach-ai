export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold">
            F
          </div>
          <span className="text-xl font-bold tracking-tight">FitCoach AI</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your coaching<br />business, powered<br />by AI.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
            Manage leads, clients, programs, and check-ins — all in one platform built for serious coaches.
          </p>
        </div>

        <div className="flex gap-6 text-sm text-blue-200">
          <div>
            <p className="text-2xl font-bold text-white">3x</p>
            <p>faster onboarding</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">80%</p>
            <p>less admin work</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">AI</p>
            <p>at every step</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <span className="text-lg font-bold text-gray-900">FitCoach AI</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
