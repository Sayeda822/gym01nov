// Loads .env for local scripts. Creates JWT_SECRET if missing and stops with
// instructions if DATABASE_URL is missing. (On Vercel, env vars are injected.)
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ENV_PATH = fileURLToPath(new URL('../.env', import.meta.url))

function readEnvFile() {
  if (!existsSync(ENV_PATH)) return ''
  return readFileSync(ENV_PATH, 'utf8')
}

function valueOf(text, key) {
  const m = text.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*)\\s*$`, 'm'))
  return m ? m[1].replace(/^['"]|['"]$/g, '').trim() : ''
}

export function loadEnv() {
  let text = readEnvFile()

  if (!valueOf(text, 'JWT_SECRET') && !process.env.JWT_SECRET) {
    const secret = randomBytes(48).toString('base64url')
    text = /^\s*JWT_SECRET\s*=.*$/m.test(text)
      ? text.replace(/^\s*JWT_SECRET\s*=.*$/m, `JWT_SECRET=${secret}`)
      : `${text}${text && !text.endsWith('\n') ? '\n' : ''}JWT_SECRET=${secret}\n`
    if (!/^\s*DATABASE_URL\s*=/m.test(text)) text = `DATABASE_URL=\n${text}`
    writeFileSync(ENV_PATH, text)
    console.log('🔐 Generated a strong JWT_SECRET and saved it to .env')
  }

  if (existsSync(ENV_PATH)) process.loadEnvFile(ENV_PATH)

  if (!process.env.DATABASE_URL) {
    console.error(`
  ✋ DATABASE_URL is missing from .env

  Local database (this Mac):
    brew install postgresql@17 && brew services start postgresql@17
    /opt/homebrew/opt/postgresql@17/bin/createdb pulsefit
    then in .env:  DATABASE_URL=postgresql://${process.env.USER || 'YOUR_MAC_USERNAME'}@localhost:5432/pulsefit

  Or get one from Neon (free, needed for Vercel):
    1. Go to https://console.neon.tech and sign in (or sign up, free).
    2. Create a project (any name, e.g. "pulsefit"), pick the region closest to you.
    3. On the project dashboard, click the "Connect" button (top right).
    4. Leave "Connection pooling" ON, make sure the dropdown shows "Connection string",
       then click "Copy snippet" / copy the string that starts with  postgresql://
    5. Open the file  .env  in this folder and paste it after DATABASE_URL= , like:
         DATABASE_URL=postgresql://neondb_owner:xxxx@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require

  Then run:  npm run db:setup   and   npm run dev
`)
    process.exit(1)
  }
}
