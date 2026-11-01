import { SignJWT, jwtVerify } from 'jose'
import { HttpError, parseCookies } from './http.js'

const COOKIE = 'pf_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secret() {
  if (!process.env.JWT_SECRET) throw new HttpError(503, 'Login is not configured yet. Add JWT_SECRET to your environment.', 'AUTH_NOT_CONFIGURED')
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

const secure = () => process.env.NODE_ENV === 'production' || !!process.env.VERCEL

export async function setSession(res, userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure() ? '; Secure' : ''}`)
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure() ? '; Secure' : ''}`)
}

export async function getUserId(req) {
  const token = parseCookies(req)[COOKIE]
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] })
    const id = Number(payload.sub)
    return Number.isInteger(id) ? id : null
  } catch {
    return null
  }
}

export async function requireUserId(req) {
  const id = await getUserId(req)
  if (!id) throw new HttpError(401, 'Please log in to continue.', 'UNAUTHENTICATED')
  return id
}

export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  full_name: u.full_name,
  weekly_goal_workouts: u.weekly_goal_workouts,
  weekly_goal_minutes: u.weekly_goal_minutes,
  created_at: u.created_at,
})
