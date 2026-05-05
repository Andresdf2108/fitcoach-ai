'use client'

import { useState, useEffect, useRef, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { GripVertical } from 'lucide-react'
import {
  addExercise,
  removeExercise,
  moveExercise,
  assignTrainees,
  unassignTrainee,
} from '@/app/actions/trainer'

// ── Types ──────────────────────────────────────────────────────────────────
type LibExercise = {
  name: string
  category: string
  sets?: number
  reps?: number
  duration?: number
  rest: number
}

type Exercise = {
  id: string
  name: string
  day_number: number
  sets?: number | null
  reps?: number | null
  duration_minutes?: number | null
  rest_seconds?: number | null
  notes?: string | null
  order_index: number
}

type Enrollment = {
  id: string
  trainee_id: string
  start_date: string
  profiles: { full_name: string } | null
}

type Trainee = {
  id: string
  profiles: { full_name: string } | null
}

type DragInfo =
  | { type: 'library'; ex: LibExercise; label: string }
  | { type: 'existing'; id: string; currentDay: number; label: string }

// ── Exercise Library ───────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'push', label: 'Push' },
  { id: 'pull', label: 'Pull' },
  { id: 'legs', label: 'Legs' },
  { id: 'core', label: 'Core' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'mobility', label: 'Mobility' },
]

const CAT_COLOR: Record<string, string> = {
  push: '#f97316',
  pull: '#3b82f6',
  legs: '#10b981',
  core: '#FACC15',
  cardio: '#ef4444',
  mobility: '#a855f7',
}

const EXERCISE_LIBRARY: LibExercise[] = [
  { name: 'Bench Press', category: 'push', sets: 4, reps: 8, rest: 90 },
  { name: 'Incline Bench Press', category: 'push', sets: 3, reps: 10, rest: 90 },
  { name: 'Push-Ups', category: 'push', sets: 3, reps: 15, rest: 60 },
  { name: 'Overhead Press', category: 'push', sets: 4, reps: 8, rest: 90 },
  { name: 'Dumbbell Shoulder Press', category: 'push', sets: 3, reps: 12, rest: 60 },
  { name: 'Lateral Raise', category: 'push', sets: 3, reps: 15, rest: 45 },
  { name: 'Front Raise', category: 'push', sets: 3, reps: 12, rest: 45 },
  { name: 'Tricep Dips', category: 'push', sets: 3, reps: 12, rest: 60 },
  { name: 'Tricep Pushdown', category: 'push', sets: 3, reps: 15, rest: 45 },
  { name: 'Skull Crushers', category: 'push', sets: 3, reps: 12, rest: 60 },
  { name: 'Cable Fly', category: 'push', sets: 3, reps: 15, rest: 60 },
  { name: 'Pull-Ups', category: 'pull', sets: 4, reps: 8, rest: 90 },
  { name: 'Chin-Ups', category: 'pull', sets: 3, reps: 10, rest: 90 },
  { name: 'Barbell Row', category: 'pull', sets: 4, reps: 8, rest: 90 },
  { name: 'Dumbbell Row', category: 'pull', sets: 3, reps: 12, rest: 60 },
  { name: 'Lat Pulldown', category: 'pull', sets: 3, reps: 12, rest: 60 },
  { name: 'Seated Cable Row', category: 'pull', sets: 3, reps: 12, rest: 60 },
  { name: 'Face Pull', category: 'pull', sets: 3, reps: 15, rest: 45 },
  { name: 'Bicep Curl', category: 'pull', sets: 3, reps: 12, rest: 45 },
  { name: 'Hammer Curl', category: 'pull', sets: 3, reps: 12, rest: 45 },
  { name: 'T-Bar Row', category: 'pull', sets: 4, reps: 10, rest: 90 },
  { name: 'Back Squat', category: 'legs', sets: 4, reps: 6, rest: 120 },
  { name: 'Front Squat', category: 'legs', sets: 3, reps: 8, rest: 120 },
  { name: 'Romanian Deadlift', category: 'legs', sets: 3, reps: 10, rest: 90 },
  { name: 'Conventional Deadlift', category: 'legs', sets: 4, reps: 5, rest: 180 },
  { name: 'Leg Press', category: 'legs', sets: 4, reps: 12, rest: 90 },
  { name: 'Bulgarian Split Squat', category: 'legs', sets: 3, reps: 10, rest: 90 },
  { name: 'Walking Lunge', category: 'legs', sets: 3, reps: 12, rest: 60 },
  { name: 'Leg Curl', category: 'legs', sets: 3, reps: 12, rest: 60 },
  { name: 'Leg Extension', category: 'legs', sets: 3, reps: 15, rest: 60 },
  { name: 'Calf Raise', category: 'legs', sets: 4, reps: 20, rest: 45 },
  { name: 'Hip Thrust', category: 'legs', sets: 4, reps: 12, rest: 90 },
  { name: 'Goblet Squat', category: 'legs', sets: 3, reps: 12, rest: 60 },
  { name: 'Sumo Deadlift', category: 'legs', sets: 3, reps: 8, rest: 120 },
  { name: 'Plank', category: 'core', duration: 1, rest: 60 },
  { name: 'Side Plank', category: 'core', duration: 1, rest: 45 },
  { name: 'Dead Bug', category: 'core', sets: 3, reps: 10, rest: 45 },
  { name: 'Ab Wheel Rollout', category: 'core', sets: 3, reps: 10, rest: 60 },
  { name: 'Cable Crunch', category: 'core', sets: 3, reps: 15, rest: 45 },
  { name: 'Russian Twist', category: 'core', sets: 3, reps: 20, rest: 45 },
  { name: 'Hanging Leg Raise', category: 'core', sets: 3, reps: 12, rest: 60 },
  { name: 'Bird Dog', category: 'core', sets: 3, reps: 10, rest: 45 },
  { name: 'Treadmill Run', category: 'cardio', duration: 20, rest: 0 },
  { name: 'Cycling', category: 'cardio', duration: 20, rest: 0 },
  { name: 'Jump Rope', category: 'cardio', duration: 10, rest: 60 },
  { name: 'Rowing Machine', category: 'cardio', duration: 15, rest: 0 },
  { name: 'Box Jumps', category: 'cardio', sets: 4, reps: 10, rest: 60 },
  { name: 'Burpees', category: 'cardio', sets: 3, reps: 15, rest: 60 },
  { name: 'Assault Bike', category: 'cardio', duration: 10, rest: 0 },
  { name: 'Kettlebell Swing', category: 'cardio', sets: 4, reps: 20, rest: 60 },
  { name: 'Hip Flexor Stretch', category: 'mobility', duration: 2, rest: 0 },
  { name: 'Pigeon Pose', category: 'mobility', duration: 2, rest: 0 },
  { name: 'Cat-Cow', category: 'mobility', sets: 2, reps: 10, rest: 0 },
  { name: 'Foam Roll Quads', category: 'mobility', duration: 2, rest: 0 },
  { name: 'Thoracic Rotation', category: 'mobility', sets: 2, reps: 10, rest: 0 },
  { name: "World's Greatest Stretch", category: 'mobility', sets: 2, reps: 8, rest: 0 },
  { name: 'Shoulder Dislocates', category: 'mobility', sets: 3, reps: 10, rest: 0 },
  { name: 'Hamstring Stretch', category: 'mobility', duration: 2, rest: 0 },
]

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function fmt12(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const inputStyle = {
  background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6,
  padding: '7px 10px', color: '#fff', fontSize: 12, outline: 'none',
  width: '100%', boxSizing: 'border-box' as const,
}

// ── Sub-components ─────────────────────────────────────────────────────────

function LibChip({ ex, onMouseDown }: {
  ex: LibExercise
  onMouseDown: (e: React.MouseEvent) => void
}) {
  const color = CAT_COLOR[ex.category] ?? '#52525b'
  const detail = ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.duration ? `${ex.duration}min` : ''
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: '#1a1a1a', borderRadius: 6,
        border: '1px solid #252525', borderLeft: `3px solid ${color}`,
        padding: '5px 9px', cursor: 'grab',
        userSelect: 'none', touchAction: 'none',
      }}
    >
      <span style={{ color: '#d1d5db', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{ex.name}</span>
      {detail && <span style={{ color: '#4b5563', fontSize: 10 }}>{detail}</span>}
    </div>
  )
}

function ExCard({ ex, programId, onGripMouseDown }: {
  ex: Exercise
  programId: string
  onGripMouseDown: (e: React.MouseEvent) => void
}) {
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #252525',
      borderRadius: 7, padding: '6px 7px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <div
          onMouseDown={onGripMouseDown}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 3, flex: 1, minWidth: 0, cursor: 'grab' }}
        >
          <GripVertical size={9} color="#3f3f46" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{
            color: '#e5e7eb', fontSize: 11, fontWeight: 600,
            margin: 0, lineHeight: 1.3, flex: 1,
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {ex.name}
          </p>
        </div>
        <form action={removeExercise.bind(null, ex.id, programId)}>
          <button type="submit" style={{
            background: 'transparent', color: '#3f3f46', border: 'none',
            fontSize: 13, cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0,
          }}>×</button>
        </form>
      </div>
      <p style={{ color: '#4b5563', fontSize: 10, margin: '2px 0 0 12px' }}>
        {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ''}
        {ex.duration_minutes ? `${ex.duration_minutes}min` : ''}
        {ex.rest_seconds ? ` · ${ex.rest_seconds}s rest` : ''}
      </p>
      {ex.notes && (
        <p style={{ color: '#374151', fontSize: 10, margin: '2px 0 0 12px', lineHeight: 1.3 }}>
          {ex.notes}
        </p>
      )}
    </div>
  )
}

function DayCol({
  dayNum, dayName, dayDate, exercises, sessionTime, isEditing, isOver,
  onSetTime, onStartEditing, onMouseEnter, onMouseLeave, onGripMouseDown,
  programId, currentWeek,
}: {
  dayNum: number
  dayName: string
  dayDate: string
  exercises: Exercise[]
  sessionTime: string
  isEditing: boolean
  isOver: boolean
  onSetTime: (v: string) => void
  onStartEditing: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onGripMouseDown: (ex: Exercise, e: React.MouseEvent) => void
  programId: string
  currentWeek: number
}) {
  const isWeekend = dayNum >= 6

  return (
    <div
      data-day={dayNum}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: isOver ? '#0a1f0a' : isWeekend ? '#0d0d0d' : '#111',
        border: `2px solid ${isOver ? '#22c55e' : isWeekend ? '#181818' : '#1f1f1f'}`,
        borderRadius: 12, padding: '10px 9px',
        display: 'flex', flexDirection: 'column', gap: 6, minHeight: 260,
        transition: 'border-color 0.1s, background 0.1s',
      }}
    >
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${isOver ? '#22c55e20' : '#1a1a1a'}`,
        paddingBottom: 7, marginBottom: 2,
      }}>
        <p style={{
          color: isOver ? '#22c55e' : isWeekend ? '#3f3f46' : '#9ca3af',
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: 1, margin: '0 0 1px', transition: 'color 0.1s',
        }}>{dayName}</p>
        <p style={{ color: isWeekend ? '#2a2a2a' : '#3f3f46', fontSize: 10, margin: '0 0 5px' }}>
          {dayDate}
        </p>

        {isEditing ? (
          <input
            type="time"
            autoFocus
            value={sessionTime}
            onChange={e => onSetTime(e.target.value)}
            onBlur={onStartEditing}
            style={{
              background: '#1a1a1a', border: '1px solid #FACC1550',
              borderRadius: 4, color: '#FACC15', fontSize: 10,
              outline: 'none', padding: '2px 5px', width: '100%',
              colorScheme: 'dark', cursor: 'pointer', marginBottom: 3,
            }}
          />
        ) : (
          <button
            onClick={onStartEditing}
            style={{
              background: 'transparent', border: 'none', padding: 0,
              cursor: 'pointer', textAlign: 'left', width: '100%', display: 'block', marginBottom: 2,
            }}
          >
            {sessionTime
              ? <span style={{ color: '#FACC15', fontSize: 10, fontWeight: 700 }}>{fmt12(sessionTime)}</span>
              : <span style={{ color: '#2a2a2a', fontSize: 10 }}>+ set time</span>
            }
          </button>
        )}

        {exercises.length > 0 && (
          <p style={{ color: '#3f3f46', fontSize: 9, fontWeight: 600, margin: 0 }}>
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {exercises.length === 0 && (
          <p style={{
            color: isOver ? '#22c55e60' : '#252525',
            fontSize: 10, margin: 0, lineHeight: 1.5,
            transition: 'color 0.1s',
          }}>
            {isOver ? '↓ Drop here' : isWeekend ? 'Rest' : 'Empty'}
          </p>
        )}
        {exercises.map(ex => (
          <ExCard
            key={ex.id}
            ex={ex}
            programId={programId}
            onGripMouseDown={e => { e.preventDefault(); onGripMouseDown(ex, e) }}
          />
        ))}
      </div>

      <details>
        <summary style={{
          color: '#FACC15', fontSize: 10, fontWeight: 700,
          cursor: 'pointer', listStyle: 'none', padding: '4px 0', userSelect: 'none',
        }}>+ Custom</summary>
        <form
          action={addExercise.bind(null, programId, currentWeek, dayNum)}
          style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}
        >
          <input name="name" placeholder="Exercise name" required style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            <input name="sets" type="number" placeholder="Sets" min={1} style={inputStyle} />
            <input name="reps" type="number" placeholder="Reps" min={1} style={inputStyle} />
          </div>
          <input name="duration_minutes" type="number" placeholder="Duration (min)" step={0.5} min={0} style={inputStyle} />
          <select name="rest_seconds" defaultValue="60" style={inputStyle}>
            <option value="30">30s rest</option>
            <option value="60">60s rest</option>
            <option value="90">90s rest</option>
            <option value="120">2min rest</option>
            <option value="180">3min rest</option>
          </select>
          <input name="notes" placeholder="Notes (optional)" style={inputStyle} />
          <button type="submit" style={{
            background: '#FACC15', color: '#000', fontWeight: 700, border: 'none',
            borderRadius: 5, padding: '6px 0', fontSize: 11, cursor: 'pointer',
          }}>Add</button>
        </form>
      </details>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DayGridClient({
  programId,
  currentWeek,
  byDay,
  enrollments,
  unenrolled,
  allTraineesCount,
}: {
  programId: string
  currentWeek: number
  byDay: Record<number, Exercise[]>
  enrollments: Enrollment[]
  unenrolled: Trainee[]
  allTraineesCount: number
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const storageKey = `prgm_${programId}_w${currentWeek}_times`
  const [dayTimes, setDayTimesState] = useState<Record<number, string>>({})
  const [editingDay, setEditingDay] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setDayTimesState(JSON.parse(raw))
    } catch {}
  }, [storageKey])

  function setDayTime(dayNum: number, val: string) {
    const next = { ...dayTimes, [dayNum]: val }
    setDayTimesState(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
  }

  const referenceMonday = useMemo(() => {
    const today = new Date()
    const dow = today.getDay()
    const d = new Date(today)
    d.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  function getDayDate(weekNum: number, dayNum: number) {
    const d = new Date(referenceMonday)
    d.setDate(referenceMonday.getDate() + (weekNum - 1) * 7 + (dayNum - 1))
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const [selectedTrainees, setSelectedTrainees] = useState<Set<string>>(new Set())

  // ── Custom drag state ─────────────────────────────────────────────────────
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  const isDragging = dragInfo !== null

  // Refs so closures inside event handlers always see the latest values
  const dragInfoRef = useRef<DragInfo | null>(null)
  const programIdRef = useRef(programId)
  const currentWeekRef = useRef(currentWeek)
  useEffect(() => { programIdRef.current = programId }, [programId])
  useEffect(() => { currentWeekRef.current = currentWeek }, [currentWeek])

  // Walk the DOM stack at (x,y) to find a day column
  function findDayAtPoint(x: number, y: number): number | null {
    const stack = document.elementsFromPoint(x, y)
    for (const el of stack) {
      let node: Element | null = el
      while (node) {
        const attr = node.getAttribute('data-day')
        if (attr) return parseInt(attr, 10)
        node = node.parentElement
      }
    }
    return null
  }

  // Registers listeners IMMEDIATELY inside the mousedown handler — before
  // React re-renders — so mouseup can never fire before the listener exists.
  function beginDrag(info: DragInfo, startX: number, startY: number) {
    if (dragInfoRef.current) return
    dragInfoRef.current = info

    function onMove(e: MouseEvent) {
      setDragPos({ x: e.clientX, y: e.clientY })
      setHoveredDay(findDayAtPoint(e.clientX, e.clientY))
    }

    function onUp(e: MouseEvent) {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)

      const di = dragInfoRef.current
      dragInfoRef.current = null
      setDragInfo(null)
      setHoveredDay(null)

      const dayNum = findDayAtPoint(e.clientX, e.clientY)
      if (dayNum === null || di === null) return

      startTransition(async () => {
        if (di.type === 'library') {
          const fd = new FormData()
          fd.append('name', di.ex.name)
          if (di.ex.sets) fd.append('sets', String(di.ex.sets))
          if (di.ex.reps) fd.append('reps', String(di.ex.reps))
          if (di.ex.duration) fd.append('duration_minutes', String(di.ex.duration))
          fd.append('rest_seconds', String(di.ex.rest || 60))
          await addExercise(programIdRef.current, currentWeekRef.current, dayNum, fd)
        } else if (di.type === 'existing' && di.currentDay !== dayNum) {
          await moveExercise(di.id, dayNum, programIdRef.current)
        }
        router.refresh()
      })
    }

    // Register BEFORE setState so no event can slip through before the render
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)

    setDragInfo(info)
    setDragPos({ x: startX, y: startY })
  }

  function startLibDrag(ex: LibExercise, e: React.MouseEvent) {
    e.preventDefault()
    beginDrag({ type: 'library', ex, label: ex.name }, e.clientX, e.clientY)
  }

  function startExDrag(ex: Exercise, e: React.MouseEvent) {
    e.preventDefault()
    beginDrag({ type: 'existing', id: ex.id, currentDay: ex.day_number, label: ex.name }, e.clientX, e.clientY)
  }

  const filteredLib = EXERCISE_LIBRARY.filter(ex => {
    const matchCat = activeCategory === 'all' || ex.category === activeCategory
    const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function toggleTrainee(id: string) {
    setSelectedTrainees(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleAssignTrainees() {
    if (!selectedTrainees.size) return
    startTransition(async () => {
      await assignTrainees(programId, [...selectedTrainees])
      setSelectedTrainees(new Set())
      router.refresh()
    })
  }

  return (
    <>
      {/* Floating drag preview — pointer-events:none so onMouseEnter fires on day columns below */}
      {isDragging && (
        <div style={{
          position: 'fixed',
          left: dragPos.x + 14,
          top: dragPos.y + 14,
          pointerEvents: 'none',
          zIndex: 9999,
          background: '#1a1a1a',
          border: '1px solid #FACC15',
          borderRadius: 7,
          padding: '7px 12px',
          color: '#FACC15',
          fontSize: 12,
          fontWeight: 700,
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          whiteSpace: 'nowrap',
          cursor: 'grabbing',
        }}>
          {dragInfo?.label}
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* ── Main column ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Exercise Library */}
          <div style={{
            background: '#0f0f0f', border: '1px solid #1f1f1f',
            borderRadius: 12, padding: '12px 14px', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ color: '#3f3f46', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, flexShrink: 0 }}>
                Exercise Library
              </span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
                {CATEGORIES.map(cat => {
                  const isActive = activeCategory === cat.id
                  const color = cat.id === 'all' ? '#FACC15' : CAT_COLOR[cat.id]
                  return (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                      background: isActive ? color : '#1a1a1a',
                      color: isActive ? '#000' : '#52525b',
                      border: `1px solid ${isActive ? color : '#2a2a2a'}`,
                      borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.1s',
                    }}>
                      {cat.label}
                    </button>
                  )
                })}
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                style={{
                  background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6,
                  padding: '4px 10px', color: '#d1d5db', fontSize: 11, outline: 'none', width: 100,
                }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxHeight: 84, overflowY: 'auto' }}>
              {filteredLib.length === 0
                ? <p style={{ color: '#3f3f46', fontSize: 11, margin: 0 }}>No matches.</p>
                : filteredLib.map((ex, i) => (
                    <LibChip key={i} ex={ex} onMouseDown={e => { e.preventDefault(); startLibDrag(ex, e) }} />
                  ))
              }
            </div>
            <p style={{ color: '#2a2a2a', fontSize: 10, margin: '8px 0 0' }}>
              Drag any chip onto a day · drag existing exercises between days
            </p>
          </div>

          {/* 7-day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {Array.from({ length: 7 }, (_, i) => {
              const dayNum = i + 1
              return (
                <DayCol
                  key={dayNum}
                  dayNum={dayNum}
                  dayName={DAY_NAMES[i]}
                  dayDate={getDayDate(currentWeek, dayNum)}
                  exercises={byDay[dayNum] ?? []}
                  sessionTime={dayTimes[dayNum] ?? ''}
                  isEditing={editingDay === dayNum}
                  isOver={hoveredDay === dayNum && isDragging}
                  onSetTime={v => setDayTime(dayNum, v)}
                  onStartEditing={() => setEditingDay(prev => prev === dayNum ? null : dayNum)}
                  onMouseEnter={() => setHoveredDay(dayNum)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onGripMouseDown={(ex, e) => startExDrag(ex, e)}
                  programId={programId}
                  currentWeek={currentWeek}
                />
              )
            })}
          </div>
        </div>

        {/* ── Trainees Sidebar ── */}
        <div style={{ flexShrink: 0, width: 220 }}>
          <div style={{
            background: '#111', border: '1px solid #1f1f1f',
            borderRadius: 14, padding: '16px',
          }}>
            <p style={{ color: '#a1a1aa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 12px' }}>
              Trainees
            </p>

            {enrollments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {enrollments.map(enrollment => {
                  const name = enrollment.profiles?.full_name ?? 'Unknown'
                  const initial = name.charAt(0).toUpperCase()
                  const startLabel = new Date(enrollment.start_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
                  return (
                    <div key={enrollment.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 9,
                      background: '#161616', border: '1px solid #252525',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: '#FACC1520', border: '1px solid #FACC1530',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#FACC15', fontSize: 11, fontWeight: 700,
                      }}>{initial}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#e5e7eb', fontSize: 12, fontWeight: 600, margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {name}
                        </p>
                        <p style={{ color: '#3f3f46', fontSize: 10, margin: '1px 0 0' }}>since {startLabel}</p>
                      </div>
                      <form action={unassignTrainee.bind(null, enrollment.id, programId)}>
                        <button type="submit" style={{
                          background: 'transparent', color: '#3f3f46', border: 'none',
                          fontSize: 14, cursor: 'pointer', padding: 0, lineHeight: 1,
                        }}>×</button>
                      </form>
                    </div>
                  )
                })}
              </div>
            )}

            {enrollments.length > 0 && unenrolled.length > 0 && (
              <div style={{ height: 1, background: '#1f1f1f', margin: '0 0 12px' }} />
            )}

            {unenrolled.length === 0 ? (
              <p style={{ color: '#3f3f46', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                {allTraineesCount === 0 ? 'No active clients yet.' : 'All active clients enrolled.'}
              </p>
            ) : (
              <>
                <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, margin: '0 0 8px' }}>Add trainees</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
                  {unenrolled.map(t => {
                    const name = t.profiles?.full_name ?? t.id
                    const isSelected = selectedTrainees.has(t.id)
                    return (
                      <label key={t.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 9px', borderRadius: 8, cursor: 'pointer',
                        background: isSelected ? '#FACC1510' : '#161616',
                        border: `1px solid ${isSelected ? '#FACC1530' : '#252525'}`,
                        transition: 'all 0.1s',
                      }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTrainee(t.id)}
                          style={{ accentColor: '#FACC15', width: 13, height: 13, cursor: 'pointer', flexShrink: 0 }}
                        />
                        <span style={{ color: isSelected ? '#e5e7eb' : '#9ca3af', fontSize: 12, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {name}
                        </span>
                      </label>
                    )
                  })}
                </div>
                <button
                  onClick={handleAssignTrainees}
                  disabled={!selectedTrainees.size}
                  style={{
                    width: '100%',
                    background: selectedTrainees.size ? '#FACC15' : '#161616',
                    color: selectedTrainees.size ? '#000' : '#3f3f46',
                    border: `1px solid ${selectedTrainees.size ? '#FACC15' : '#252525'}`,
                    borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 700,
                    cursor: selectedTrainees.size ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                  }}
                >
                  {selectedTrainees.size > 0
                    ? `Assign ${selectedTrainees.size} trainee${selectedTrainees.size !== 1 ? 's' : ''}`
                    : 'Select trainees above'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
