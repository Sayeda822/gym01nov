import { Link } from 'react-router-dom'

export default function Logo({ size = 'md', to = '/' }) {
  const text = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
  const icon = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'
  return (
    <Link to={to} className="group inline-flex min-h-10 items-center gap-2.5" aria-label="PulseFit home">
      <span className={`${icon} grid place-items-center rounded-xl bg-brand shadow-glow transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110`}>
        <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="none" stroke="#0a0d12" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 13h4l2-5 3 10 2.5-7 1.5 2h7" />
        </svg>
      </span>
      <span className={`${text} font-display font-bold italic tracking-tight`}>
        <span className="text-gradient">Pulse</span><span className="text-ink">Fit</span>
      </span>
    </Link>
  )
}
