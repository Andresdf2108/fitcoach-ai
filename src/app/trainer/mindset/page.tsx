import { createClient } from '@/lib/supabase/server'
import { Brain, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import Link from 'next/link'

type Checkin = {
  trainee_id: string
  mood_score: number
  energy_score: number
  focus_score: number
  win_today: string | null
  challenge_today: string | null
  created_at: string
}

export default async function TrainerMindsetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Last 14 days, only this trainer's clients
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data: clients } = await supabase
    .from('trainees')
    .select('id, profiles(full_name)')
    .eq('trainer_id', user!.id)
    .eq('status', 'active')

  const clientIds = (clients ?? []).map(c => c.id)

  const { data: checkins } = clientIds.length
    ? await supabase
        .from('mindset_checkins')
        .select('trainee_id, mood_score, energy_score, focus_score, win_today, challenge_today, created_at')
        .in('trainee_id', clientIds)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
    : { data: [] as Checkin[] }

  const byClient = new Map<string, Checkin[]>()
  for (const c of (checkins ?? []) as Checkin[]) {
    const arr = byClient.get(c.trainee_id) ?? []
    arr.push(c)
    byClient.set(c.trainee_id, arr)
  }

  const rows = (clients ?? []).map(c => {
    const cs = byClient.get(c.id) ?? []
    const recent = cs.slice(0, 3)
    const older = cs.slice(3, 7)
    const avg = (arr: Checkin[], k: keyof Checkin) =>
      arr.length ? arr.reduce((s, x) => s + (x[k] as number), 0) / arr.length : null
    const moodNow = avg(recent, 'mood_score')
    const moodPrev = avg(older, 'mood_score')
    const trend = moodNow != null && moodPrev != null ? moodNow - moodPrev : 0
    const lastCheckin = cs[0]
    return {
      id: c.id,
      name: (c as any).profiles?.full_name ?? 'Unnamed',
      checkinsCount: cs.length,
      moodNow: moodNow != null ? moodNow.toFixed(1) : '—',
      energyNow: avg(recent, 'energy_score')?.toFixed(1) ?? '—',
      focusNow: avg(recent, 'focus_score')?.toFixed(1) ?? '—',
      trend,
      lastCheckin,
    }
  })

  // Sort: clients with biggest mood drop first (most need attention)
  rows.sort((a, b) => a.trend - b.trend)

  const totalCheckins = checkins?.length ?? 0
  const activeClients = rows.filter(r => r.checkinsCount > 0).length

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 11px', borderRadius: 999, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', fontSize: 11, color: '#FACC15', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 12 }}>
          <Brain size={12} strokeWidth={2.4} />
          MINDSET — 14 DAYS
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>
          Client mindset trends
        </h1>
        <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>
          Clients with declining mood are listed first — that&apos;s where coaching attention compounds most.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        <Stat label="Active clients (14d)" value={`${activeClients} / ${rows.length}`} color="#FACC15" />
        <Stat label="Check-ins received" value={String(totalCheckins)} color="#4ade80" />
        <Stat label="Clients needing attention" value={String(rows.filter(r => r.trend < -1).length)} color="#f87171" />
      </div>

      {rows.length === 0 ? (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#71717a', margin: 0 }}>No active clients yet.</p>
        </div>
      ) : (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.4fr', padding: '13px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#71717a', fontWeight: 700, letterSpacing: '0.06em' }}>
            <span>CLIENT</span>
            <span>CHECK-INS</span>
            <span>MOOD</span>
            <span>ENERGY</span>
            <span>FOCUS</span>
            <span>TREND</span>
          </div>
          {rows.map(r => {
            const TrendIcon = r.trend > 0.5 ? TrendingUp : r.trend < -0.5 ? TrendingDown : Minus
            const trendColor = r.trend > 0.5 ? '#4ade80' : r.trend < -0.5 ? '#f87171' : '#71717a'
            return (
              <Link
                key={r.id}
                href={`/trainer/clients/${r.id}`}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.4fr', padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none', color: '#d4d4d8', fontSize: 13, alignItems: 'center' }}
              >
                <span style={{ color: '#fafafa', fontWeight: 600 }}>{r.name}</span>
                <span>{r.checkinsCount}</span>
                <span style={{ color: '#FACC15', fontWeight: 600 }}>{r.moodNow}</span>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>{r.energyNow}</span>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>{r.focusNow}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: trendColor, fontWeight: 600 }}>
                  <TrendIcon size={14} strokeWidth={2.2} />
                  {r.trend > 0 ? '+' : ''}{r.trend.toFixed(1)}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
      <p style={{ fontSize: 11, color: '#71717a', margin: '0 0 6px', fontWeight: 600, letterSpacing: '0.04em' }}>{label.toUpperCase()}</p>
      <p style={{ fontSize: 24, fontWeight: 800, color, margin: 0, letterSpacing: '-0.03em' }}>{value}</p>
    </div>
  )
}
