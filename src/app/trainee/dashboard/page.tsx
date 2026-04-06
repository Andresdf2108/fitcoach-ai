import { createClient } from '@/lib/supabase/server'

export default async function TraineeDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const cards = [
    { label: "Today's Workout",   value: 'Not assigned yet', icon: '💪' },
    { label: 'Current Streak',    value: '0 days',           icon: '🔥' },
    { label: 'Pending Check-in',  value: 'None due',         icon: '✅' },
    { label: 'New Messages',      value: '0',                icon: '💬' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Hey, {profile?.full_name ?? 'Athlete'} 👋
      </h1>
      <p className="text-gray-500 mb-8">Ready to crush today?</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <span className="text-2xl">{c.icon}</span>
            <p className="text-sm text-gray-500 mt-2">{c.label}</p>
            <p className="font-semibold text-gray-900 mt-0.5">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Getting started</h2>
        <p className="text-gray-500 text-sm">
          Your trainer will assign your first program shortly. Check back here to see your workouts, track progress, and message your coach.
        </p>
      </div>
    </div>
  )
}
