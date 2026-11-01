import { neon } from '@neondatabase/serverless'
import { HttpError } from './http.js'

let sql

const isLocal = (url) => /@(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//.test(url) || /^postgres(ql)?:\/\/(localhost|127\.0\.0\.1)/.test(url)

// Local Postgres (Homebrew) speaks plain TCP, so use node-postgres with the same
// tagged-template API the Neon driver has: sql`SELECT ... ${value}` -> rows.
function localSql(url) {
  let pool
  return async (strings, ...values) => {
    if (!pool) {
      const { default: pg } = await import('pg')
      pool = new pg.Pool({ connectionString: url, max: 5 })
      pool.on('error', (err) => console.error('[db] idle client error:', err.message))
    }
    const text = strings.reduce((acc, part, i) => `${acc}$${i}${part}`)
    const { rows } = await pool.query(text, values)
    return rows
  }
}

// Lazily create the database client. Server-side only: never import from src/.
export function db() {
  if (sql) return sql
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new HttpError(503, 'The database is not configured yet. Add DATABASE_URL to your environment.', 'DB_NOT_CONFIGURED')
  }
  sql = isLocal(url) ? localSql(url) : neon(url)
  return sql
}
