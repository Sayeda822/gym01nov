import { motion } from 'framer-motion'

export default function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {eyebrow && <p className="label mb-2 !text-lime">{eyebrow}</p>}
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      </motion.div>
      {right}
    </div>
  )
}
