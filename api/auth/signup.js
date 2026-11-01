import bcrypt from 'bcryptjs'
import { db } from '../_lib/db.js'
import { HttpError, body, route } from '../_lib/http.js'
import { publicUser, setSession } from '../_lib/auth.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default route({
  async POST(req, res) {
    const b = body(req)
    const full_name = String(b.full_name ?? '').trim()
    const email = String(b.email ?? '').trim().toLowerCase()
    const password = String(b.password ?? '')
    const goalWorkouts = Number(b.weekly_goal_workouts ?? 4)
    const goalMinutes = Number(b.weekly_goal_minutes ?? 150)

    if (full_name.length < 2 || full_name.length > 80) throw new HttpError(400, 'Please enter your name.')
    if (!EMAIL.test(email) || email.length > 254) throw new HttpError(400, 'Please enter a valid email address.')
    if (password.length < 8 || password.length > 72) throw new HttpError(400, 'Password must be 8 to 72 characters.')
    if (!Number.isInteger(goalWorkouts) || goalWorkouts < 1 || goalWorkouts > 14) throw new HttpError(400, 'Weekly workouts goal must be between 1 and 14.')
    if (!Number.isInteger(goalMinutes) || goalMinutes < 10 || goalMinutes > 3000) throw new HttpError(400, 'Weekly minutes goal must be between 10 and 3000.')

    const password_hash = await bcrypt.hash(password, 10)
    const [user] = await db()`
      INSERT INTO users (email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes)
      VALUES (${email}, ${password_hash}, ${full_name}, ${goalWorkouts}, ${goalMinutes})
      ON CONFLICT (email) DO NOTHING
      RETURNING *`
    if (!user) throw new HttpError(409, 'An account with this email already exists. Try logging in instead.', 'EMAIL_TAKEN')

    await setSession(res, user.id)
    res.status(201).json({ user: publicUser(user) })
  },
})
