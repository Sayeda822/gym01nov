// Shared queries for today's workout. Every query is scoped to the user id.

export async function todayDate(sql, tz) {
  const [{ today }] = await sql`SELECT (now() AT TIME ZONE ${tz})::date::text AS today`
  return today
}

// Today's open workout if there is one, otherwise the latest one finished today.
export async function getTodayWorkout(sql, userId, today) {
  const [workout] = await sql`
    SELECT id, name, workout_date::text AS workout_date, status, duration_minutes, started_at, completed_at
    FROM workouts
    WHERE user_id = ${userId} AND workout_date = ${today}
    ORDER BY (status <> 'completed') DESC, completed_at DESC NULLS LAST, id DESC
    LIMIT 1`
  if (!workout) return null
  return { ...workout, exercises: await getWorkoutExercises(sql, workout.id) }
}

export async function getWorkoutExercises(sql, workoutId) {
  const rows = await sql`
    SELECT we.id, we.exercise_id, we.order_index, e.name, e.muscle_group, e.reps, e.rest_seconds, e.difficulty,
           COALESCE(json_agg(json_build_object('id', s.id, 'set_number', s.set_number, 'completed', s.completed)
                    ORDER BY s.set_number) FILTER (WHERE s.id IS NOT NULL), '[]') AS sets
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    LEFT JOIN workout_sets s ON s.workout_exercise_id = we.id
    WHERE we.workout_id = ${workoutId}
    GROUP BY we.id, e.id
    ORDER BY we.order_index, we.id`
  return rows
}

// "Chest Day", "Chest & Arms", "Full Body" based on what's in the workout.
export function workoutName(groups) {
  const unique = [...new Set(groups)]
  if (unique.length === 0) return "Today's Workout"
  if (unique.length === 1) return unique[0] === 'Cardio' ? 'Cardio Burn' : `${unique[0]} Day`
  if (unique.length === 2) return `${unique[0]} & ${unique[1]}`
  return 'Full Body Session'
}
