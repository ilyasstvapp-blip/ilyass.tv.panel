"use client"

import { useState, useEffect } from "react"
import { fetchAppSystems, fetchSystemByType, fetchSystemStatus } from "@/lib/services/app-systems"
import type { AppSystem, AppSystemType } from "@/types/database"

export function useAppSystems() {
  const [data, setData] = useState<AppSystem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetchAppSystems()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load app systems"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return { data, loading, error, refetch: load }
}

export function useSystemByType(type: AppSystemType) {
  const [data, setData] = useState<AppSystem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemByType(type)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [type])

  return { data, loading }
}

export function useAppSystemStatus() {
  const [data, setData] = useState<Record<AppSystemType, boolean> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemStatus()
      .then(setData as any)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
