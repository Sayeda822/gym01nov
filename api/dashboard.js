import { db } from './_lib/db.js'
import { HttpError, route, timezone } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'
import { getTodayWorkout, todayDate } from './_lib/workouts.js'

const DAY = 86400000
const iso = (ms) => new Date(ms).toISOString().slice(0, 10)
const ms = (d) => Date.parse(`${d}T00:00:00Z`)
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default route({
  async GET(req) {
    const userId = await requireUserId(req)
    const sql = db()
    const today = await todayDate(sql, timezone(req))

    const [[user], days, todayWorkout] = await Promise.all([
      sql`SELECT full_name, weekly_goal_workouts, weekly_goal_minutes FROM users WHERE id = ${userId}`,
      sql`
        SELECT workout_date::text AS date, count(*)::int AS workouts, COALESCE(sum(duration_minutes), 0)::int AS minutes
        FROM workouts
        WHERE user_id = ${userId} AND status = 'completed'
        GROUP BY workout_date
        ORDER BY workout_date`,
      getTodayWorkout(sql, userId, today),
    ])
    if (!user) throw new HttpError(401, 'Please log in to continue.', 'UNAUTHENTICATED')

    const byDate = new Map(days.map((d) => [d.date, d]))
    const todayMs = ms(today)

    // Last 7 days, oldest first
    const activity = Array.from({ length: 7 }, (_, i) => {
      const t = todayMs - (6 - i) * DAY
      const d = byDate.get(iso(t))
      return { date: iso(t), day: DAY_NAMES[new Date(t).getUTCDay()], minutes: d?.minutes ?? 0, workouts: d?.workouts ?? 0, isToday: i === 6 }
    })

    // Streak: consecutive days with a completed workout, ending today (or yesterday if today isn't done yet)
    let cursor = byDate.has(today) ? todayMs : todayMs - DAY
    let current = 0
    while (byDate.has(iso(cursor))) { current++; cursor -= DAY }
    let best = 0, run = 0, prev = null
    for (const d of days) {
      run = prev !== null && ms(d.date) - prev === DAY ? run + 1 : 1
      best = Math.max(best, run)
      prev = ms(d.date)
    }

    // Monday-based week
    const weekStart = todayMs - ((new Date(todayMs).getUTCDay() + 6) % 7) * DAY
    const week = days.filter((d) => ms(d.date) >= weekStart)
    const weekWorkouts = week.reduce((a, d) => a + d.workouts, 0)
    const weekMinutes = week.reduce((a, d) => a + d.minutes, 0)
    const trainedToday = byDate.has(today)
    const goalsHit = [weekWorkouts >= user.weekly_goal_workouts, weekMinutes >= user.weekly_goal_minutes, trainedToday].filter(Boolean).length

    return {
      today,
      user: { full_name: user.full_name },
      todayWorkout,
      activity,
      streak: { current, best },
      rings: {
        workouts: { done: weekWorkouts, goal: user.weekly_goal_workouts },
        minutes: { done: weekMinutes, goal: user.weekly_goal_minutes },
        goals: { done: goalsHit, goal: 3, trainedToday },
      },
    }
  },
})
