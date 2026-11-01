import { motion } from 'framer-motion'
import { Crown, Flame, Dumbbell, Sunrise, Trophy, Users, HeartPulse, Mountain, Lock, Settings, Bell, LogOut, ChevronRight } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import AnimatedCounter from '../components/AnimatedCounter'
import ThemeToggle from '../components/ThemeToggle'
import { achievements, lifetimeStats, user } from '../data/mock'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/Avatar'

const icons = { Flame, Dumbbell, Sunrise, Trophy, Users, HeartPulse, Mountain, Crown }

export default function Profile() {
  const toast = useToast()
  const { user: me, logout } = useAuth()
  const memberSince = new Date(me.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const xpPct = (user.xp / user.xpNext) * 100
  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <div className="space-y-5">
      <GlassCard hover={false} className="!p-0">
        <div className="h-28 bg-brand opacity-90 md:h-36">
          <div className="grid-bg h-full w-full opacity-50" />
        </div>
        <div className="px-6 pb-6 md:px-8">
          <div className="-mt-14 flex flex-col gap-4 sm:-mt-10 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
                <Avatar name={me.full_name} className="h-28 w-28 rounded-3xl border-4 border-surface text-4xl shadow-glow" />
                <span className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-xl border-2 border-surface bg-bg font-display text-sm font-bold text-lime">{user.level}</span>
              </motion.div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold md:text-3xl">{me.full_name}</h1>
                <p className="text-sm text-muted">{me.email} · Member since {memberSince}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-[#fde047] to-[#f59e0b] px-4 py-2 text-sm font-bold text-[#0a0d12] shadow-[0_0_30px_-6px_#fbbf24] md:self-auto">
              <Crown className="h-4 w-4" /> {user.membership}
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold">Level {user.level}</span>
              <span className="text-muted">{user.xp.toLocaleString()} / {user.xpNext.toLocaleString()} XP</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-line/[0.06]">
              <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} className="h-full rounded-full bg-brand shadow-glow" />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted">
              <p>{(user.xpNext - user.xp).toLocaleString()} XP to Level {user.level + 1}</p>
              <p>Weekly goals: {me.weekly_goal_workouts} workouts · {me.weekly_goal_minutes} min</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {lifetimeStats.map((s, i) => (
          <GlassCard key={s.label} delay={0.05 * i} className="!p-4 text-center md:!p-5">
            <p className="font-display text-3xl font-bold"><AnimatedCounter value={s.value} /></p>
            <p className="text-xs text-muted">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Achievements</h3>
          <span className="text-sm text-muted">{unlocked}/{achievements.length} unlocked</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {achievements.map((a, i) => {
            const Icon = icons[a.icon]
            return (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={{ y: -5 }}
                onClick={() => toast(a.unlocked ? `Unlocked: ${a.desc}` : `Keep going: ${a.desc} to unlock this badge.`, { type: a.unlocked ? 'success' : 'info', title: a.title })}
                className={`glass flex flex-col items-center p-5 text-center transition-shadow hover:shadow-glow ${a.unlocked ? '' : 'opacity-50 grayscale'}`}
              >
                <div className="relative">
                  <div className="grid h-16 w-16 place-items-center rounded-full" style={{ background: `${a.color}1f`, color: a.color, boxShadow: a.unlocked ? `0 0 30px -6px ${a.color}` : 'none' }}>
                    <Icon className="h-8 w-8" />
                  </div>
                  {!a.unlocked && <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-surface"><Lock className="h-3.5 w-3.5 text-muted" /></span>}
                </div>
                <p className="mt-3 text-sm font-semibold">{a.title}</p>
                <p className="mt-0.5 text-xs text-muted">{a.desc}</p>
              </motion.button>
            )
          })}
        </div>
      </div>

      <GlassCard hover={false} className="!p-2">
        {[
          { icon: Bell, label: 'Notifications', action: () => toast('Workout reminders are on for 7:00 AM.', { type: 'info', title: 'Notifications' }) },
          { icon: Settings, label: 'Account settings', action: () => toast("Settings aren't available in this demo yet.", { type: 'error', title: 'Coming soon' }) },
        ].map(({ icon: Icon, label, action }) => (
          <button key={label} onClick={action} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition hover:bg-line/[0.04]">
            <Icon className="h-5 w-5 text-muted" /><span className="flex-1 text-sm font-medium">{label}</span><ChevronRight className="h-4 w-4 text-muted" />
          </button>
        ))}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-2">
          <span className="flex-1 text-sm font-medium">Appearance</span><ThemeToggle />
        </div>
        <button onClick={async () => { await logout(); toast('You have been logged out. See you at the next session!', { type: 'info', title: 'Logged out' }) }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-flame transition hover:bg-flame/10">
          <LogOut className="h-5 w-5" /><span className="text-sm font-medium">Log out</span>
        </button>
      </GlassCard>
    </div>
  )
}
