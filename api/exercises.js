import { db } from './_lib/db.js'
import { HttpError, route, timezone } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'
import { todayDate } from './_lib/workouts.js'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export default route({
  async GET(req) {
    const userId = await requireUserId(req)
    const group = req.query?.group
    if (group && group !== 'All' && !GROUPS.includes(group)) throw new HttpError(400, 'Unknown muscle group')
    const sql = db()
    const today = await todayDate(sql, timezone(req))

    const [exercises, inToday] = await Promise.all([
      group && group !== 'All'
        ? sql`SELECT * FROM exercises WHERE muscle_group = ${group} ORDER BY name`
        : sql`SELECT * FROM exercises ORDER BY array_position(${GROUPS}::text[], muscle_group), name`,
      sql`
        SELECT we.exercise_id
        FROM workout_exercises we JOIN workouts w ON w.id = we.workout_id
        WHERE w.user_id = ${userId} AND w.workout_date = ${today} AND w.status <> 'completed'`,
    ])
    return { exercises, todayExerciseIds: inToday.map((r) => r.exercise_id) }
  },
})
