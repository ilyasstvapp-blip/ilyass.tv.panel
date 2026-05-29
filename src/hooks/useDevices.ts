"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { fetchDeviceSessions } from "@/lib/services/devices"
import type { DeviceWithPresence } from "@/types/database"

export function useDeviceSessions(options?: {
  search?: string
  status?: string
  deviceType?: string
  banned?: string
  activeToday?: string
  page?: number
  pageSize?: number
  pollInterval?: number
}) {
  const [data, setData] = useState<DeviceWithPresence[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const load = useCallback(async (isPoll = false) => {
    if (!isPoll) setLoading(true)
    setError(null)
    try {
      const result = await fetchDeviceSessions(options)
      setData(result.data)
      setCount(result.count)
    } catch (e) {
      if (!isPoll) setError(e instanceof Error ? e.message : "Failed to load device sessions")
    } finally {
      if (!isPoll) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options)])

  useEffect(() => {
    load()
    if (options?.pollInterval && options.pollInterval > 0) {
      intervalRef.current = setInterval(() => load(true), options.pollInterval)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [load, options?.pollInterval])

  return { data, count, loading, error, refetch: () => load() }
}
