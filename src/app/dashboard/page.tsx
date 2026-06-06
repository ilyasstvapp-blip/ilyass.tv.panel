"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useDashboardAnalytics } from "@/hooks/useAnalytics"
import { useAllChannels } from "@/hooks/useChannels"
import { useEvents } from "@/hooks/useEvents"
import { useDeviceSessions } from "@/hooks/useDevices"
import { fadeInUp, staggerContainer, MotionDiv } from "prism-kit"

const statConfig: Record<string, { label: string; path: string; color: string; glow: string; gradient: string; icon: string }> = {
  packages: { label: "Total Packages", path: "/dashboard/packages", color: "var(--accent-cyan)", glow: "glow-cyan", gradient: "var(--gradient-cyan)", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
  channels: { label: "Total Channels", path: "/dashboard/channels", color: "var(--accent-green)", glow: "glow-green", gradient: "var(--gradient-green)", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  events: { label: "Live Events", path: "/dashboard/events", color: "var(--accent-orange)", glow: "glow-orange", gradient: "var(--gradient-orange)", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
  devices: { label: "Total Devices", path: "/dashboard/devices", color: "var(--accent-pink)", glow: "glow-pink", gradient: "var(--gradient-pink)", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
}

function AnimatedCounter({ value, color }: { value: number; color: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const duration = 800
    const steps = 20
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])
  return <span style={{ color }}>{display.toLocaleString()}</span>
}

export default function DashboardOverview() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { data: analytics, loading: analyticsLoading } = useDashboardAnalytics(15000)
  const { data: recentChannels } = useAllChannels()
  const { data: recentEvents } = useEvents({ pageSize: 5 })
  const { data: recentDevices } = useDeviceSessions({ pageSize: 5, pollInterval: 15000 })

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="rounded-2xl" style={{ height: 140, background: "var(--surface)" }} />)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  const mainStats: { key: string; value: number; cfg: typeof statConfig[keyof typeof statConfig] }[] = [
    { key: "packages", value: analytics?.total_packages ?? 0, cfg: statConfig.packages },
    { key: "channels", value: analytics?.total_channels ?? 0, cfg: statConfig.channels },
    { key: "events", value: analytics?.total_events ?? 0, cfg: statConfig.events },
    { key: "devices", value: analytics?.total_devices ?? 0, cfg: statConfig.devices },
  ]

  const presenceCards = [
    { label: "Online Devices", value: analytics?.online_devices ?? 0, color: "var(--accent-green)" },
    { label: "Offline Devices", value: analytics?.offline_devices ?? 0, color: "var(--accent-orange)" },
    { label: "TVs", value: analytics?.total_tvs ?? 0, color: "var(--accent-purple)" },
    { label: "Tablets", value: analytics?.total_tablets ?? 0, color: "var(--accent-cyan)" },
    { label: "Phones", value: analytics?.total_phones ?? 0, color: "var(--accent-pink)" },
  ]

  const appSystems = [
    { label: "Maintenance", active: analytics?.maintenance_active ?? false, color: "var(--accent-orange)", glow: "glow-orange" },
    { label: "Popup", active: analytics?.popup_active ?? false, color: "var(--accent-cyan)", glow: "glow-cyan" },
    { label: "Social", active: analytics?.social_popup_active ?? false, color: "var(--accent-pink)", glow: "glow-pink" },
    { label: "Update", active: analytics?.update_active ?? false, color: "var(--accent-green)", glow: "glow-green" },
  ]

  return (
    <>
      <Navbar />
      <div className="flex-1 content-area space-y-6 xl:space-y-8" style={{ background: "var(--bg-primary)" }}>
        <MotionDiv variants={fadeInUp} initial="hidden" animate="visible">
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Dashboard Overview
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Real-time analytics from your IPTV platform
          </p>
        </MotionDiv>

        <MotionDiv
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {mainStats.map((s) => (
            <MotionDiv
              key={s.key}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
              }}
              onClick={() => router.push(s.cfg.path)}
              className="relative overflow-hidden group cursor-pointer rounded-2xl p-[1px]"
              style={{ background: `linear-gradient(135deg, ${s.cfg.color}30, transparent 60%)` }}
            >
              <div className="rounded-2xl p-5 h-full" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${s.cfg.glow}`} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ background: `${s.cfg.color}18` }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: s.cfg.color }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.cfg.icon} />
                      </svg>
                    </div>
                    <span className="badge badge-premium text-[10px]">
                      {analyticsLoading ? "..." : "Live"}
                    </span>
                  </div>
                  <p className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: s.cfg.color }}>
                    {analyticsLoading ? (
                      <span style={{ color: s.cfg.color }}>&mdash;</span>
                    ) : (
                      <AnimatedCounter value={s.value} color={s.cfg.color} />
                    )}
                  </p>
                  <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
                    {s.cfg.label}
                  </p>
                </div>
              </div>
            </MotionDiv>
          ))}
        </MotionDiv>

        <div>
          <h2 className="text-lg font-semibold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
            Online Users
          </h2>
          <MotionDiv
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4"
          >
            {presenceCards.map((s) => (
              <MotionDiv
                key={s.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="rounded-2xl p-5"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
              >
                <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                <p className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: s.color }}>
                  {analyticsLoading ? "\u2014" : s.value.toLocaleString()}
                </p>
              </MotionDiv>
            ))}
          </MotionDiv>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
            System Status
          </h2>
          <MotionDiv
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
          >
            {appSystems.map((sys) => (
              <MotionDiv
                key={sys.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                }}
                className={`rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 ${sys.active ? sys.glow : ""}`}
                style={{
                  background: sys.active ? `${sys.color}08` : "var(--bg-tertiary)",
                  border: `1px solid ${sys.active ? `${sys.color}25` : "var(--border)"}`,
                }}
              >
                <span className="relative flex w-3 h-3">
                  {sys.active && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: sys.color }} />
                  )}
                  <span className={`relative inline-flex rounded-full w-3 h-3 ${sys.active ? "" : "opacity-30"}`}
                    style={{ background: sys.active ? sys.color : "var(--text-muted)" }} />
                </span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{sys.label}</p>
                  <p className="text-xs" style={{ color: sys.active ? sys.color : "var(--text-muted)" }}>
                    {sys.active ? "Active" : "Inactive"}
                  </p>
                </div>
              </MotionDiv>
            ))}
          </MotionDiv>
        </div>

        <MotionDiv
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6"
        >
          <MotionDiv
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-1 h-5 rounded-full" style={{ background: "var(--gradient-green)" }} />
              Latest Channels
            </h3>
            <div className="space-y-3">
              {(recentChannels ?? []).slice(0, 5).map((ch) => (
                <div key={ch.id} className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/[0.02]">
                  {ch.logo ? (
                    <img src={ch.logo} alt="" className="w-9 h-9 rounded-xl object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>TV</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{ch.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ch.channel_key}</p>
                  </div>
                  <span className={`badge ${ch.is_active ? "badge-active" : "badge-inactive"} text-[10px]`}>
                    {ch.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
              {(!recentChannels || recentChannels.length === 0) && (
                <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>No channels yet</p>
              )}
            </div>
          </MotionDiv>

          <MotionDiv
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-1 h-5 rounded-full" style={{ background: "var(--gradient-orange)" }} />
              Latest Activity
            </h3>
            <div className="space-y-3">
              {(recentDevices ?? []).slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/[0.02]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ background: "var(--bg-tertiary)", color: "var(--accent)" }}>
                    {d.platform?.charAt(0)?.toUpperCase() || "D"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{d.device_name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {d.platform} &bull; v{d.app_version || "\u2014"}
                    </p>
                  </div>
                  <span className={`status-dot ${d.realtime_online ? "status-online" : "status-offline"}`} />
                </div>
              ))}
              {(!recentDevices || recentDevices.length === 0) && (
                <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>No devices yet</p>
              )}
            </div>
          </MotionDiv>

          <MotionDiv
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-1 h-5 rounded-full" style={{ background: "var(--gradient-pink)" }} />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {(recentEvents ?? []).slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/[0.02]">
                  <div className="flex -space-x-1.5">
                    {ev.team1_logo ? <img src={ev.team1_logo} alt="" className="w-8 h-8 rounded-full border-2" style={{ borderColor: "var(--surface)" }} />
                      : <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2" style={{ background: "var(--bg-tertiary)", borderColor: "var(--surface)", color: "var(--text-muted)" }}>T1</div>}
                    {ev.team2_logo ? <img src={ev.team2_logo} alt="" className="w-8 h-8 rounded-full border-2" style={{ borderColor: "var(--surface)" }} />
                      : <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2" style={{ background: "var(--bg-tertiary)", borderColor: "var(--surface)", color: "var(--text-muted)" }}>T2</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {ev.team1_name} vs {ev.team2_name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(ev.match_time).toLocaleDateString()} &bull; {ev.league}
                    </p>
                  </div>
                  <span className="badge badge-active text-[10px]">Upcoming</span>
                </div>
              ))}
              {(!recentEvents || recentEvents.length === 0) && (
                <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>No upcoming events</p>
              )}
            </div>
          </MotionDiv>
        </MotionDiv>

        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs"
          style={{
            background: "rgba(52,211,153,0.06)",
            color: "var(--text-muted)",
            border: "1px solid rgba(52,211,153,0.1)",
            borderLeft: "3px solid var(--accent-green)",
          }}
        >
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-green-400" />
          </span>
          All data from live Supabase database &bull; Auto-refreshes every 15s
        </div>
      </div>
    </>
  )
}
