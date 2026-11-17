import { useCallback, useEffect, useState } from 'react'
import type { Paginated } from '../types'

interface Result<T> {
  key: string
  data?: Paginated<T>
  error?: string
}

export function usePagedList<T, P>(fetcher: (params: P) => Promise<Paginated<T>>, params: P) {
  const [result, setResult] = useState<Result<T>>({ key: '' })
  const [tick, setTick] = useState(0)
  const paramsKey = JSON.stringify(params)
  const key = `${paramsKey}|${tick}`

  useEffect(() => {
    let cancelled = false
    fetcher(JSON.parse(paramsKey) as P)
      .then((data) => !cancelled && setResult({ key, data }))
      .catch((e) => !cancelled && setResult({ key, error: e instanceof Error ? e.message : 'Gagal memuat data' }))
    return () => {
      cancelled = true
    }
  }, [fetcher, paramsKey, key])

  const reload = useCallback(() => setTick((n) => n + 1), [])
  const loading = result.key !== key
  return { data: result.data, error: loading ? undefined : result.error, loading, reload }
}