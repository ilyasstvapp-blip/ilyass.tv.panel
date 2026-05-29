import type { DeviceWithPresence } from "@/types/database"

async function api(path: string) {
  const res = await fetch(path)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export async function fetchDeviceSessions(options?: {
  search?: string
  status?: string
  deviceType?: string
  banned?: string
  activeToday?: string
  page?: number
  pageSize?: number
}) {
  const params = new URLSearchParams()
  if (options?.search) params.set("search", options.search)
  if (options?.status) params.set("status", options.status)
  if (options?.deviceType) params.set("deviceType", options.deviceType)
  if (options?.banned) params.set("banned", options.banned)
  if (options?.activeToday) params.set("activeToday", options.activeToday)
  if (options?.page) params.set("page", String(options.page))
  if (options?.pageSize) params.set("pageSize", String(options.pageSize))

  const { data, count } = await api(`/api/device-sessions?${params}`)
  return { data: data as DeviceWithPresence[], count: count ?? 0 }
}


