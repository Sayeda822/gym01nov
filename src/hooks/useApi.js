import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

// Loads a GET endpoint. `setData` allows optimistic updates.
export function useApi(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true)
    setError(null)
    try {
      setData(await api(path))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => { reload() }, [reload])

  return { data, error, loading, reload, setData }
}
