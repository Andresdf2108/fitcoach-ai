import { createClient } from '@/lib/supabase/server'
import { CheckCircle2 } from 'lucide-react'

export default async function TraineeBillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trainee } = await supabase
    .from('trainees')
    .select('trainer_id, status, created_at, profiles!trainer_id(full_name)')
    .eq('id', user!.id)
    .single()

  const trainerName = (trainee as any)?.profiles?.full_name ?? 'your coach'
  const memberSince = trainee?.created_at
    ? new Date(trainee.created_at).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })
    : null

  const STATUS_COLOR: Record<string, string> = {
    active: '#10b981', paused: '#f59e0b', onboarding: '#3b82f6',
    inactive: '#52525b', cancelled: '#ef4444',
  }
  const statusColor = STATUS_COLOR[trainee?.status ?? 'inactive'] ?? '#52525b'

  const features = [
    'Personalised training programs',
    'Weekly check-in reviews',
    'Direct messaging with your coach',
    'Session scheduling',
    'Progress tracking',
    'AI-assisted coaching tools',
  ]

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 560 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Billing</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>Your coaching subscription</p>
      </div>

      {/* Status card */}
      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ color: '#52525b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 5px' }}>Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor }} />
              <span style={{ color: statusColor, fontWeight: 700, fontSize: 15, textTransform: 'capitalize' }}>
                {trainee?.status ?? 'No plan'}
              </span>
            </div>
          </div>
          {memberSince && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#52525b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 5px' }}>Member since</p>
              <p style={{ color: '#a1a1aa', fontWeight: 600, fontSize: 14, margin: 0 }}>{memberSince}</p>
            </div>
          )}
        </div>
        {trainee?.trainer_id && (
          <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>
            Coached by <span style={{ color: '#a1a1aa', fontWeight: 600 }}>{trainerName}</span>
          </p>
        )}
      </div>

      {/* What's included */}
      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px', marginBottom: 16 }}>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 16px', letterSpacing: '-0.01em' }}>What&apos;s included</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={14} color="#10b981" strokeWidth={2} style={{ flexShrink: 0 }} />
              <span style={{ color: '#a1a1aa', fontSize: 13 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ color: '#52525b', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          Billing is managed by your trainer. Contact <span style={{ color: '#a1a1aa', fontWeight: 600 }}>{trainerName}</span> for any billing questions or plan changes.
        </p>
      </div>
    </div>
  )
}
