import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, User, Flower2, Zap, Bike, Swords, Check, CalendarX2, Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { classes as allClasses, classTypes, weekDays } from '../data/mock'
import { useToast } from '../hooks/useToast'

const icons = { Flower2, Zap, Bike, Swords }
const types = ['All', ...Object.keys(classTypes)]

export default function Classes() {
  const toast = useToast()
  const todayIdx = (new Date().getDay() + 6) % 7
  const [day, setDay] = useState(weekDays[todayIdx])
  const [type, setType] = useState('All')
  const [spots, setSpots] = useState(() => Object.fromEntries(allClasses.map((c) => [c.id, c.spots])))
  const [booked, setBooked] = useState(() => new Set())
  const [pending, setPending] = useState(null)

  const list = allClasses.filter((c) => c.day === day && (type === 'All' || c.type === type))

  const book = (c) => {
    if (booked.has(c.id)) {
      setBooked((s) => { const n = new Set(s); n.delete(c.id); return n })
      setSpots((s) => ({ ...s, [c.id]: s[c.id] + 1 }))
      toast(`You've cancelled ${c.name}. Your spot went to someone else.`, { type: 'info', title: 'Booking cancelled' })
      return
    }
    if (spots[c.id] === 0) {
      toast('This class is full. Try another time or join the waitlist.', { type: 'error', title: 'No spots left' })
      return
    }
    setPending(c.id)
    setTimeout(() => {
      setPending(null)
      setBooked((s) => new Set(s).add(c.id))
      setSpots((s) => ({ ...s, [c.id]: s[c.id] - 1 }))
      toast(`${c.name} · ${c.day} at ${c.time} with ${c.coach.split(' ')[0]}.`, { title: 'You’re booked! 🎉' })
    }, 700)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Class booking"
        title="Sweat together"
        subtitle="Book Yoga, HIIT, Spin and Boxing. Spots update live."
        right={booked.size > 0 && (
          <span className="glass flex items-center gap-2 self-start !rounded-full px-4 py-2 text-sm font-semibold">
            <Check className="h-4 w-4 text-lime" /> {booked.size} booked this week
          </span>
        )}
      />

      <div className="mb-4 grid grid-cols-7 gap-1.5 md:gap-3">
        {weekDays.map((d, i) => {
          const active = d === day
          const count = allClasses.filter((c) => c.day === d).length
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`relative flex flex-col items-center rounded-2xl py-3 transition ${active ? 'text-[#0a0d12]' : 'glass !rounded-2xl text-muted hover:text-ink'}`}
            >
              {active && <motion.span layoutId="day-bg" className="absolute inset-0 rounded-2xl bg-brand shadow-glow" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
              <span className="relative text-[11px] font-semibold uppercase">{d}</span>
              <span className="relative mt-1 font-display text-lg font-bold">{count}</span>
              {i === todayIdx && <span className={`relative mt-0.5 h-1 w-1 rounded-full ${active ? 'bg-[#0a0d12]' : 'bg-lime'}`} />}
            </button>
          )
        })}
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`chip shrink-0 ${type === t ? 'border-lime/50 bg-lime/10 text-lime' : 'text-muted hover:text-ink'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {list.length === 0 ? (
          <EmptyState
            key="empty"
            icon={CalendarX2}
            title="Rest day vibes"
            message={`No ${type === 'All' ? '' : type + ' '}classes on ${day}. Pick another day, or use the time to recover.`}
            action={type !== 'All' && <button className="btn-ghost" onClick={() => setType('All')}>Show all classes</button>}
          />
        ) : (
          <motion.div key={day + type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-2">
            {list.map((c, i) => {
              const meta = classTypes[c.type]
              const Icon = icons[meta.icon]
              const left = spots[c.id]
              const isBooked = booked.has(c.id)
              const full = left === 0 && !isBooked
              const fill = 1 - left / c.capacity
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className={`glass relative overflow-hidden p-5 transition-shadow hover:shadow-card ${isBooked ? '!border-lime/40' : ''}`}
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl" style={{ background: meta.color }} />
                  <div className="relative flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: `${meta.color}22`, color: meta.color }}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="tint text-xs font-bold uppercase tracking-wider" style={{ '--tint': meta.color }}>{c.type}</p>
                      <h3 className="text-lg font-semibold leading-tight">{c.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.time} · {c.duration} min</span>
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{c.coach}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-5 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className={left === 0 ? 'font-semibold text-flame' : left <= 3 ? 'font-semibold text-flame' : 'text-muted'}>
                          {left === 0 ? 'Fully booked' : left <= 3 ? `Only ${left} spot${left > 1 ? 's' : ''} left!` : `${left} spots left`}
                        </span>
                        <span className="text-muted">{c.capacity - left}/{c.capacity}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-line/[0.06]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${fill * 100}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: meta.color }} />
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => book(c)}
                      disabled={pending === c.id}
                      className={`flex h-11 min-w-[6.5rem] items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold transition ${
                        isBooked ? 'border border-lime/40 bg-lime/10 text-lime'
                          : full ? 'border border-line/10 text-muted'
                          : 'bg-brand text-[#0a0d12] shadow-glow hover:brightness-110'
                      }`}
                    >
                      {pending === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isBooked ? <><Check className="h-4 w-4" /> Booked</> : full ? 'Waitlist' : 'Book'}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
