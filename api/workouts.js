import { db } from './_lib/db.js'
import { HttpError, body, route, timezone, toInt } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'
import { getTodayWorkout, todayDate, workoutName } from './_lib/workouts.js'

export default route({
  // Today's workout with exercises and sets
  async GET(req) {
    const userId = await requireUserId(req)
    const sql = db()
    const today = await todayDate(sql, timezone(req))
    return { workout: await getTodayWorkout(sql, userId, today) }
  },

  // Add an exercise to today's workout (creates the workout if needed)
  async POST(req, res) {
    const userId = await requireUserId(req)
    const exerciseId = toInt(body(req).exercise_id, 'exercise')
    const sql = db()
    const today = await todayDate(sql, timezone(req))

    const [exercise] = await sql`SELECT id, name FROM exercises WHERE id = ${exerciseId}`
    if (!exercise) throw new HttpError(404, "We couldn't find that exercise.")

    await sql`
      INSERT INTO workouts (user_id, name, workout_date)
      VALUES (${userId}, ${"Today's Workout"}, ${today})
      ON CONFLICT (user_id, workout_date) WHERE status <> 'completed' DO NOTHING`
    const [workout] = await sql`
      SELECT id FROM workouts WHERE user_id = ${userId} AND workout_date = ${today} AND status <> 'completed'`

    const added = await sql`
      WITH we AS (
        INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
        VALUES (${workout.id}, ${exerciseId},
                (SELECT COALESCE(max(order_index) + 1, 0) FROM workout_exercises WHERE workout_id = ${workout.id}))
        ON CONFLICT (workout_id, exercise_id) DO NOTHING
        RETURNING id, exercise_id
      )
      INSERT INTO workout_sets (workout_exercise_id, set_number)
      SELECT we.id, gs FROM we JOIN exercises e ON e.id = we.exercise_id, generate_series(1, e.sets) gs
      RETURNING workout_exercise_id`
    if (added.length === 0) throw new HttpError(409, `${exercise.name} is already in today's workout.`, 'ALREADY_ADDED')

    await renameWorkout(sql, workout.id)
    res.status(201).json({ workout: await getTodayWorkout(sql, userId, today) })
  },

  // { id, action: 'start' | 'finish' }
  async PATCH(req) {
    const userId = await requireUserId(req)
    const b = body(req)
    const id = toInt(b.id, 'workout')
    const sql = db()
    const today = await todayDate(sql, timezone(req))

    if (b.action === 'start') {
      await sql`
        UPDATE workouts SET status = 'in_progress', started_at = COALESCE(started_at, now())
        WHERE id = ${id} AND user_id = ${userId} AND status = 'planned'`
    } else if (b.action === 'finish') {
      const [done] = await sql`
        UPDATE workouts
        SET status = 'completed',
            completed_at = now(),
            started_at = COALESCE(started_at, now()),
            duration_minutes = GREATEST(1, round(extract(epoch FROM now() - COALESCE(started_at, now())) / 60))::int
        WHERE id = ${id} AND user_id = ${userId} AND status <> 'completed'
        RETURNING id`
      if (!done) {
        const [exists] = await sql`SELECT status FROM workouts WHERE id = ${id} AND user_id = ${userId}`
        if (!exists) throw new HttpError(404, "We couldn't find that workout.")
      }
    } else {
      throw new HttpError(400, 'Unknown action')
    }

    const [w] = await sql`
      SELECT id, name, workout_date::text AS workout_date, status, duration_minutes, started_at, completed_at
      FROM workouts WHERE id = ${id} AND user_id = ${userId}`
    if (!w) throw new HttpError(404, "We couldn't find that workout.")
    return { workout: { ...w, isToday: w.workout_date === today } }
  },

  // Remove an exercise from an unfinished workout: ?workout_exercise_id=
  async DELETE(req) {
    const userId = await requireUserId(req)
    const weId = toInt(req.query?.workout_exercise_id, 'exercise')
    const sql = db()
    const [removed] = await sql`
      DELETE FROM workout_exercises we
      USING workouts w
      WHERE we.id = ${weId} AND w.id = we.workout_id AND w.user_id = ${userId} AND w.status <> 'completed'
      RETURNING we.workout_id`
    if (!removed) throw new HttpError(404, "That exercise isn't in an active workout.")
    const [{ count }] = await sql`SELECT count(*)::int AS count FROM workout_exercises WHERE workout_id = ${removed.workout_id}`
    if (count === 0) await sql`DELETE FROM workouts WHERE id = ${removed.workout_id} AND user_id = ${userId}`
    else await renameWorkout(sql, removed.workout_id)
    return { ok: true }
  },
})

async function renameWorkout(sql, workoutId) {
  const groups = await sql`
    SELECT e.muscle_group FROM workout_exercises we JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ${workoutId} ORDER BY we.order_index`
  await sql`UPDATE workouts SET name = ${workoutName(groups.map((g) => g.muscle_group))} WHERE id = ${workoutId}`
}
