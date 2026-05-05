'use client'

import { useEffect } from 'react'

export default function AdminError({
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
      <p style={{ color: '#52525b', fontSize: 14, margin: '0 0 6px', maxWidth: 420, lineHeight: 1.65 }}>
        A database query failed. This can happen when migrations haven't been applied.
      </p>
      <p style={{ color: '#3f3f46', fontSize: 13, margin: '0 0 28px', maxWidth: 420, lineHeight: 1.65 }}>
        Run migrations 003, 004, and 005 in the Supabase SQL Editor to enable all features.
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
