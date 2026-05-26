"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchEvents, fetchLeagues } from "@/lib/services/events"
import type { LiveEvent } from "@/types/database"

export function useEvents(options?: {
  search?: string
  league?: string
  sortBy?: keyof LiveEvent
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
}) {
  const [data, setData] = useState<LiveEvent[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchEvents(options)
      setData(result.data)
      setCount(result.count)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events")
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(options)])

  useEffect(() => { load() }, [load])

  return { data, count, loading, error, refetch: load }
}

export function useLeagues() {
  const [data, setData] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeagues()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
