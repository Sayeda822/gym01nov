import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { user } = await api('/auth/me')
      setUser(user)
    } catch (err) {
      setUser(null)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = async (email, password) => {
    const { user } = await api('/auth/login', { method: 'POST', body: { email, password } })
    setUser(user)
    setError(null)
    return user
  }

  const signup = async (fields) => {
    const { user } = await api('/auth/signup', { method: 'POST', body: fields })
    setUser(user)
    setError(null)
    return user
  }

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }) } finally { setUser(null) }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, refresh, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
