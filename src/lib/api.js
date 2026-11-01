// Tiny fetch wrapper for our /api functions. The browser never talks to the database.
export class ApiError extends Error {
  constructor(message, status = 0, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'x-timezone': TZ },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError("Can't reach the PulseFit server. Check that it's running and you're online.", 0, 'NETWORK')
  }

  let data = null
  try { data = await res.json() } catch {}

  if (!res.ok) {
    const fallback = res.status >= 500 ? 'Something went wrong on our side. Please try again.' : 'Request failed.'
    throw new ApiError(data?.error || fallback, res.status, data?.code)
  }
  return data
}
