import { db } from './_lib/db.js'
import { HttpError, body, route, toInt } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'

// Tick / untick a set: { id, completed }
export default route({
  async PATCH(req) {
    const userId = await requireUserId(req)
    const b = body(req)
    const id = toInt(b.id, 'set')
    if (typeof b.completed !== 'boolean') throw new HttpError(400, 'completed must be true or false')
    const sql = db()

    const [set] = await sql`
      UPDATE workout_sets s
      SET completed = ${b.completed}, completed_at = CASE WHEN ${b.completed} THEN now() ELSE NULL END
      FROM workout_exercises we, workouts w
      WHERE s.id = ${id} AND we.id = s.workout_exercise_id AND w.id = we.workout_id
        AND w.user_id = ${userId} AND w.status <> 'completed'
      RETURNING s.id, s.completed, w.id AS workout_id`
    if (!set) throw new HttpError(404, "That set couldn't be saved. The workout may already be finished.")

    // Ticking the first set starts the clock if the workout wasn't started yet.
    if (b.completed) {
      await sql`
        UPDATE workouts SET status = 'in_progress', started_at = COALESCE(started_at, now())
        WHERE id = ${set.workout_id} AND user_id = ${userId} AND status = 'planned'`
    }
    return { set: { id: set.id, completed: set.completed } }
  },
})
