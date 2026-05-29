import type { Package } from "@/types/database"

async function api(path: string) {
  const res = await fetch(path)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export async function fetchPackages(options?: {
  search?: string
  activeOnly?: boolean
  sortBy?: keyof Package
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
  includeChannelCounts?: boolean
}) {
  const params = new URLSearchParams()
  if (options?.search) params.set("search", options.search)
  if (options?.activeOnly) params.set("activeOnly", "true")
  if (options?.sortBy) params.set("sortBy", options.sortBy as string)
  if (options?.sortOrder) params.set("sortOrder", options.sortOrder)
  if (options?.page) params.set("page", String(options.page))
  if (options?.pageSize) params.set("pageSize", String(options.pageSize))
  if (options?.includeChannelCounts) params.set("includeChannelCounts", "true")

  const { data, count, channelCounts } = await api(`/api/packages?${params}`)
  return { data: data as Package[], count: count ?? 0, channelCounts: channelCounts as Record<string, number> | undefined }
}
