'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Trash2, Loader2, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { setExerciseVideoByName } from '@/app/actions/trainer'

type Props = {
  exerciseName: string
  trainerId: string
  currentVideoUrl: string | null
}

export default function VideoUploadClient({ exerciseName, trainerId, currentVideoUrl }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 100 * 1024 * 1024) {
      setError('Video must be under 100 MB')
      return
    }

    setError('')
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4'
      const safeName = exerciseName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      const path = `${trainerId}/${safeName}-${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('exercise-videos')
        .upload(path, file, { upsert: false, contentType: file.type })

      if (upErr) throw upErr

      const { data: pub } = supabase.storage.from('exercise-videos').getPublicUrl(path)
      await setExerciseVideoByName(exerciseName, pub.publicUrl)
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleRemove() {
    setUploading(true)
    setError('')
    try {
      await setExerciseVideoByName(exerciseName, null)
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {currentVideoUrl && (
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            style={btnGhost}
          >
            <Play size={13} strokeWidth={2.2} /> Preview
          </button>
        )}
        <label style={{ ...btnPrimary, opacity: uploading ? 0.6 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}>
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} strokeWidth={2.2} />}
          {currentVideoUrl ? 'Replace' : 'Upload'}
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={handleFile}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        {currentVideoUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            style={btnDanger}
          >
            <Trash2 size={13} strokeWidth={2.2} />
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: '#f87171', margin: 0 }}>{error}</p>}

      {showPreview && currentVideoUrl && (
        <div
          onClick={() => setShowPreview(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <video
            src={currentVideoUrl}
            controls
            autoPlay
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, background: '#000' }}
          />
        </div>
      )}
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: '#FACC15',
  color: '#000',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
}

const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: 'rgba(255,255,255,0.05)',
  color: '#a1a1aa',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  border: '1px solid rgba(255,255,255,0.08)',
  cursor: 'pointer',
}

const btnDanger: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 10px',
  background: 'rgba(248,113,113,0.08)',
  color: '#f87171',
  borderRadius: 8,
  border: '1px solid rgba(248,113,113,0.2)',
  cursor: 'pointer',
}
