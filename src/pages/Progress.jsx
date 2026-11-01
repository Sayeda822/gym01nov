import { useState } from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Trophy, TrendingUp, Medal } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import AnimatedCounter from '../components/AnimatedCounter'
import { ChartTooltip } from './Dashboard'
import { personalRecords, strengthHistory } from '../data/mock'

const lifts = [
  { key: 'deadlift', name: 'Deadlift', color: '#c6ff3d' },
  { key: 'squat', name: 'Squat', color: '#22e4ff' },
  { key: 'bench', name: 'Bench', color: '#a78bfa' },
]

const tiers = {
  gold: { ring: 'from-[#fde047] to-[#f59e0b]', color: '#fbbf24', label: 'Gold' },
  silver: { ring: 'from-[#e5e7eb] to-[#94a3b8]', color: '#cbd5e1', label: 'Silver' },
  bronze: { ring: 'from-[#fdba74] to-[#c2410c]', color: '#fb923c', label: 'Bronze' },
}

export default function Progress() {
  const [visible, setVisible] = useState(() => new Set(lifts.map((l) => l.key)))
  const toggle = (k) => setVisible((s) => {
    const n = new Set(s)
    if (n.has(k) && n.size > 1) n.delete(k)
    else n.add(k)
    return n
  })

  const first = strengthHistory[0]
  const last = strengthHistory[strengthHistory.length - 1]

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Progress" title="Look how far you’ve come" subtitle="Your strength over the last 6 months." />

      <div className="grid grid-cols-3 gap-3 md:gap-5">
        {lifts.map((l, i) => {
          const gain = last[l.key] - first[l.key]
          const pct = Math.round((gain / first[l.key]) * 100)
          return (
            <GlassCard key={l.key} delay={i * 0.06} className="!p-4 md:!p-5">
              <p className="label !text-[10px] md:!text-xs">{l.name}</p>
              <p className="mt-2 font-display text-2xl font-bold md:text-4xl">
                <AnimatedCounter value={last[l.key]} decimals={last[l.key] % 1 ? 1 : 0} /><span className="text-sm text-muted md:text-lg"> kg</span>
              </p>
              <p className="tint mt-1 flex items-center gap-1 text-xs font-semibold" style={{ '--tint': l.color }}>
                <TrendingUp className="h-3.5 w-3.5" /> +{pct}%
              </p>
            </GlassCard>
          )
        })}
      </div>

      <GlassCard hover={false} delay={0.15}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Strength gains</h3>
            <p className="text-sm text-muted">Estimated 1-rep max (kg)</p>
          </div>
          <div className="flex gap-2">
            {lifts.map((l) => (
              <button
                key={l.key}
                onClick={() => toggle(l.key)}
                className={`chip flex items-center gap-2 !px-3 text-xs ${visible.has(l.key) ? 'bg-line/[0.06] text-ink' : 'text-muted opacity-50'}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />{l.name}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={strengthHistory} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <defs>
                {lifts.map((l) => (
                  <linearGradient key={l.key} id={`g-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={l.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={l.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgb(var(--line) / 0.06)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip content={<ChartTooltip unit=" kg" />} cursor={{ stroke: 'rgb(var(--line) / 0.15)' }} />
              {lifts.filter((l) => visible.has(l.key)).map((l) => (
                <Area
                  key={l.key}
                  type="monotone"
                  dataKey={l.key}
                  name={l.name}
                  stroke={l.color}
                  strokeWidth={3}
                  fill={`url(#g-${l.key})`}
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, strokeWidth: 3, stroke: 'rgb(var(--bg))' }}
                  animationDuration={1600}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold"><Trophy className="h-5 w-5 text-lime" /> Personal records</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personalRecords.map((pr, i) => {
            const t = tiers[pr.tier]
            return (
              <GlassCard key={pr.lift} delay={0.2 + i * 0.05} className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: [0, -12, 12, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.ring} text-[#0a0d12] shadow-lg`}
                >
                  {pr.tier === 'gold' ? <Trophy className="h-7 w-7" /> : <Medal className="h-7 w-7" />}
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{pr.lift}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider tint`} style={{ '--tint': t.color }}>{t.label}</span>
                  </div>
                  <p className="font-display text-2xl font-bold">{pr.value}</p>
                  <p className="text-xs text-muted"><span className="font-semibold text-lime">{pr.delta}</span> · {pr.date}</p>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
