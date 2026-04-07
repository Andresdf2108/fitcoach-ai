import type { LucideIcon } from 'lucide-react'

interface ComingSoonProps {
  icon: LucideIcon
  title: string
  description: string
  color?: string
}

export function ComingSoon({ icon: Icon, title, description, color = '#FACC15' }: ComingSoonProps) {
  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}12`, border: `1px solid ${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 18,
        }}>
          <Icon size={20} color={color} strokeWidth={2} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>{title}</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>{description}</p>
      </div>
      <div style={{
        background: '#161616', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 14, padding: '36px 32px',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <Icon size={18} color="#3f3f46" strokeWidth={1.5} />
        </div>
        <p style={{ color: '#3f3f46', fontSize: 14, margin: '0 0 4px', fontWeight: 600 }}>Coming soon</p>
        <p style={{ color: '#27272a', fontSize: 13, margin: 0, lineHeight: 1.6 }}>This section is being built. Check back shortly.</p>
      </div>
    </div>
  )
}
