"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { fetchDashboardAnalytics } from "@/lib/services/analytics"
import type { DashboardAnalytics } from "@/types/database"

export function useDashboardAnalytics(pollInterval = 15000) {
  const [data, setData] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const load = useCallback(async (isPoll = false) => {
    if (!isPoll) setLoading(true)
    try {
      const result = await fetchDashboardAnalytics()
      setData(result)
      setError(null)
    } catch (e) {
      if (!isPoll) setError(e instanceof Error ? e.message : "Failed to load analytics")
    } finally {
      if (!isPoll) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    if (pollInterval > 0) {
      intervalRef.current = setInterval(() => load(true), pollInterval)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [load, pollInterval])

  return { data, loading, error }
}
