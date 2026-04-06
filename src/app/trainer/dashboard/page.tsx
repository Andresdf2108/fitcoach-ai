import { createClient } from '@/lib/supabase/server'

export default async function TrainerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: trainer },
    { count: leadCount },
    { count: clientCount },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user!.id).single(),
    supabase.from('trainers').select('active_trainee_count, plan_id, subscription_plans(name, max_trainees)').eq('id', user!.id).single(),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
    supabase.from('trainees').select('*', { count: 'exact', head: true }).eq('trainer_id', user!.id),
  ])

  const plan = (trainer as any)?.subscription_plans
  const activeCount = (trainer as any)?.active_trainee_count ?? 0
  const maxCount = plan?.max_trainees ?? 5
  const capacityPct = Math.round((activeCount / maxCount) * 100)

  const stats = [
    { label: 'Active Leads',    value: leadCount ?? 0 },
    { label: 'Active Clients',  value: clientCount ?? 0 },
    { label: 'Pending Check-ins', value: 0 },
    { label: 'Unread Messages', value: 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome back, {profile?.full_name ?? 'Coach'}
      </h1>
      <p className="text-gray-500 mb-8">Here&apos;s what needs your attention today.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">Trainee capacity</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeCount} of {maxCount} active trainees · Plan: <span className="capitalize font-medium">{plan?.name ?? 'Free'}</span>
            </p>
          </div>
          <span className="text-sm font-medium text-gray-700">{capacityPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${capacityPct >= 100 ? 'bg-red-500' : capacityPct >= 80 ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(capacityPct, 100)}%` }}
          />
        </div>
        {capacityPct >= 80 && (
          <p className="text-xs text-yellow-700 mt-2">
            {capacityPct >= 100 ? '⛔ Capacity reached — upgrade to add more clients.' : '⚠️ Approaching capacity — consider upgrading soon.'}
          </p>
        )}
      </div>
    </div>
  )
}
