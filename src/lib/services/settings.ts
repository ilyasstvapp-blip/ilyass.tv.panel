export interface FootballApi {
  id: string
  api_name: string
  api_url: string
  api_type: string
  active: boolean
  created_at: string
  updated_at: string
}

export async function fetchSettings(): Promise<Record<string, unknown>> {
  const res = await fetch("/api/settings")
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || "Failed to fetch settings")
  }
  return res.json()
}

export async function fetchSetting(key: string) {
  const res = await fetch(`/api/settings?key=${encodeURIComponent(key)}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Failed to fetch setting: ${key}`)
  }
  const data = await res.json()
  return data.value
}

export async function saveSetting(key: string, value: unknown) {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(err.error || "Failed to save setting")
  }
  return true
}

export async function fetchFootballApis(): Promise<FootballApi[]> {
  const res = await fetch("/api/football-apis")
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || "Failed to fetch APIs")
  }
  const data = await res.json()
  return data.data || []
}

export async function saveFootballApi(
  action: string,
  payload: Record<string, unknown>,
) {
  const res = await fetch("/api/football-apis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Operation failed" }))
    throw new Error(err.error || "Operation failed")
  }
  return res.json()
}
