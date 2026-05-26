/**
 * Mutations go through Next.js API routes which use service_role.
 * All write endpoints are POST /api/<resource> with the mutation type in the body.
 */

async function apiPost(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `API error: ${res.status}`)
  }
  return res.json()
}

import type { AppSystemType } from "@/types/database"

export async function createPackage(data: { name: string; sort_order: number }) {
  return apiPost("/api/packages", { action: "create", ...data })
}

export async function updatePackage(id: string, data: Partial<{ name: string; sort_order: number; is_active: boolean }>) {
  return apiPost("/api/packages", { action: "update", id, ...data })
}

export async function deletePackage(id: string) {
  return apiPost("/api/packages", { action: "delete", id })
}

export async function createChannel(data: {
  package_id: string; channel_key: string; name: string; logo?: string; servers?: { url: string; name: string }[]
}) {
  return apiPost("/api/channels", { action: "create", ...data })
}

export async function updateChannel(id: string, data: Partial<{
  package_id: string; channel_key: string; name: string; logo: string; servers: { url: string; name: string }[]; is_active: boolean
}>) {
  return apiPost("/api/channels", { action: "update", id, ...data })
}

export async function deleteChannel(id: string) {
  return apiPost("/api/channels", { action: "delete", id })
}

export async function createEvent(data: {
  team1_name: string; team2_name: string; match_time: string; league: string; commentator: string;
  channel_key: string; channel_name: string; team1_logo?: string | null; team2_logo?: string | null
}) {
  return apiPost("/api/live-events", { action: "create", ...data })
}

export async function updateEvent(id: string, data: Partial<{
  team1_name: string; team2_name: string; match_time: string; league: string; commentator: string;
  channel_key: string; channel_name: string; team1_logo: string | null; team2_logo: string | null
}>) {
  return apiPost("/api/live-events", { action: "update", id, ...data })
}

export async function deleteEvent(id: string) {
  return apiPost("/api/live-events", { action: "delete", id })
}

export async function updateAppSystem(type: AppSystemType, data: Partial<{
  enabled: boolean; title: string; message: string; button_text: string; button_action: string;
  update_url: string | null; force_update: boolean; end_time: string | null; closable: boolean
}>) {
  return apiPost("/api/app-systems", { action: "update", type, ...data })
}
