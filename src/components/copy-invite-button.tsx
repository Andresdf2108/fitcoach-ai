'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyInviteButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
        background: copied ? '#10b98120' : '#FACC1515',
        border: `1px solid ${copied ? '#10b98140' : '#FACC1540'}`,
        color: copied ? '#10b981' : '#FACC15',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}
