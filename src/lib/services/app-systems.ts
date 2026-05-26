import type { AppSystem, AppSystemType } from "@/types/database"

async function api(path: string) {
  const res = await fetch(path)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export async function fetchAppSystems() {
  const { data } = await api("/api/app-systems")
  return data as AppSystem[]
}

export async function fetchSystemByType(type: AppSystemType) {
  const { data } = await api(`/api/app-systems?type=${type}`)
  return (data as AppSystem[])[0] ?? null
}

export async function fetchSystemStatus() {
  const systems = await fetchAppSystems()
  const status: Record<string, boolean> = {}
  for (const sys of systems) {
    status[sys.type] = sys.enabled
  }
  return status as Record<AppSystemType, boolean>
}
