import type { LiveEvent } from "@/types/database"

async function api(path: string) {
  const res = await fetch(path)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export async function fetchEvents(options?: {
  search?: string
  league?: string
  sortBy?: keyof LiveEvent
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
}) {
  const params = new URLSearchParams()
  if (options?.search) params.set("search", options.search)
  if (options?.league) params.set("league", options.league)
  if (options?.sortBy) params.set("sortBy", options.sortBy as string)
  if (options?.sortOrder) params.set("sortOrder", options.sortOrder)
  if (options?.page) params.set("page", String(options.page))
  if (options?.pageSize) params.set("pageSize", String(options.pageSize))

  const { data, count } = await api(`/api/live-events?${params}`)
  return { data: data as LiveEvent[], count: count ?? 0 }
}

export async function fetchLeagues() {
  const { data } = await api("/api/live-events?pageSize=500")
  const leagues = [...new Set((data as LiveEvent[]).map((r) => r.league).filter(Boolean))] as string[]
  return leagues.sort()
}
