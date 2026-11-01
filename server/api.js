// Local Express server for the /api functions. Started by server/dev.js with
// `node --watch-path=api`, so any change under api/ restarts it automatically.
// It loads the exact same route files Vercel deploys.
import express from 'express'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const API_DIR = fileURLToPath(new URL('../api', import.meta.url))
const API_PORT = Number(process.env.API_PORT || 3001)

// /api/auth/login -> api/auth/login.js (or api/auth/login/index.js)
function resolveRoute(urlPath) {
  const parts = urlPath.split('/').filter(Boolean)
  if (parts.some((p) => p.startsWith('_') || p.startsWith('.'))) return null
  const base = path.join(API_DIR, ...parts)
  for (const file of [`${base}.js`, path.join(base, 'index.js')]) {
    if (file.startsWith(API_DIR) && existsSync(file)) return file
  }
  return null
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

app.use('/api', async (req, res) => {
  const file = resolveRoute(req.path)
  if (!file) return res.status(404).json({ error: 'Not found' })
  try {
    const mod = await import(pathToFileURL(file).href)
    await mod.default(req, res)
  } catch (err) {
    console.error(`[api] ${req.method} ${req.originalUrl}`, err)
    if (!res.headersSent) res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
  }
})

// Malformed JSON bodies -> friendly JSON error (Vercel does the same)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' })
  next(err)
})

app.listen(API_PORT, () => console.log(`  ⚡ API      http://localhost:${API_PORT}/api`))
