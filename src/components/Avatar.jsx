export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'
}

export default function Avatar({ name, className = 'h-10 w-10 text-sm rounded-xl' }) {
  return (
    <span className={`grid shrink-0 place-items-center bg-brand font-display font-bold text-[#0a0d12] ${className}`} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
