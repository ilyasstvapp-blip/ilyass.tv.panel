"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useDeviceSessions } from "@/hooks/useDevices"
import { useDeviceIntelligence } from "@/hooks/useDeviceIntelligence"
import { useBanDevice, useUnbanDevice } from "@/hooks/useMutations"
import DeviceDetailsDrawer from "@/components/dashboard/DeviceDetailsDrawer"
import type { DeviceWithPresence } from "@/types/database"
import { fadeInUp, MotionDiv } from "prism-kit"
import { motion } from "framer-motion"

const timeAgo = (dateStr: string | null | undefined) => {
  if (!dateStr) return "\u2014"
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000) return "Just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function DevicesPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [bannedFilter, setBannedFilter] = useState("")
  const [page, setPage] = useState(1)
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithPresence | null>(null)
  const { data: intelligence } = useDeviceIntelligence(15000)
  const { data: devices, totalCount, displayedCount, loading, error, refetch } = useDeviceSessions({
    search: search || undefined,
    status: statusFilter || undefined,
    banned: bannedFilter || undefined,
    page, pageSize: 24, pollInterval: 15000,
  })
  const banMut = useBanDevice()
  const unbanMut = useUnbanDevice()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setPage(1) }, [search, statusFilter, bannedFilter])

  const totalPages = Math.ceil(totalCount / 24)
  const hasActiveFilters = search || statusFilter || bannedFilter

  const clearFilters = () => { setSearch(""); setStatusFilter(""); setBannedFilter(""); setPage(1) }

  const handleBan = async (d: DeviceWithPresence) => {
    try {
      if (d.is_banned) await unbanMut.mutate(d.id); else await banMut.mutate(d.id)
      refetch()
    } catch {}
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 content-area animate-pulse space-y-5" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="rounded-2xl" style={{ height: 100, background: "var(--surface)" }} />)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  return (
    <>
      <Navbar />
      <div className="flex-1 content-area space-y-5" style={{ background: "var(--bg-primary)" }}>
        <MotionDiv variants={fadeInUp} initial="hidden" animate="visible">
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Device Sessions
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Quick overview &mdash; visit <strong>Device Intelligence</strong> for advanced analytics
            </p>
          </div>
        </MotionDiv>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Total Devices", value: totalCount, color: "var(--accent-cyan)" },
            { label: "Displayed", value: displayedCount, color: "var(--accent)" },
            { label: "Online", value: intelligence?.overview.online_devices ?? 0, color: "var(--accent-green)" },
            { label: "Active Today", value: intelligence?.overview.active_devices ?? 0, color: "var(--accent-purple)" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="stat-card-3d">
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              <p className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: s.color }}>
                {loading ? "\u2014" : s.value.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filter indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs"
            style={{ background: "var(--accent-subtle)", border: "1px solid var(--border-accent)" }}>
            <span style={{ color: "var(--text-secondary)" }}>
              Showing <strong style={{ color: "var(--accent)" }}>{displayedCount}</strong> of{" "}
              <strong style={{ color: "var(--text-primary)" }}>{totalCount}</strong> Devices
              {search && <> &mdash; searching &ldquo;{search}&rdquo;</>}
              {statusFilter && <> &mdash; {statusFilter === "online" ? "Online" : "Offline"}</>}
              {bannedFilter && <> &mdash; {bannedFilter === "true" ? "Banned" : "Not Banned"}</>}
            </span>
            <button onClick={clearFilters}
              className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
              style={{ color: "var(--accent)", background: "var(--accent)10", border: "1px solid var(--accent)20" }}>
              Clear Filters
            </button>
          </div>
        )}

        {/* Search bar */}
        <div className="relative max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search name, ID, brand..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.15)" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="rounded-xl" style={{ height: 88, background: "var(--surface)" }} />)}
          </div>
        ) : devices.length === 0 ? (
          <div className="card-3d-static p-14 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
              <svg className="w-7 h-7" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No devices found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {devices.map((d, idx) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                  className="device-card-compact">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background: d.realtime_online ? "rgba(52,211,153,0.12)" : "var(--bg-tertiary)",
                        color: d.realtime_online ? "var(--accent-green)" : "var(--text-muted)",
                      }}>
                      {d.platform?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {d.device_name || "Unknown Device"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`status-badge ${d.is_banned ? "status-badge-banned" : d.realtime_online ? "status-badge-online" : "status-badge-offline"}`}>
                          <span className={`status-dot ${d.is_banned ? "status-banned" : d.realtime_online ? "status-online" : "status-offline"}`} />
                          {d.is_banned ? "Banned" : d.realtime_online ? "Online" : "Offline"}
                        </span>
                        {d.country && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                            {d.country}{d.city ? `, ${d.city}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5 pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {d.is_tv ? "TV" : d.is_tablet ? "Tablet" : "Phone"}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>&middot;</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>v{d.app_version || "\u2014"}</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>&middot;</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{timeAgo(d.last_seen_at)}</span>
                    <div className="ml-auto flex gap-1.5">
                      <button onClick={() => setSelectedDevice(d)}
                        className="text-[10px] px-2 py-1 rounded-lg font-medium transition-all"
                        style={{ color: "var(--accent)", background: "var(--accent)08", border: "1px solid var(--accent)15" }}>
                        Details
                      </button>
                      <button onClick={() => handleBan(d)} disabled={banMut.isLoading || unbanMut.isLoading}
                        className="text-[10px] px-2 py-1 rounded-lg font-medium transition-all"
                        style={{
                          color: d.is_banned ? "var(--accent-green)" : "var(--error)",
                          background: d.is_banned ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                          border: `1px solid ${d.is_banned ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                        }}>
                        {banMut.isLoading || unbanMut.isLoading ? "..." : d.is_banned ? "Unban" : "Ban"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-secondary text-xs px-4 py-2">Previous</button>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Page {page} of {totalPages} ({totalCount} total)</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary text-xs px-4 py-2">Next</button>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs"
          style={{ background: "rgba(52,211,153,0.06)", color: "var(--text-muted)", border: "1px solid rgba(52,211,153,0.1)", borderLeft: "3px solid var(--accent-green)" }}>
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-green-400" />
          </span>
          {totalCount} total devices &bull; Auto-refreshes every 15s &bull; Advanced analytics in Device Intelligence
        </div>
      </div>

      <DeviceDetailsDrawer device={selectedDevice} onClose={() => setSelectedDevice(null)} />
    </>
  )
}
