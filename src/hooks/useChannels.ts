"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchChannels, fetchAllChannels, fetchChannelPackages } from "@/lib/services/channels"
import type { Channel } from "@/types/database"

export function useChannels(options?: {
  search?: string
  packageId?: string
  activeOnly?: boolean
  sortBy?: keyof Channel
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
}) {
  const [data, setData] = useState<Channel[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchChannels(options)
      setData(result.data)
      setCount(result.count)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load channels")
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(options)])

  useEffect(() => { load() }, [load])

  return { data, count, loading, error, refetch: load }
}

export function useAllChannels() {
  const [data, setData] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllChannels()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

export function useChannelPackages() {
  const [data, setData] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChannelPackages()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
