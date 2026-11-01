import { motion } from 'framer-motion'
import { useId } from 'react'

export default function ProgressRing({ value, max, size = 120, stroke = 10, label, sublabel, from = 'rgb(var(--lime))', to = 'rgb(var(--cyan))', children }) {
  const id = useId()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: from }} />
              <stop offset="100%" style={{ stopColor: to }} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line) / 0.08)" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c * (1 - pct) }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ filter: 'drop-shadow(0 0 6px rgb(var(--lime) / 0.45))' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          {children ?? (
            <div>
              <p className="font-display text-2xl font-bold leading-none">{value}</p>
              <p className="mt-1 text-[11px] text-muted">of {max}</p>
            </div>
          )}
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-sm font-semibold">{label}</p>
          {sublabel && <p className="text-xs text-muted">{sublabel}</p>}
        </div>
      )}
    </div>
  )
}
