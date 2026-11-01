import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Play, Flame, Timer, Dumbbell, ChevronRight, Zap, Layers, CheckCircle2, Plus, Sparkles } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import ProgressRing from '../components/ProgressRing'
import AnimatedCounter from '../components/AnimatedCounter'
import QuoteCard from '../components/QuoteCard'
import ErrorState from '../components/ErrorState'
import { PageSkeleton } from '../components/Skeleton'
import { useApi } from '../hooks/useApi'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass !rounded-xl px-3 py-2 text-sm">
      <p className="font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-muted">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-semibold text-ink">{p.value}{unit}</span>
        </p>
      ))}
    </div>
  )
}

function TodayCard({ workout }) {
  if (!workout || workout.exercises.length === 0) {
    return (
      <GlassCard className="lg:col-span-2 !p-0" delay={0.05}>
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-lime">
              <Sparkles className="h-3.5 w-3.5" /> Today’s workout
            </span>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">No workout yet today.</h2>
            <p className="mt-2 max-w-md text-muted">Pick one from the Library! Add a few exercises and they’ll show up right here, ready to go.</p>
          </div>
          <Link to="/library" className="btn-primary shrink-0 self-start px-8 py-4 text-lg md:self-center">
            <Plus className="h-5 w-5" /> Open Library
          </Link>
        </div>
      </GlassCard>
    )
  }

  const sets = workout.exercises.flatMap((e) => e.sets)
  const doneSets = sets.filter((s) => s.completed).length
  const estMinutes = Math.max(5, Math.round(workout.exercises.reduce((a, e) => a + e.sets.length * (45 + e.rest_seconds), 0) / 60))
  const completed = workout.status === 'completed'

  return (
    <GlassCard className="lg:col-span-2 !p-0" delay={0.05}>
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-lime">
            {completed ? <><CheckCircle2 className="h-3.5 w-3.5" /> Completed today</> : <><Zap className="h-3.5 w-3.5" /> Today’s workout{workout.status === 'in_progress' ? ' · in progress' : ''}</>}
          </span>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">{workout.name}</h2>
          <p className="mt-1 text-muted">{[...new Set(workout.exercises.map((e) => e.muscle_group))].join(' · ')}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5"><Timer className="h-4 w-4 text-cyan" />{completed ? `${workout.duration_minutes} min` : `~${estMinutes} min`}</span>
            <span className="flex items-center gap-1.5"><Dumbbell className="h-4 w-4 text-lime" />{workout.exercises.length} exercise{workout.exercises.length === 1 ? '' : 's'}</span>
            <span className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-flame" />{doneSets}/{sets.length} sets</span>
          </div>
        </div>
        {completed ? (
          <Link to="/library" className="btn-ghost shrink-0 self-start px-6 py-3.5 md:self-center">
            <Plus className="h-5 w-5" /> Plan another
          </Link>
        ) : (
          <Link to="/workout" className="btn-primary group shrink-0 self-start px-8 py-4 text-lg md:self-center">
            <Play className="h-5 w-5 fill-current" /> {workout.status === 'in_progress' ? 'Resume' : 'Start'}
          </Link>
        )}
      </div>
      <div className="relative flex gap-2 overflow-x-auto border-t border-line/[0.06] px-6 py-4 no-scrollbar md:px-8">
        {workout.exercises.map((e, i) => (
          <span key={e.id} className="shrink-0 rounded-full bg-line/[0.05] px-3 py-1.5 text-xs text-muted">
            <span className="mr-1.5 font-semibold text-lime">{i + 1}</span>{e.name}
          </span>
        ))}
      </div>
    </GlassCard>
  )
}

export default function Dashboard() {
  const { data, error, loading, reload } = useApi('/dashboard')

  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { user, todayWorkout, activity, streak, rings } = data
  const totalMin = activity.reduce((a, d) => a + d.minutes, 0)
  const totalWorkouts = activity.reduce((a, d) => a + d.workouts, 0)
  const hasActivity = totalMin > 0
  const yMax = Math.max(30, Math.ceil(Math.max(...activity.map((d) => d.minutes)) / 15) * 15)
  const firstName = user.full_name.split(' ')[0]

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted">{greeting()},</p>
        <h1 className="text-3xl font-bold md:text-4xl">{firstName}, let’s make today count <span className="inline-block animate-pulse">⚡</span></h1>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        <TodayCard workout={todayWorkout} />

        {/* Streak */}
        <GlassCard delay={0.1} className="bg-gradient-to-br from-flame/15 to-transparent">
          <div className="flex items-start justify-between">
            <p className="label">Current streak</p>
            <motion.div
              animate={streak.current > 0 ? { scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] } : {}}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-flame/20"
            >
              <Flame className={`h-7 w-7 text-flame ${streak.current > 0 ? 'fill-flame' : ''}`} />
            </motion.div>
          </div>
          <p className="mt-2 font-display text-6xl font-bold">
            <AnimatedCounter value={streak.current} />
            <span className="ml-2 text-xl text-muted">day{streak.current === 1 ? '' : 's'}</span>
          </p>
          <div className="mt-5 flex gap-1.5">
            {activity.map((d) => {
              const done = d.workouts > 0
              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className={`h-8 w-full rounded-lg ${done ? 'bg-flame shadow-[0_0_14px_-2px_#ff6b3d]' : d.isToday ? 'border border-dashed border-flame/60' : 'bg-line/[0.06]'}`} />
                  <span className="text-[10px] text-muted">{d.day[0]}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-muted">
            {streak.current === 0
              ? 'Finish a workout today to light the flame!'
              : streak.current >= streak.best
                ? `This is your best streak yet. Keep it burning!`
                : `Personal best: ${streak.best} days. ${streak.best - streak.current} more to beat it!`}
          </p>
        </GlassCard>
      </div>

      {/* Rings */}
      <GlassCard delay={0.15} hover={false}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold">This week</h3>
          <Link to="/progress" className="-my-2 flex min-h-10 items-center text-sm text-muted transition hover:text-lime">Details <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ProgressRing size={104} stroke={9} value={rings.workouts.done} max={rings.workouts.goal} label="Workouts" sublabel={`goal ${rings.workouts.goal}`} />
          <ProgressRing size={104} stroke={9} value={rings.minutes.done} max={rings.minutes.goal} label="Active min" sublabel={`goal ${rings.minutes.goal}`} from="rgb(var(--cyan))" to="#a78bfa" />
          <ProgressRing size={104} stroke={9} value={rings.goals.done} max={rings.goals.goal} label="Goals hit" sublabel="workouts · minutes · today" from="#ff6b3d" to="#fbbf24" />
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Weekly chart */}
        <GlassCard delay={0.2} hover={false} className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold">Weekly activity</h3>
              <p className="text-sm text-muted">Active minutes, last 7 days</p>
            </div>
            <div className="flex gap-5 text-right">
              <div><p className="font-display text-2xl font-bold"><AnimatedCounter value={totalMin} /></p><p className="text-xs text-muted">minutes</p></div>
              <div><p className="font-display text-2xl font-bold"><AnimatedCounter value={totalWorkouts} /></p><p className="text-xs text-muted">workouts</p></div>
            </div>
          </div>
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: 'rgb(var(--lime))' }} />
                    <stop offset="100%" style={{ stopColor: 'rgb(var(--cyan))', stopOpacity: 0.6 }} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} domain={[0, yMax]} ticks={[0, yMax / 3, (2 * yMax) / 3, yMax]} tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgb(var(--line) / 0.04)', radius: 12 }} content={<ChartTooltip unit=" min" />} />
                <Bar dataKey="minutes" name="Active" radius={[10, 10, 10, 10]} maxBarSize={38} animationDuration={1400} animationEasing="ease-out">
                  {activity.map((d) => (
                    <Cell key={d.date} fill={d.isToday ? 'url(#barGrad)' : 'rgb(var(--lime) / 0.55)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {!hasActivity && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center pb-6 text-center">
                <p className="max-w-xs text-sm text-muted">No active minutes yet this week. Your first finished workout will show up here.</p>
              </div>
            )}
          </div>
        </GlassCard>

        <QuoteCard delay={0.25} />
      </div>
    </div>
  )
}
