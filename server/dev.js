// Local dev: one command runs the /api functions (Express) and the Vite frontend.
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { loadEnv } from './env.js'

loadEnv()

const ROOT = fileURLToPath(new URL('..', import.meta.url))
process.chdir(ROOT) // Tailwind/PostCSS resolve their config from the working directory

// API in a child process that restarts whenever a file in api/ changes.
const api = spawn(process.execPath, ['--watch-path=api', '--watch-preserve-output', 'server/api.js'], {
  cwd: ROOT,
  env: process.env,
  stdio: 'inherit',
})
const stop = () => { api.kill(); process.exit() }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
api.on('exit', (code) => { if (code) { console.error('API server stopped unexpectedly.'); process.exit(code) } })

const vite = await createServer({ root: ROOT })
await vite.listen()
vite.printUrls()
