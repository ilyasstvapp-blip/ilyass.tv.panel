import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { DeviceIntelligenceData } from "@/types/database"

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [
      sessionsResult,
      presenceResult,
      statusResult,
      playerResult,
      activityResult,
      newTodayResult,
      newWeekResult,
    ] = await Promise.all([
      supabase.from("device_sessions").select("*"),
      supabase.from("device_presence").select("*"),
      supabase.from("device_presence_status").select("*"),
      supabase.from("player_presence").select("*").order("updated_at", { ascending: false }),
      supabase.from("device_activity_events").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("device_sessions").select("id", { count: "exact" })
        .gte("first_seen", new Date(Date.now() - 86400000).toISOString()),
      supabase.from("device_sessions").select("id", { count: "exact" })
        .gte("first_seen", new Date(Date.now() - 604800000).toISOString()),
    ])

    if (sessionsResult.error) throw sessionsResult.error

    const sessions = sessionsResult.data || []
    const presence = presenceResult.data || []
    const status = statusResult.data || []
    const playerEntries = playerResult.data || []
    const activity = activityResult.data || []

    const deviceIds = sessions.map(s => s.device_id)
    const statusMap = new Map(status.map(s => [s.device_id, s]))
    const presenceMap = new Map(presence.map(p => [p.device_id, p]))

    // Player map: latest state per device
    const playerLatest = new Map<string, typeof playerEntries[0]>()
    for (const p of playerEntries) {
      if (!playerLatest.has(p.device_id)) playerLatest.set(p.device_id, p)
    }

    const onlineNow = status.filter(s => s.realtime_online).length
    const recentlyActive = presence.filter(p => {
      const lastSeen = new Date(p.last_seen_at).getTime()
      return Date.now() - lastSeen < 3600000 && !statusMap.get(p.device_id)?.realtime_online
    }).length

    const watchingStreams = sessions.filter(s => {
      const pl = playerLatest.get(s.device_id)
      return pl && (pl.player_state === "playing" || pl.player_state === "opened")
    }).length

    const inPlayer = Array.from(playerLatest.values()).filter(p => p.player_state === "opened" || p.player_state === "playing" || p.player_state === "buffering").length

    // Geo aggregation
    const countryCount = new Map<string, { count: number; code: string | null }>()
    const cityCount = new Map<string, number>()
    for (const s of sessions) {
      if (s.country) {
        const existing = countryCount.get(s.country) || { count: 0, code: null }
        existing.count++
        if (s.country_code) existing.code = s.country_code
        countryCount.set(s.country, existing)
      }
      if (s.city) cityCount.set(s.city, (cityCount.get(s.city) || 0) + 1)
    }

    // ISP analytics
    const ispMap = new Map<string, { count: number; online: number; offline: number }>()
    for (const s of sessions) {
      const isp = s.isp_name || "Unknown"
      const entry = ispMap.get(isp) || { count: 0, online: 0, offline: 0 }
      entry.count++
      const st = statusMap.get(s.device_id)
      if (st?.realtime_online) entry.online++
      else entry.offline++
      ispMap.set(isp, entry)
    }

    // Connection types
    const connMap = new Map<string, number>()
    for (const s of sessions) {
      const t = s.connection_type || "Unknown"
      connMap.set(t, (connMap.get(t) || 0) + 1)
    }

    // App versions
    const versionMap = new Map<string, number>()
    for (const s of sessions) {
      if (s.app_version) versionMap.set(s.app_version, (versionMap.get(s.app_version) || 0) + 1)
    }

    // Player stats
    const playerOpensToday = playerEntries.filter(p => {
      const d = new Date(p.started_at || p.updated_at).getTime()
      return Date.now() - d < 86400000
    }).length

    // Format activity feed
    const activityFeed = activity.slice(0, 25)

    const data: DeviceIntelligenceData = {
      overview: {
        total_devices: sessions.length,
        online_devices: onlineNow,
        offline_devices: sessions.length - onlineNow,
        new_today: newTodayResult.count || 0,
        new_this_week: newWeekResult.count || 0,
        active_devices: presence.filter(p => Date.now() - new Date(p.last_seen_at).getTime() < 86400000).length,
        watching_streams: watchingStreams,
        in_player: inPlayer,
      },
      presence_summary: {
        online_now: onlineNow,
        recently_active: recentlyActive,
        offline: sessions.length - onlineNow - recentlyActive,
      },
      activity_feed: activityFeed,
      devices_by_country: Array.from(countryCount.entries()).map(([country, data]) => ({
        country, count: data.count, country_code: data.code,
      })).sort((a, b) => b.count - a.count),
      devices_by_city: Array.from(cityCount.entries()).map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count),
      isp_analytics: Array.from(ispMap.entries()).map(([isp, data]) => ({
        isp, count: data.count, online: data.online, offline: data.offline,
      })).sort((a, b) => b.count - a.count),
      connection_types: Array.from(connMap.entries()).map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      app_versions: Array.from(versionMap.entries()).map(([version, count]) => ({ version, count }))
        .sort((a, b) => b.count - a.count),
      player_stats: {
        watching_now: Array.from(playerLatest.values()).filter(p => p.player_state === "playing").length,
        buffering_now: Array.from(playerLatest.values()).filter(p => p.player_state === "buffering").length,
        opens_today: playerOpensToday,
        avg_session_minutes: 0,
      },
      security_summary: {
        total_verified: sessions.filter(s => s.integrity_token).length,
        total_unverified: sessions.filter(s => !s.integrity_token).length,
        flagged_devices: sessions.filter(s => {
          return s.security_fingerprint === "flagged"
        }).length,
      },
    }

    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch device intelligence" },
      { status: 500 }
    )
  }
}
