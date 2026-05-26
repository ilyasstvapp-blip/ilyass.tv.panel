"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useDashboardAnalytics } from "@/hooks/useAnalytics"
import { useAllChannels } from "@/hooks/useChannels"
import { useEvents } from "@/hooks/useEvents"
import { useDeviceSessions } from "@/hooks/useDevices"

type StatColor = "cyan" | "green" | "orange" | "pink"

const statConfig: Record<string, { label: string; path: string; color: StatColor; icon: string }> = {
  packages: { label: "Packages", path: "/dashboard/packages", color: "cyan", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
  channels: { label: "Channels", path: "/dashboard/channels", color: "green", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  events: { label: "Live Events", path: "/dashboard/events", color: "orange", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
  devices: { label: "Active Devices", path: "/dashboard/devices", color: "pink", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
}

const gradientMap: Record<StatColor, string> = {
  cyan: "var(--gradient-cyan)",
  green: "var(--gradient-green)",
  orange: "var(--gradient-orange)",
  pink: "var(--gradient-pink)",
}

const glowMap: Record<StatColor, string> = {
  cyan: "glow-cyan",
  green: "glow-green",
  orange: "glow-orange",
  pink: "glow-pink",
}

export default function DashboardOverview() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { data: analytics, loading: analyticsLoading } = useDashboardAnalytics()
  const { data: recentChannels } = useAllChannels()
  const { data: recentEvents } = useEvents({ pageSize: 5 })
  const { data: recentDevices } = useDeviceSessions({ pageSize: 3 })

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="stat-card" style={{ background: "var(--surface)", height: 140 }} />)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  const stats = [
    { key: "packages", value: analytics?.total_packages ?? 0 },
    { key: "channels", value: analytics?.total_channels ?? 0 },
    { key: "events", value: analytics?.total_events ?? 0 },
    { key: "devices", value: analytics?.active_devices ?? 0 },
  ]

  const appSystems = [
    { label: "Maintenance", active: analytics?.maintenance_active ?? false },
    { label: "Popup", active: analytics?.popup_active ?? false },
    { label: "Social", active: analytics?.social_popup_active ?? false },
    { label: "Update", active: analytics?.update_active ?? false },
  ]

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8" style={{ background: "var(--bg-primary)" }}>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const cfg = statConfig[s.key]
            return (
              <div key={s.key}
                onClick={() => router.push(cfg.path)}
                className={`stat-card ${glowMap[cfg.color]} animate-fade-in`}
                style={{ background: "var(--surface)", animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${gradientMap[cfg.color]}15` }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{ color: `var(--accent-${cfg.color === "cyan" ? "cyan" : cfg.color === "green" ? "green" : cfg.color === "orange" ? "orange" : "pink"})` }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cfg.icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-3xl font-bold" style={{ color: `var(--accent-${cfg.color === "cyan" ? "cyan" : cfg.color === "green" ? "green" : cfg.color === "orange" ? "orange" : "pink"})` }}>
                  {analyticsLoading ? "—" : s.value.toLocaleString()}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Click to manage
                </p>
              </div>
            )
          })}
        </div>

        {/* System Status */}
        <div className="card p-6" style={{ background: "var(--surface)" }}>
          <h2 className="text-lg font-semibold mb-5" style={{ color: "var(--text-primary)" }}>System Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {appSystems.map((sys) => (
              <div key={sys.label} className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: sys.active ? "rgba(52,211,153,0.06)" : "var(--bg-tertiary)", border: `1px solid ${sys.active ? "rgba(52,211,153,0.15)" : "var(--border)"}` }}>
                <span className={`w-3 h-3 rounded-full ${sys.active ? "bg-green-400 animate-pulse-glow" : "bg-gray-600"}`} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{sys.label}</p>
                  <p className="text-xs" style={{ color: sys.active ? "var(--accent-green)" : "var(--text-muted)" }}>
                    {sys.active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6" style={{ background: "var(--surface)" }}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-1.5 h-5 rounded-full" style={{ background: "var(--gradient-green)" }} />
              Latest Channels
            </h3>
            <div className="space-y-3">
              {(recentChannels ?? []).slice(0, 5).map((ch) => (
                <div key={ch.id} className="flex items-center gap-3">
                  {ch.logo ? <img src={ch.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    : <div className="w-8 h-8 rounded-lg" style={{ background: "var(--bg-tertiary)" }} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{ch.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ch.channel_key}</p>
                  </div>
                  <span className={`badge ${ch.is_active ? "badge-active" : "badge-inactive"}`}>
                    {ch.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
              {(!recentChannels || recentChannels.length === 0) && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No channels yet</p>
              )}
            </div>
          </div>

          <div className="card p-6" style={{ background: "var(--surface)" }}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-1.5 h-5 rounded-full" style={{ background: "var(--gradient-orange)" }} />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {(recentEvents ?? []).slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    {ev.team1_logo && <img src={ev.team1_logo} alt="" className="w-7 h-7 rounded-full border-2" style={{ borderColor: "var(--surface)" }} />}
                    {ev.team2_logo && <img src={ev.team2_logo} alt="" className="w-7 h-7 rounded-full border-2" style={{ borderColor: "var(--surface)" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {ev.team1_name} vs {ev.team2_name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(ev.match_time).toLocaleDateString()} • {ev.league}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentEvents || recentEvents.length === 0) && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No upcoming events</p>
              )}
            </div>
          </div>

          <div className="card p-6" style={{ background: "var(--surface)" }}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-1.5 h-5 rounded-full" style={{ background: "var(--gradient-pink)" }} />
              Recent Devices
            </h3>
            <div className="space-y-3">
              {(recentDevices ?? []).slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ background: "var(--bg-tertiary)", color: "var(--accent)" }}>
                    {d.platform?.charAt(0)?.toUpperCase() || "D"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{d.device_name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {d.platform} • v{d.app_version || "—"}
                    </p>
                  </div>
                  <span className={`badge ${!d.is_banned ? "badge-active" : "badge-banned"}`}>
                    {d.is_banned ? "Banned" : "Active"}
                  </span>
                </div>
              ))}
              {(!recentDevices || recentDevices.length === 0) && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No devices yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="card px-4 py-3 text-xs flex items-center gap-2" style={{ background: "var(--surface)", color: "var(--text-muted)", borderLeft: "3px solid var(--accent)" }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
          All data from real Supabase database
        </div>
      </div>
    </>
  )
}
