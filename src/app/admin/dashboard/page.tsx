import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: trainerCount }, { count: traineeCount }] = await Promise.all([
    supabase.from('trainers').select('*', { count: 'exact', head: true }),
    supabase.from('trainees').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Total Trainers',  value: trainerCount ?? 0,  color: 'bg-purple-100 text-purple-700' },
    { label: 'Total Trainees',  value: traineeCount ?? 0,  color: 'bg-blue-100 text-blue-700' },
    { label: 'MRR',             value: '$0',               color: 'bg-green-100 text-green-700' },
    { label: 'Active Plans',    value: 0,                  color: 'bg-orange-100 text-orange-700' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Platform Overview</h1>
      <p className="text-gray-500 mb-8">FitCoach AI — Admin Dashboard</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-5 ${s.color}`}>
            <p className="text-sm font-medium opacity-70">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Getting started</h2>
        <p className="text-gray-500 text-sm">Run the SQL migration in Supabase, then trainers can sign up and start onboarding clients.</p>
      </div>
    </div>
  )
}
