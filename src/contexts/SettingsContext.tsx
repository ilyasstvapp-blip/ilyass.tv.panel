"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  fetchSettings,
  fetchFootballApis,
  saveSetting as apiSaveSetting,
  type FootballApi,
} from "@/lib/services/settings"

interface SettingsContextValue {
  settings: Record<string, unknown>
  footballApis: FootballApi[]
  activeApi: FootballApi | null
  timezone: string
  apiSportsKey: string
  enabledLeagues: string[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  saveSetting: (key: string, value: unknown) => Promise<boolean>
  refreshApis: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: {},
  footballApis: [],
  activeApi: null,
  timezone: "browser",
  apiSportsKey: "",
  enabledLeagues: [],
  loading: true,
  error: null,
  refresh: async () => {},
  saveSetting: async () => false,
  refreshApis: async () => {},
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  const [footballApis, setFootballApis] = useState<FootballApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshApis = useCallback(async () => {
    try {
      const apis = await fetchFootballApis()
      setFootballApis(apis)
    } catch {}
  }, [])

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const [settingsData] = await Promise.all([fetchSettings(), refreshApis()])
      setSettings(settingsData)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }, [refreshApis])

  const saveSetting = useCallback(async (key: string, value: unknown) => {
    try {
      await apiSaveSetting(key, value)
      setSettings((prev) => ({ ...prev, [key]: value }))
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const timezone = (settings.timezone as string) || "browser"
  const apiSportsKey = (settings.api_sports_key as string) || ""
  const enabledLeagues = (settings.enabled_leagues as string[]) || []
  const activeApi = footballApis.find((a) => a.active) || null

  return (
    <SettingsContext.Provider
      value={{
        settings,
        footballApis,
        activeApi,
        timezone,
        apiSportsKey,
        enabledLeagues,
        loading,
        error,
        refresh,
        saveSetting,
        refreshApis,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
