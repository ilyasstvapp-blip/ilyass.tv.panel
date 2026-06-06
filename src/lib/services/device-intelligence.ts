import type { DeviceIntelligenceData } from "@/types/database"

async function api(path: string) {
  const res = await fetch(path)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export async function fetchDeviceIntelligence(): Promise<DeviceIntelligenceData> {
  return api("/api/device-intelligence")
}
