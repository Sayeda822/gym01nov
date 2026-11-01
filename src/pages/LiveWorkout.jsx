import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, Pause, Play, Plus, SkipForward, Trophy, Timer, Layers, X, Dumbbell, Trash2, Flag, Loader2, CheckCircle2 } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton, SkeletonCard } from '../components/Skeleton'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'
import { api } from '../lib/api'

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function fireConfetti() {
  const colors = ['#c6ff3d', '#22e4ff', '#ffffff', '#ff6b3d']
  const end = Date.now() + 1800
  ;(function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors })
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  confetti({ particleCount: 160, spread: 100, startVelocity: 45, origin: { y: 0.55 }, colors })
}

function RestTimer({ remaining, total, running, done, onToggle, onAdd, onSkip }) {
  const size = 260
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = total ? remaining / total : 0
  const resting = total > 0 && remaining > 0

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <div className={`absolute inset-6 rounded-full blur-2xl transition-opacity duration-500 ${resting ? 'bg-lime/25 opacity-100' : 'opacity-0'}`} />
        <svg width={size} height={size} className="relative -rotate-90">
          <defs>
            <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: 'rgb(var(--lime))' }} />
              <stop offset="100%" style={{ stopColor: 'rgb(var(--cyan))' }} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line) / 0.07)" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke="url(#timerGrad)" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 1, ease: 'linear' }}
            style={{ filter: 'drop-shadow(0 0 10px rgb(var(--lime) / 0.5))' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="label">{resting ? 'Rest' : done ? 'Finished' : 'Ready'}</p>
            <AnimatePresence mode="popLayout">
              <motion.p
                key={resting ? remaining : done ? 'done' : 'go'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`font-display text-7xl font-bold tabular-nums ${resting && remaining <= 5 ? 'text-flame' : ''}`}
              >
                {resting ? fmt(remaining) : done ? 'DONE' : 'GO'}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-muted">{resting ? 'Breathe. Hydrate.' : done ? 'Great work today' : 'Hit your next set'}</p>
          </div>
        </div>
      </div>
      <div className={`mt-4 flex items-center gap-3 ${done ? 'invisible' : ''}`}>
        <button onClick={onAdd} disabled={!resting} className="btn-ghost h-12 w-12 !p-0 disabled:opacity-30" aria-label="Add 15 seconds"><Plus className="h-5 w-5" /></button>
        <button onClick={onToggle} disabled={!resting} className="btn-primary h-16 w-16 !p-0" aria-label={running ? 'Pause' : 'Resume'}>
          {running ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
        </button>
        <button onClick={onSkip} disabled={!resting} className="btn-ghost h-12 w-12 !p-0 disabled:opacity-30" aria-label="Skip rest"><SkipForward className="h-5 w-5" /></button>
      </div>
    </div>
  )
}

function WorkoutSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-2.5 w-full rounded-full" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <SkeletonCard className="grid place-items-center py-10"><Skeleton className="h-60 w-60 !rounded-full" /></SkeletonCard>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} className="space-y-4">
              <div className="flex gap-3"><Skeleton className="h-9 w-9" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></div>
              <div className="flex gap-2">{[0, 1, 2, 3].map((j) => <Skeleton key={j} className="h-12 flex-1 !rounded-2xl" />)}</div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LiveWorkout() {
  const toast = useToast()
  const { data, error, loading, reload, setData } = useApi('/workouts')
  const workout = data?.workout

  const [rest, setRest] = useState({ remaining: 0, total: 0 })
  const [running, setRunning] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [finishing, setFinishing] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const pending = useRef(new Set())
  const startRequested = useRef(null)

  const sets = workout?.exercises.flatMap((e) => e.sets) ?? []
  const totalSets = sets.length
  const doneSets = sets.filter((s) => s.completed).length
  const progress = totalSets ? doneSets / totalSets : 0
  const isCompleted = workout?.status === 'completed'

  const patchWorkout = (patch) => setData((d) => ({ ...d, workout: { ...d.workout, ...patch } }))

  // Opening Live Workout Mode starts the clock.
  useEffect(() => {
    if (!workout || workout.status !== 'planned' || workout.exercises.length === 0 || startRequested.current === workout.id) return
    startRequested.current = workout.id
    api('/workouts', { method: 'PATCH', body: { id: workout.id, action: 'start' } })
      .then(({ workout: w }) => patchWorkout({ status: w.status, started_at: w.started_at }))
      .catch((err) => toast(err.message, { type: 'error', title: "Couldn't start the clock" }))
  }, [workout?.id, workout?.status])

  // workout clock
  useEffect(() => {
    if (!workout?.started_at || isCompleted) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [workout?.started_at, isCompleted])
  const elapsed = workout?.started_at ? Math.max(0, Math.floor(((isCompleted ? Date.parse(workout.completed_at) : now) - Date.parse(workout.started_at)) / 1000)) : 0

  // rest countdown
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setRest((r) => ({ ...r, remaining: Math.max(r.remaining - 1, 0) })), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (running && rest.remaining === 0) {
      setRunning(false)
      setRest({ remaining: 0, total: 0 })
      toast('Rest is over. Time for your next set!', { type: 'info', title: 'Let’s go 💪' })
    }
  }, [running, rest.remaining, toast])

  const finish = useCallback(async () => {
    if (!workout || finishing) return
    setFinishing(true)
    setRunning(false)
    setRest({ remaining: 0, total: 0 })
    try {
      await Promise.allSettled([...pending.current]) // make sure every tick is saved first
      const { workout: w } = await api('/workouts', { method: 'PATCH', body: { id: workout.id, action: 'finish' } })
      patchWorkout({ status: w.status, duration_minutes: w.duration_minutes, started_at: w.started_at, completed_at: w.completed_at })
      setCelebrate(true)
      fireConfetti()
    } catch (err) {
      toast(`${err.message} Your sets are saved. Tap “Finish workout” to try again.`, { type: 'error', title: "Couldn't finish the workout" })
    } finally {
      setFinishing(false)
    }
  }, [workout, finishing, toast])

  // Auto-finish when the last set is ticked.
  const autoFinished = useRef(false)
  useEffect(() => {
    if (totalSets > 0 && doneSets === totalSets && !isCompleted && !autoFinished.current) {
      autoFinished.current = true
      finish()
    }
    if (doneSets < totalSets) autoFinished.current = false
  }, [doneSets, totalSets, isCompleted, finish])

  const setCompleted = (setId, completed) =>
    setData((d) => ({
      ...d,
      workout: {
        ...d.workout,
        exercises: d.workout.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, completed } : s)) })),
      },
    }))

  const toggleSet = (ex, set) => {
    if (isCompleted || finishing) return
    const next = !set.completed
    setCompleted(set.id, next) // optimistic
    if (next && doneSets + 1 < totalSets) {
      setRest({ remaining: ex.rest_seconds, total: ex.rest_seconds })
      setRunning(ex.rest_seconds > 0)
    }
    const req = api('/sets', { method: 'PATCH', body: { id: set.id, completed: next } })
      .then(() => {
        if (next && workout.status === 'planned') patchWorkout({ status: 'in_progress', started_at: workout.started_at ?? new Date().toISOString() })
      })
      .catch((err) => {
        setCompleted(set.id, !next)
        toast(err.message, { type: 'error', title: "That set didn't save" })
      })
      .finally(() => pending.current.delete(req))
    pending.current.add(req)
  }

  const removeExercise = async (ex) => {
    try {
      await api(`/workouts?workout_exercise_id=${ex.id}`, { method: 'DELETE' })
      toast(`${ex.name} removed from today’s workout.`, { type: 'info', title: 'Removed' })
      reload({ quiet: true })
    } catch (err) {
      toast(err.message, { type: 'error', title: "Couldn't remove that" })
    }
  }

  if (loading) return <WorkoutSkeleton />
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!workout || workout.exercises.length === 0) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No workout yet today."
        message="Pick one from the Library! Add a few exercises and come back here to train."
        action={<Link to="/library" className="btn-primary"><Plus className="h-4 w-4" /> Open Library</Link>}
      />
    )
  }

  const activeIdx = workout.exercises.findIndex((e) => e.sets.some((s) => !s.completed))

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="label mb-2 flex items-center gap-2 !text-lime">
            {isCompleted ? (
              <><CheckCircle2 className="h-3.5 w-3.5" /> Completed</>
            ) : (
              <><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-lime" /></span> Live workout</>
            )}
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">{workout.name}</h1>
          <p className="mt-1 text-muted">{[...new Set(workout.exercises.map((e) => e.muscle_group))].join(' · ')}</p>
        </div>
        <div className="glass shrink-0 !rounded-2xl px-4 py-3 text-right">
          <p className="flex items-center justify-end gap-1.5 text-xs text-muted"><Timer className="h-3.5 w-3.5" /> {isCompleted ? 'Duration' : 'Elapsed'}</p>
          <p className="font-display text-2xl font-bold tabular-nums">{fmt(elapsed)}</p>
        </div>
      </div>

      {/* progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">{doneSets} of {totalSets} sets</span>
          <span className="font-semibold text-lime">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-line/[0.06]">
          <motion.div className="h-full rounded-full bg-brand shadow-glow" animate={{ width: `${progress * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="glass flex items-center justify-center p-6 lg:sticky lg:top-10 lg:self-start">
          <RestTimer
            done={isCompleted}
            remaining={rest.remaining}
            total={rest.total}
            running={running}
            onToggle={() => setRunning((r) => !r)}
            onAdd={() => setRest((r) => ({ remaining: r.remaining + 15, total: r.total + 15 }))}
            onSkip={() => { setRunning(false); setRest({ remaining: 0, total: 0 }) }}
          />
        </div>

        <div className="space-y-4">
          {workout.exercises.map((ex, ei) => {
            const allDone = ex.sets.every((s) => s.completed)
            const noneDone = ex.sets.every((s) => !s.completed)
            const isActive = ei === activeIdx && !isCompleted
            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ei * 0.06 }}
                className={`glass p-5 transition-all duration-300 ${isActive ? '!border-lime/40 shadow-glow' : ''} ${allDone ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display font-bold ${allDone ? 'bg-brand text-[#0a0d12]' : 'bg-line/[0.06]'}`}>
                      {allDone ? <Check className="h-5 w-5" /> : ei + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold leading-tight">{ex.name}</h3>
                      <p className="text-xs text-muted">{ex.reps} reps · {ex.rest_seconds}s rest</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && <span className="rounded-full bg-lime/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-lime">Now</span>}
                    {noneDone && !isCompleted && (
                      <button onClick={() => removeExercise(ex)} className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-flame/10 hover:text-flame" aria-label={`Remove ${ex.name}`} title="Remove from workout">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ex.sets.map((set) => (
                    <motion.button
                      key={set.id}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => toggleSet(ex, set)}
                      disabled={isCompleted || finishing}
                      className={`flex h-12 min-w-[4.5rem] flex-1 items-center justify-center gap-1.5 rounded-2xl border text-sm font-semibold transition-colors ${
                        set.completed ? 'border-transparent bg-brand text-[#0a0d12] shadow-glow' : 'border-line/10 text-muted hover:border-lime/40 hover:text-ink'
                      }`}
                      aria-pressed={set.completed}
                      aria-label={`${ex.name} set ${set.set_number}`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {set.completed ? (
                          <motion.span key="c" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}><Check className="h-4 w-4" strokeWidth={3} /></motion.span>
                        ) : (
                          <motion.span key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Set {set.set_number}</motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )
          })}

          {isCompleted ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to="/dashboard" className="btn-primary flex-1">Back to Dashboard</Link>
              <Link to="/library" className="btn-ghost flex-1"><Plus className="h-4 w-4" /> Plan another</Link>
            </div>
          ) : (
            doneSets > 0 && (
              <button onClick={finish} disabled={finishing} className="btn-ghost w-full text-sm">
                {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />} Finish workout
              </button>
            )
          )}
        </div>
      </div>

      <AnimatePresence>
        {celebrate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-bg/70 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="glass relative w-full max-w-md p-8 text-center"
            >
              <button onClick={() => setCelebrate(false)} className="absolute right-4 top-4 text-muted hover:text-ink" aria-label="Close"><X className="h-5 w-5" /></button>
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', delay: 0.15 }}
                className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand text-[#0a0d12] shadow-glow"
              >
                <Trophy className="h-10 w-10" />
              </motion.div>
              <h2 className="mt-6 text-3xl font-bold">Workout crushed!</h2>
              <p className="mt-2 text-muted">You finished <span className="font-semibold text-ink">{workout.name}</span>. Saved to your history 🔥</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-line/[0.05] p-3"><p className="font-display text-xl font-bold">{workout.duration_minutes}</p><p className="text-xs text-muted">minutes</p></div>
                <div className="rounded-2xl bg-line/[0.05] p-3"><p className="font-display text-xl font-bold">{doneSets}</p><p className="text-xs text-muted">sets</p></div>
                <div className="rounded-2xl bg-line/[0.05] p-3"><p className="flex items-center justify-center gap-1 font-display text-xl font-bold"><Layers className="h-4 w-4 text-lime" />{workout.exercises.length}</p><p className="text-xs text-muted">exercises</p></div>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link to="/dashboard" className="btn-primary flex-1">See dashboard</Link>
                <button onClick={() => setCelebrate(false)} className="btn-ghost flex-1">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
