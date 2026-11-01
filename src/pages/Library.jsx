import { forwardRef, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SearchX, Dumbbell, Timer, Plus, Repeat, Layers, Check, Loader2, Play } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton, SkeletonCard } from '../components/Skeleton'
import { muscleGroups } from '../data/mock'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'
import { api } from '../lib/api'

const difficultyStyle = {
  Beginner: { cls: 'bg-cyan/15 text-cyan', bars: 1 },
  Intermediate: { cls: 'bg-lime/15 text-lime', bars: 2 },
  Advanced: { cls: 'bg-flame/15 text-flame', bars: 3 },
}

const ExerciseCard = forwardRef(function ExerciseCard({ ex, added, adding, onAdd }, ref) {
  const d = difficultyStyle[ex.difficulty]
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className={`glass group flex flex-col p-5 transition-shadow hover:shadow-glow ${added ? '!border-lime/30' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-line/[0.05] text-lime transition group-hover:bg-brand group-hover:text-[#0a0d12]">
          <Dumbbell className="h-6 w-6" />
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${d.cls}`}>
          <span className="flex items-end gap-[2px]">
            {[1, 2, 3].map((b) => (
              <span key={b} className={`w-[3px] rounded-full bg-current ${b <= d.bars ? '' : 'opacity-25'}`} style={{ height: 4 + b * 3 }} />
            ))}
          </span>
          {ex.difficulty}
        </span>
      </div>
      <p className="label mt-5 !text-[10px]">{ex.muscle_group}</p>
      <h3 className="mt-1 text-lg font-semibold leading-tight">{ex.name}</h3>
      {ex.description && <p className="mt-1.5 line-clamp-2 text-xs text-muted">{ex.description}</p>}

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-line/[0.04] py-2.5">
          <Layers className="mx-auto h-4 w-4 text-muted" />
          <p className="mt-1 font-display font-bold">{ex.sets}</p>
          <p className="text-[10px] text-muted">sets</p>
        </div>
        <div className="rounded-xl bg-line/[0.04] py-2.5">
          <Repeat className="mx-auto h-4 w-4 text-muted" />
          <p className="mt-1 font-display font-bold">{ex.reps}</p>
          <p className="text-[10px] text-muted">reps</p>
        </div>
        <div className="rounded-xl bg-line/[0.04] py-2.5">
          <Timer className="mx-auto h-4 w-4 text-muted" />
          <p className="mt-1 font-display font-bold">{ex.rest_seconds}s</p>
          <p className="text-[10px] text-muted">rest</p>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <button
          onClick={() => onAdd(ex)}
          disabled={added || adding}
          className={`flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            added ? 'border border-lime/40 bg-lime/10 text-lime' : 'border border-lime/30 text-lime hover:bg-lime hover:text-[#0a0d12]'
          }`}
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : added ? <><Check className="h-4 w-4" /> In today’s workout</> : <><Plus className="h-4 w-4" /> Add to today’s workout</>}
        </button>
      </div>
    </motion.div>
  )
})

function LibrarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} className="space-y-4">
          <div className="flex justify-between"><Skeleton className="h-12 w-12 !rounded-2xl" /><Skeleton className="h-6 w-24 rounded-full" /></div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-3/4" />
          <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((j) => <Skeleton key={j} className="h-16" />)}</div>
          <Skeleton className="h-10 w-full rounded-full" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export default function Library() {
  const [group, setGroup] = useState('All')
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(() => new Set())
  const { data, error, loading, reload, setData } = useApi('/exercises')
  const toast = useToast()

  const exercises = data?.exercises ?? []
  const addedIds = useMemo(() => new Set(data?.todayExerciseIds ?? []), [data])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises.filter(
      (e) => (group === 'All' || e.muscle_group === group) && (!q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
    )
  }, [exercises, group, query])

  const add = async (ex) => {
    // Optimistic: mark as added immediately, roll back on failure.
    setAdding((s) => new Set(s).add(ex.id))
    setData((d) => ({ ...d, todayExerciseIds: [...d.todayExerciseIds, ex.id] }))
    try {
      await api('/workouts', { method: 'POST', body: { exercise_id: ex.id } })
      toast(`${ex.name} added to today’s workout.`, { title: 'Added 💪' })
    } catch (err) {
      if (err.code !== 'ALREADY_ADDED') {
        setData((d) => ({ ...d, todayExerciseIds: d.todayExerciseIds.filter((id) => id !== ex.id) }))
      }
      toast(err.message, { type: err.code === 'ALREADY_ADDED' ? 'info' : 'error', title: err.code === 'ALREADY_ADDED' ? 'Already there' : "Couldn't add that" })
    } finally {
      setAdding((s) => { const n = new Set(s); n.delete(ex.id); return n })
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Workout library"
        title="Find your next move"
        subtitle={loading ? 'Loading exercises…' : `${exercises.length} exercises, each with sets, reps and rest already planned.`}
        right={addedIds.size > 0 && (
          <Link to="/workout" className="btn-primary self-start md:self-auto">
            <Play className="h-4 w-4 fill-current" /> Start workout · {addedIds.size}
          </Link>
        )}
      />

      <div className="sticky top-[65px] z-20 -mx-4 mb-6 space-y-3 bg-bg/80 px-4 py-3 backdrop-blur-xl lg:top-0 lg:mx-0 lg:rounded-2xl lg:px-0">
        <label className="glass flex items-center gap-3 !rounded-2xl px-4 py-3 focus-within:border-lime/50">
          <Search className="h-5 w-5 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {muscleGroups.map((g) => {
            const active = g === group
            return (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`chip relative shrink-0 ${active ? 'border-transparent text-[#0a0d12]' : 'text-muted hover:text-ink'}`}
              >
                {active && <motion.span layoutId="chip-bg" className="absolute inset-0 rounded-full bg-brand" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <span className="relative">{g}</span>
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <LibrarySkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No exercises found"
          message={query ? `Nothing matches “${query}”${group !== 'All' ? ` in ${group}` : ''}. Try another search or muscle group.` : 'No exercises in this group yet.'}
          action={<button className="btn-ghost" onClick={() => { setQuery(''); setGroup('All') }}>Clear filters</button>}
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((ex) => (
              <ExerciseCard key={ex.id} ex={ex} added={addedIds.has(ex.id)} adding={adding.has(ex.id)} onAdd={add} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
