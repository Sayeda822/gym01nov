import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Dumbbell, Flame, Timer, Trophy, CalendarDays, Play, Sparkles, Activity, LogOut } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import AnimatedCounter from '../components/AnimatedCounter'
import ProgressRing from '../components/ProgressRing'
import QuoteCard from '../components/QuoteCard'
import Avatar from '../components/Avatar'
import { Skeleton } from '../components/Skeleton'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

// Illustrative numbers for the marketing phone mock-up only.
const demo = { name: 'Maya', avatar: 'https://i.pravatar.cc/240?img=47', streak: 23, minutes: 212, goal: 300 }

function HeroStats() {
  const { data, error, loading } = useApi('/stats')
  const stats = [
    { label: 'Members', value: data?.members },
    { label: 'Workouts completed', value: data?.workouts_completed },
    { label: 'Classes this week', value: data?.classes_this_week },
  ]
  return (
    <>
      {stats.map((s) => (
        <div key={s.label}>
          <div className="font-display text-2xl font-bold sm:text-3xl">
            {loading ? <Skeleton className="h-9 w-16" /> : error ? '—' : <AnimatedCounter value={s.value} duration={2.2} />}
          </div>
          <p className="mt-1 text-xs text-muted sm:text-sm">{s.label}</p>
        </div>
      ))}
      {error && <p className="col-span-3 text-xs text-muted">Live stats are taking a breather: {error.message}</p>}
    </>
  )
}

const features = [
  { icon: Dumbbell, title: 'Smart workout library', text: 'Over 200 exercises sorted by muscle group, with sets, reps and difficulty already planned.' },
  { icon: Timer, title: 'Live workout mode', text: 'Big rest timers, one-tap set tracking and a celebration when you finish.' },
  { icon: Trophy, title: 'PRs that pop', text: 'See your strength curve climb and earn trophy badges for every record you break.' },
  { icon: CalendarDays, title: 'Book classes in a tap', text: 'Yoga, HIIT, Spin and Boxing, with live spots left so you never miss out.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-sm"
    >
      <div className="absolute inset-0 -z-10 rounded-[3rem] bg-brand opacity-30 blur-3xl" />
      <div className="glass !rounded-[2.5rem] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={demo.avatar} alt="" className="h-11 w-11 rounded-2xl object-cover" />
            <div>
              <p className="text-xs text-muted">Good morning</p>
              <p className="font-display font-semibold">{demo.name}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-flame/15 px-3 py-1.5 text-sm font-bold text-flame">
            <Flame className="h-4 w-4" /> {demo.streak}
          </span>
        </div>

        <div className="mt-6 flex justify-center">
          <ProgressRing value={demo.minutes} max={demo.goal} size={170} stroke={14}>
            <div>
              <p className="font-display text-4xl font-bold">{demo.minutes}</p>
              <p className="text-xs text-muted">active min</p>
            </div>
          </ProgressRing>
        </div>

        <div className="mt-6 rounded-2xl bg-brand p-4 text-[#0a0d12]">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Up next</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="font-display text-xl font-bold">Push Power</p>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0a0d12] text-[#c6ff3d]">
              <Play className="h-4 w-4 fill-current" />
            </span>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="glass absolute -left-6 top-24 hidden !rounded-2xl px-4 py-3 sm:block"
      >
        <p className="flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 text-lime" /> New PR!</p>
        <p className="text-xs text-muted">Deadlift · 135 kg</p>
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="glass absolute -right-6 bottom-28 hidden !rounded-2xl px-4 py-3 sm:block"
      >
        <p className="flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4 text-cyan" /> 142 bpm</p>
        <p className="text-xs text-muted">Zone 4 · Push it</p>
      </motion.div>
    </motion.div>
  )
}

export default function Landing() {
  const { user, loading, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const startTo = user ? '/dashboard' : '/signup'
  const onLogout = async () => {
    await logout()
    toast('You have been logged out. See you at the next session!', { type: 'info', title: 'Logged out' })
    navigate('/')
  }

  return (
    <div className="ambient relative min-h-dvh overflow-x-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 h-[900px]" />

      <header className="sticky top-0 z-40 border-b border-line/[0.06] bg-bg/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" className="py-2.5 transition hover:text-ink">Features</a>
            <Link to="/classes" className="py-2.5 transition hover:text-ink">Classes</Link>
            <Link to="/library" className="py-2.5 transition hover:text-ink">Workouts</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!loading && (user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 rounded-full border border-line/10 py-1 pl-1 pr-3 transition hover:border-lime/50">
                  <Avatar name={user.full_name} className="h-8 w-8 rounded-full text-xs" />
                  <span className="hidden max-w-[9rem] truncate text-sm font-medium min-[400px]:inline">{user.full_name.split(' ')[0]}</span>
                </Link>
                <button onClick={onLogout} className="grid h-10 w-10 place-items-center rounded-full border border-line/10 text-muted transition hover:border-flame/50 hover:bg-flame/10 hover:text-flame" aria-label="Log out" title="Log out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm">Log in</Link>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-12 md:px-8 md:pt-20 lg:grid-cols-[1.15fr_1fr]">
        <motion.div initial="hidden" animate="show">
          <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-1.5 text-xs font-semibold text-lime">
            <Sparkles className="h-3.5 w-3.5" /> PulseFit 2.0 · Now with live workout mode
          </motion.span>
          <motion.h1 variants={fadeUp} custom={1} className="mt-6 text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl">
            Train smarter.<br />
            <span className="text-gradient">Get stronger.</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mt-6 max-w-lg text-lg text-muted">
            PulseFit is the gym app that plans your workouts, tracks every rep, books your classes and keeps your streak alive.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={startTo} className="btn-primary group px-8 py-4 text-lg">
              Start Your Workout
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/classes" className="btn-ghost px-6 py-4">Browse classes</Link>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="mt-12 grid grid-cols-3 gap-4 border-t border-line/[0.08] pt-8">
            <HeroStats />
          </motion.div>
        </motion.div>

        <HeroVisual />
      </section>

      <div className="overflow-hidden border-y border-line/[0.06] bg-surface/30 py-4">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="flex w-max gap-10 whitespace-nowrap font-display text-xl font-semibold text-muted"
        >
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ['STRENGTH', 'HIIT', 'YOGA', 'SPIN', 'BOXING', 'MOBILITY', 'CARDIO', 'POWER'].map((w) => (
              <span key={w + k} className="flex items-center gap-10">{w}<span className="text-lime">✦</span></span>
            )),
          )}
        </motion.div>
      </div>

      <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12 max-w-2xl">
          <motion.p variants={fadeUp} className="label !text-lime">Everything in one app</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="mt-3 text-4xl font-bold md:text-5xl">Built for the way you actually train.</motion.h2>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="glass group p-6 transition-shadow hover:shadow-glow"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-lime/10 text-lime transition group-hover:bg-brand group-hover:text-[#0a0d12]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10"><QuoteCard /></div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand p-10 text-center text-[#0a0d12] md:p-16">
          <div className="grid-bg absolute inset-0 opacity-40" />
          <h2 className="relative text-4xl font-bold md:text-5xl">Your strongest self starts today.</h2>
          <p className="relative mx-auto mt-4 max-w-md opacity-80">Join the members already training smarter with PulseFit.</p>
          <Link to={startTo} className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[#0a0d12] px-8 py-4 font-display font-semibold text-[#c6ff3d] transition hover:scale-105">
            Start Your Workout <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted md:flex-row md:px-8">
          <Logo size="sm" />
          <p>© {new Date().getFullYear()} PulseFit. Train smarter. Get stronger.</p>
        </div>
      </footer>
    </div>
  )
}
