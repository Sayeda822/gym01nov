import { route } from '../_lib/http.js'
import { clearSession } from '../_lib/auth.js'

export default route({
  async POST(req, res) {
    clearSession(res)
    return { ok: true }
  },
})
