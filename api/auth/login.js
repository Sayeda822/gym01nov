import bcrypt from 'bcryptjs'
import { db } from '../_lib/db.js'
import { HttpError, body, route } from '../_lib/http.js'
import { publicUser, setSession } from '../_lib/auth.js'

// Compared against when the email doesn't exist, so timing doesn't reveal accounts.
const DUMMY_HASH = bcrypt.hashSync('pulsefit-no-such-user', 10)

export default route({
  async POST(req, res) {
    const b = body(req)
    const email = String(b.email ?? '').trim().toLowerCase()
    const password = String(b.password ?? '')
    if (!email || !password) throw new HttpError(400, 'Please enter your email and password.')

    const [user] = await db()`SELECT * FROM users WHERE email = ${email}`
    const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH)
    if (!user || !ok) throw new HttpError(401, "That email and password don't match. Please try again.", 'BAD_CREDENTIALS')

    await setSession(res, user.id)
    return { user: publicUser(user) }
  },
})
