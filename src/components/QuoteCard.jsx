import { Quote } from 'lucide-react'
import GlassCard from './GlassCard'
import { quoteOfTheDay } from '../data/mock'

export default function QuoteCard({ delay = 0 }) {
  const q = quoteOfTheDay()
  return (
    <GlassCard delay={delay} className="bg-gradient-to-br from-lime/10 via-transparent to-cyan/10">
      <Quote className="absolute -right-2 -top-2 h-24 w-24 text-lime/10" />
      <p className="label mb-3">Quote of the day</p>
      <p className="font-display text-lg font-medium leading-snug">“{q.text}”</p>
      <p className="mt-3 text-sm text-muted">— {q.author}</p>
    </GlassCard>
  )
}
