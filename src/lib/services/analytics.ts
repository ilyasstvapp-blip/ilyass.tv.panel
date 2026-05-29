import type { DashboardAnalytics } from "@/types/database"

async function api(path: string) {
  const res = await fetch(path)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export async function fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
  const [{ data: packages }, { data: channels }, { data: events }, { data: devices }, { data: appSystems }] =
    await Promise.all([
      api("/api/packages?pageSize=500"),
      api("/api/channels?pageSize=500"),
      api("/api/live-events?pageSize=500"),
      api("/api/device-sessions?pageSize=500"),
      api("/api/app-systems"),
    ])

  const totalPackages = packages.length
  const activePackages = packages.filter((p: any) => p.is_active).length
  const totalChannels = channels.length
  const activeChannels = channels.filter((c: any) => c.is_active).length
  const totalEvents = events.length
  const channelKeys = new Set(events.map((e: any) => e.channel_key)).size
  const totalDevices = devices.length
  const activeDevices = devices.filter((d: any) => !d.is_banned).length
  const onlineDevices = devices.filter((d: any) => d.realtime_online).length
  const offlineDevices = totalDevices - onlineDevices
  const totalTvs = devices.filter((d: any) => d.is_tv).length
  const totalTablets = devices.filter((d: any) => d.is_tablet).length
  const totalPhones = devices.filter((d: any) => !d.is_tv && !d.is_tablet).length

  const appSysArr = appSystems ?? []
  const maintenanceActive = appSysArr.find((s: any) => s.type === "maintenance")?.enabled ?? false
  const popupActive = appSysArr.find((s: any) => s.type === "popup")?.enabled ?? false
  const socialPopupActive = appSysArr.find((s: any) => s.type === "social_popup")?.enabled ?? false
  const updateActive = appSysArr.find((s: any) => s.type === "update")?.enabled ?? false

  const latestSessions = devices.slice(0, 5)

  return {
    total_packages: totalPackages,
    active_packages: activePackages,
    total_channels: totalChannels,
    active_channels: activeChannels,
    total_events: totalEvents,
    channel_keys: channelKeys,
    total_devices: totalDevices,
    active_devices: activeDevices,
    online_devices: onlineDevices,
    offline_devices: offlineDevices,
    total_tvs: totalTvs,
    total_tablets: totalTablets,
    total_phones: totalPhones,
    maintenance_active: maintenanceActive,
    popup_active: popupActive,
    social_popup_active: socialPopupActive,
    update_active: updateActive,
    latest_sessions: latestSessions,
  }
}
