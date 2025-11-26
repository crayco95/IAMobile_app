import { useCallback, useState } from 'react'
/**
 * Hook genérico para manejar solicitudes async con estados y errores.
 */
export function useRequest<T>() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const run = useCallback(async (fn: () => Promise<T>) => {
    setStatus('loading')
    setError(null)
    setData(null)
    try {
      const result = await fn()
      setData(result)
      setStatus('success')
      return result
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
      setStatus('error')
      throw e
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setData(null)
  }, [])

  return { status, error, data, run, reset }
}
