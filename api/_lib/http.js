export class HttpError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const DB_DOWN = /fetch failed|ENOTFOUND|ECONNREFUSED|AggregateError|ECONNRESET|ETIMEDOUT|getaddrinfo|socket|network|Connection terminated|endpoint .* (?:disabled|not found)|password authentication failed/i

// Wraps a map of { GET, POST, ... } handlers with method checks and friendly errors.
export function route(handlers) {
  return async function handler(req, res) {
    const fn = handlers[req.method]
    if (!fn) {
      res.setHeader('Allow', Object.keys(handlers).join(', '))
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
    try {
      res.setHeader('Cache-Control', 'no-store')
      const result = await fn(req, res)
      if (!res.headersSent) res.status(200).json(result ?? { ok: true })
    } catch (err) {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message, code: err.code })
      }
      // 3D000 = database missing, 42P01 = table missing: setup hasn't been run
      if (err?.code === '3D000' || err?.code === '42P01') {
        console.error('[api] database not set up:', err.message)
        return res.status(503).json({ error: "The database isn't set up yet. Run  npm run db:setup  and try again.", code: 'DB_UNAVAILABLE' })
      }
      const msg = [err?.message, err?.code, err?.sourceError?.message, err?.cause?.message, ...(err?.errors ?? []).map((e) => e?.code)].filter(Boolean).join(' ')
      if (DB_DOWN.test(msg)) {
        console.error('[api] database unreachable:', msg.trim())
        return res.status(503).json({
          error: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? '')
            ? "We can't reach the local database. Start it with  brew services start postgresql@17  and try again."
            : "We can't reach the database right now. Check your internet connection and try again in a moment.",
          code: 'DB_UNAVAILABLE',
        })
      }
      console.error('[api] unexpected error:', err)
      return res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
    }
  }
}

export function body(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body) {
    try { return JSON.parse(req.body) } catch { throw new HttpError(400, 'Invalid JSON body') }
  }
  return {}
}

export function parseCookies(req) {
  const out = {}
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=')
    if (i < 0) continue
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

// The browser sends its IANA time zone so "today" matches the user's clock.
export function timezone(req) {
  const tz = req.headers['x-timezone']
  if (typeof tz === 'string' && tz.length < 64) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz })
      return tz
    } catch {}
  }
  return 'UTC'
}

export function toInt(value, name) {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `Invalid ${name}`)
  return n
}
