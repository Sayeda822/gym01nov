import { db } from '../_lib/db.js'
import { route } from '../_lib/http.js'
import { clearSession, getUserId, publicUser } from '../_lib/auth.js'

// Returns { user } when logged in, { user: null } otherwise.
export default route({
  async GET(req, res) {
    const userId = await getUserId(req)
    if (!userId) return { user: null }
    const [user] = await db()`SELECT * FROM users WHERE id = ${userId}`
    if (!user) {
      clearSession(res)
      return { user: null }
    }
    return { user: publicUser(user) }
  },
})
