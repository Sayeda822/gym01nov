// npm run db:setup -> runs db/schema.sql then db/seed.sql. Safe to re-run.
import { readFileSync } from 'node:fs'
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless'
import pg from 'pg'
import { loadEnv } from '../server/env.js'

loadEnv()
neonConfig.webSocketConstructor = globalThis.WebSocket
const url = process.env.DATABASE_URL
const local = /@(localhost|127\.0\.0\.1)(:\d+)?\/|^postgres(ql)?:\/\/(localhost|127\.0\.0\.1)/.test(url)
const Pool = local ? pg.Pool : NeonPool
console.log(`🗄  Target: ${local ? 'local PostgreSQL' : 'Neon'} (${url.replace(/\/\/[^@]*@/, '//***@')})`)

const read = (f) => readFileSync(new URL(`../db/${f}`, import.meta.url), 'utf8')
const pool = new Pool({ connectionString: url })
pool.on('error', () => {}) // reported below via the failed query instead

try {
  console.log('▶ Running db/schema.sql …')
  await pool.query(read('schema.sql'))
  console.log('▶ Running db/seed.sql …')
  await pool.query(read('seed.sql'))

  const { rows } = await pool.query(`
    SELECT 'exercises' AS table_name, count(*)::int AS rows FROM exercises
    UNION ALL SELECT 'classes', count(*)::int FROM classes
    UNION ALL SELECT 'users', count(*)::int FROM users
    UNION ALL SELECT 'workouts', count(*)::int FROM workouts`)
  console.log('\n✅ Database ready. Row counts:')
  console.table(rows)
} catch (err) {
  const msg = err?.message || 'Could not connect to the database host.'
  console.error('\n❌ Database setup failed:', msg)
  if (/password|authentication/i.test(msg)) console.error('   Check the DATABASE_URL in .env (copy it again from Neon → Connect).')
  if (local && /ECONNREFUSED|connect/i.test(msg)) console.error('   Local Postgres is not running. Start it with:  brew services start postgresql@17')
  else if (/database .* does not exist/i.test(msg)) console.error('   Create it with:  /opt/homebrew/opt/postgresql@17/bin/createdb pulsefit')
  else if (/ENOTFOUND|getaddrinfo|fetch failed|connect/i.test(msg)) console.error('   Could not reach Neon. Check your internet connection and the host in DATABASE_URL.')
  process.exitCode = 1
} finally {
  await pool.end()
}
