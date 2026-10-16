"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useHQ } from "@/components/providers/hq-store"
import { getDataProvider, type HQDataProvider } from "./index"
import { DataSourceError } from "./provider"

export type QueryState<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: Error }
  | { status: "offline"; data?: undefined; error: Error }

/**
 * Minimal async query hook over the data provider. Kept deliberately small so
 * it can be replaced with TanStack Query or server components when a live
 * provider arrives. `key` must change whenever the query's inputs change.
 */
export type QueryResult<T> = QueryState<T> & { refetch: () => void }

export function useHQQuery<T>(key: string, fetcher: (provider: HQDataProvider) => Promise<T>): QueryResult<T> {
  const [state, setState] = useState<QueryState<T>>({ status: "loading" })
  const [nonce, setNonce] = useState(0)
  const { dataEpoch } = useHQ()
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    setState({ status: "loading" })
    fetcherRef
      .current(getDataProvider())
      .then((data) => {
        if (!cancelled) setState({ status: "success", data })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const error = err instanceof Error ? err : new Error(String(err))
        const offline = err instanceof DataSourceError && err.kind === "offline"
        setState(offline ? { status: "offline", error } : { status: "error", error })
      })
    return () => {
      cancelled = true
    }
  }, [key, nonce, dataEpoch])

  const refetch = useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, refetch } as QueryResult<T>
}
