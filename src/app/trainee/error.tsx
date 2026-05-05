'use client'

import { useEffect } from 'react'

export default function TraineeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      padding: '80px 40px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: '#ef444415',
        border: '1px solid #ef444430', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 24, marginBottom: 20,
      }}>⚠</div>
      <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        Something went wrong
      </h2>
      <p style={{ color: '#52525b', fontSize: 14, margin: '0 0 28px', maxWidth: 360, lineHeight: 1.65 }}>
        This feature may not be available yet. Please contact your coach if the problem persists.
      </p>
      <button
        onClick={reset}
        style={{
          background: '#FACC15', color: '#000', fontWeight: 700, border: 'none',
          borderRadius: 9, padding: '10px 24px', fontSize: 14, cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}
