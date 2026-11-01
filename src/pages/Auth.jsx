import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Mail, Lock, User, Dumbbell, Timer, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

function Field({ icon: Icon, label, ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = props.type === 'password'
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border border-line/10 bg-line/[0.03] px-4 py-3 transition focus-within:border-lime/60 focus-within:shadow-glow">
        <Icon className="h-5 w-5 shrink-0 text-muted" />
        <input {...props} type={isPassword && show ? 'text' : props.type} className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)} className="-my-2 -mr-3 grid h-10 w-10 shrink-0 place-items-center text-muted hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </span>
    </label>
  )
}

function Stepper({ icon: Icon, label, value, onChange, min, max, step, unit }) {
  return (
    <div className="rounded-2xl border border-line/10 bg-line/[0.03] p-4">
      <p className="flex items-center gap-2 text-sm font-medium"><Icon className="h-4 w-4 text-lime" />{label}</p>
      <div className="mt-3 flex items-center justify-between gap-1">
        <button type="button" onClick={() => onChange(Math.max(min, value - step))} className="btn-ghost h-10 w-10 shrink-0 !p-0 text-lg" aria-label={`Decrease ${label}`}>−</button>
        <p className="min-w-0 text-center font-display text-2xl font-bold tabular-nums">{value}<span className="ml-1 text-xs font-medium text-muted">{unit}</span></p>
        <button type="button" onClick={() => onChange(Math.min(max, value + step))} className="btn-ghost h-10 w-10 shrink-0 !p-0 text-lg" aria-label={`Increase ${label}`}>+</button>
      </div>
    </div>
  )
}

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="ambient relative flex min-h-dvh flex-col px-4 pt-4 md:px-8">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        <ThemeToggle />
      </div>
      <div className="grid flex-1 place-items-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-brand opacity-20 blur-3xl" />
          <div className="glass p-6 sm:p-8">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="mt-1.5 text-muted">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          <p className="mt-5 text-center text-sm text-muted">{footer}</p>
        </motion.div>
      </div>
    </div>
  )
}

function FormError({ message }) {
  if (!message) return null
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="flex items-start gap-2 rounded-2xl border border-flame/30 bg-flame/10 px-4 py-3 text-sm text-flame">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{message}
    </motion.p>
  )
}

export function Login() {
  const { user, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const from = useLocation().state?.from || '/dashboard'
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (user && !busy) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const u = await login(form.email, form.password)
      toast(`Good to see you, ${u.full_name.split(' ')[0]}!`, { title: 'Welcome back 👋' })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
      footer={<>New to PulseFit? <Link to="/signup" state={{ from }} className="font-semibold text-lime hover:underline">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field icon={Mail} label="Email" type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Field icon={Lock} label="Password" type="password" autoComplete="current-password" required placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <FormError message={error} />
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Log in <ArrowRight className="h-5 w-5" /></>}
        </button>
      </form>
    </AuthShell>
  )
}

export function Signup() {
  const { user, signup } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const from = useLocation().state?.from || '/dashboard'
  const [form, setForm] = useState({ full_name: '', email: '', password: '', weekly_goal_workouts: 4, weekly_goal_minutes: 150 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }))

  if (user && !busy) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    setBusy(true)
    setError('')
    try {
      const u = await signup(form)
      toast("Your account is ready. Let's build today's workout!", { title: `Welcome, ${u.full_name.split(' ')[0]}! 🎉` })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Join PulseFit"
      subtitle="Set your goals. We'll keep you on track."
      footer={<>Already have an account? <Link to="/login" state={{ from }} className="font-semibold text-lime hover:underline">Log in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field icon={User} label="Full name" autoComplete="name" required placeholder="Alex Morgan" value={form.full_name} onChange={set('full_name')} />
        <Field icon={Mail} label="Email" type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} />
        <Field icon={Lock} label="Password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" value={form.password} onChange={set('password')} />
        <div>
          <p className="label mb-2">Weekly goals</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stepper icon={Dumbbell} label="Workouts" unit="/wk" value={form.weekly_goal_workouts} onChange={set('weekly_goal_workouts')} min={1} max={14} step={1} />
            <Stepper icon={Timer} label="Minutes" unit="/wk" value={form.weekly_goal_minutes} onChange={set('weekly_goal_minutes')} min={30} max={1200} step={30} />
          </div>
        </div>
        <FormError message={error} />
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create account <ArrowRight className="h-5 w-5" /></>}
        </button>
      </form>
    </AuthShell>
  )
}
