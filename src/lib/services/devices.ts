import type { DeviceSession } from "@/types/database"

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
  page?: number
  pageSize?: number
}) {
  const params = new URLSearchParams()
  if (options?.search) params.set("search", options.search)
  if (options?.page) params.set("page", String(options.page))
  if (options?.pageSize) params.set("pageSize", String(options.pageSize))

  const { data, count } = await api(`/api/device-sessions?${params}`)
  return { data: data as DeviceSession[], count: count ?? 0 }
}
