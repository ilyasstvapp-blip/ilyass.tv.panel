"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchPackages } from "@/lib/services/packages"
import type { Package } from "@/types/database"

export function usePackages(options?: {
  search?: string
  activeOnly?: boolean
  sortBy?: keyof Package
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
}) {
  const [data, setData] = useState<Package[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchPackages(options)
      setData(result.data)
      setCount(result.count)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load packages")
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(options)])

  useEffect(() => { load() }, [load])

  return { data, count, loading, error, refetch: load }
}
