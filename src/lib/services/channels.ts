import type { Channel } from "@/types/database"

async function api(path: string) {
  const res = await fetch(path)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export async function fetchChannels(options?: {
  search?: string
  packageId?: string
  activeOnly?: boolean
  sortBy?: keyof Channel
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
}) {
  const params = new URLSearchParams()
  if (options?.search) params.set("search", options.search)
  if (options?.packageId) params.set("packageId", options.packageId)
  if (options?.activeOnly) params.set("activeOnly", "true")
  if (options?.sortBy) params.set("sortBy", options.sortBy as string)
  if (options?.sortOrder) params.set("sortOrder", options.sortOrder)
  if (options?.page) params.set("page", String(options.page))
  if (options?.pageSize) params.set("pageSize", String(options.pageSize))

  const { data, count } = await api(`/api/channels?${params}`)
  return { data: data as Channel[], count: count ?? 0 }
}

export async function fetchAllChannels() {
  const { data } = await api("/api/channels?pageSize=500")
  return data as Channel[]
}

export async function fetchChannelPackages() {
  const { data } = await api("/api/packages?pageSize=500")
  return (data as { id: string; name: string; sort_order: number }[]).map((p) => ({ id: p.id, name: p.name }))
}
