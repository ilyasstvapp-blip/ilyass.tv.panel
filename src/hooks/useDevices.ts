"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchDeviceSessions } from "@/lib/services/devices"
import type { DeviceSession } from "@/types/database"

export function useDeviceSessions(options?: {
  search?: string
  page?: number
  pageSize?: number
}) {
  const [data, setData] = useState<DeviceSession[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchDeviceSessions(options)
      setData(result.data)
      setCount(result.count)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load device sessions")
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(options)])

  useEffect(() => { load() }, [load])

  return { data, count, loading, error, refetch: load }
}
