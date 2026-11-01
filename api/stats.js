import { db } from './_lib/db.js'
import { route } from './_lib/http.js'

// Public landing-page counters.
export default route({
  async GET() {
    const [row] = await db()`
      SELECT
        (SELECT count(*)::int FROM users) AS members,
        (SELECT count(*)::int FROM workouts WHERE status = 'completed') AS workouts_completed,
        (SELECT count(*)::int FROM classes
           WHERE start_time >= date_trunc('week', now())
             AND start_time <  date_trunc('week', now()) + interval '7 days') AS classes_this_week`
    return row
  },
})
