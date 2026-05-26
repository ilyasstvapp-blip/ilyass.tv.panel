"use client"

import { useState, useEffect } from "react"
import { fetchDashboardAnalytics } from "@/lib/services/analytics"
import type { DashboardAnalytics } from "@/types/database"

export function useDashboardAnalytics() {
  const [data, setData] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardAnalytics()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load analytics"))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
