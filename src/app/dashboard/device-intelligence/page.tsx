"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useDeviceIntelligence } from "@/hooks/useDeviceIntelligence"
import { useDeviceSessions } from "@/hooks/useDevices"
import { useBanDevice, useUnbanDevice } from "@/hooks/useMutations"
import { fadeInUp, MotionDiv, MotionSection } from "prism-kit"

import DeviceOverviewCards from "@/components/dashboard/DeviceOverviewCards"
import OnlinePresenceDashboard from "@/components/dashboard/OnlinePresenceDashboard"
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed"
import DeviceDetailsDrawer from "@/components/dashboard/DeviceDetailsDrawer"
import DevicesByLocation from "@/components/dashboard/DevicesByLocation"
import NetworkAnalytics from "@/components/dashboard/NetworkAnalytics"
import ConnectionAnalytics from "@/components/dashboard/ConnectionAnalytics"
import ApplicationAnalytics from "@/components/dashboard/ApplicationAnalytics"
import PlayerPresenceSystem from "@/components/dashboard/PlayerPresenceSystem"
import SecurityCenter from "@/components/dashboard/SecurityCenter"
import AnalyticsModal from "@/components/dashboard/AnalyticsModal"
import { Button } from "@/components/ui/button"
import type { DeviceWithPresence } from "@/types/database"

type ModalType = "country" | "city" | "isp" | "version" | "connection" | null

export default function DeviceIntelligencePage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [searchPage, setSearchPage] = useState(1)
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithPresence | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("")
  const [bannedFilter, setBannedFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const { data: intelligence, loading: intelLoading } = useDeviceIntelligence(10000)
  const { data: devices, totalCount, displayedCount, loading: devicesLoading, refetch } = useDeviceSessions({
    search: search || undefined,
    status: statusFilter || undefined,
    deviceType: deviceTypeFilter || undefined,
    banned: bannedFilter || undefined,
    page: searchPage, pageSize: 24, pollInterval: 10000,
  })

  const banMut = useBanDevice()
  const unbanMut = useUnbanDevice()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setSearchPage(1) }, [search, statusFilter, deviceTypeFilter, bannedFilter])

  const totalPages = Math.ceil(totalCount / 24)
  const hasActiveFilters = search || statusFilter || deviceTypeFilter || bannedFilter

  const clearFilters = () => { setSearch(""); setStatusFilter(""); setDeviceTypeFilter(""); setBannedFilter(""); setSearchPage(1) }

  const handleBan = async (d: DeviceWithPresence) => {
    try {
      if (d.is_banned) await unbanMut.mutate(d.id); else await banMut.mutate(d.id)
      refetch()
      if (selectedDevice?.id === d.id) setSelectedDevice({ ...d, is_banned: !d.is_banned })
    } catch {}
  }

  const timeAgo = (dateStr: string | null | undefined) => {
    if (!dateStr) return "\u2014"
    const diff = Date.now() - new Date(dateStr).getTime()
    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(dateStr).toLocaleDateString()
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="rounded-2xl" style={{ height: 120, background: "var(--surface)" }} />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-40 rounded-2xl" style={{ background: "var(--surface)" }} />)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  return (
    <>
      <Navbar />
      <div className="flex-1 content-area space-y-6 xl:space-y-8" style={{ background: "var(--bg-primary)" }}>
        {/* Header */}
        <MotionDiv variants={fadeInUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Device Intelligence &amp; Presence Center
            </h1>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5"
              style={{ background: "rgba(52,211,153,0.1)", color: "var(--accent-green)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-green-400" />
              </span>
              Auto-refresh 10s
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Online/offline monitoring &bull; Geo analytics &bull; ISP tracking &bull; Player presence &bull; Security
          </p>
        </MotionDiv>

        {/* Stats Overview */}
        <MotionSection variants={fadeInUp} initial="hidden" animate="visible">
          <DeviceOverviewCards data={intelligence?.overview ?? null} loading={intelLoading} />
        </MotionSection>

        {/* Online Presence + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6">
          <MotionDiv variants={fadeInUp} initial="hidden" animate="visible" className="lg:col-span-1">
            <OnlinePresenceDashboard data={intelligence?.presence_summary ?? null} loading={intelLoading} />
          </MotionDiv>
          <MotionDiv variants={fadeInUp} initial="hidden" animate="visible" className="lg:col-span-2" transition={{ delay: 0.1 }}>
            <LiveActivityFeed events={intelligence?.activity_feed ?? null} loading={intelLoading} />
          </MotionDiv>
        </div>

        {/* Interactive Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
          <MotionDiv variants={fadeInUp} initial="hidden" animate="visible">
            <DevicesByLocation
              countries={intelligence?.devices_by_country ?? null}
              cities={intelligence?.devices_by_city ?? null}
              loading={intelLoading}
              onCountryClick={() => setActiveModal("country")}
              onCityClick={() => setActiveModal("city")}
            />
          </MotionDiv>
          <MotionDiv variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <NetworkAnalytics isps={intelligence?.isp_analytics ?? null} loading={intelLoading}
              onClick={() => setActiveModal("isp")} />
          </MotionDiv>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6">
          <MotionDiv variants={fadeInUp} initial="hidden" animate="visible">
            <ConnectionAnalytics types={intelligence?.connection_types ?? null} loading={intelLoading}
              onClick={() => setActiveModal("connection")} />
          </MotionDiv>
          <MotionDiv variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <ApplicationAnalytics versions={intelligence?.app_versions ?? null} loading={intelLoading}
              onClick={() => setActiveModal("version")} />
          </MotionDiv>
          <MotionDiv variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <SecurityCenter security={intelligence?.security_summary ?? null} loading={intelLoading} />
          </MotionDiv>
        </div>

        {/* Player Presence */}
        <MotionSection variants={fadeInUp} initial="hidden" animate="visible">
          <PlayerPresenceSystem playerStats={intelligence?.player_stats ?? null} loading={intelLoading} />
        </MotionSection>

        {/* Device Search & List */}
        <MotionSection variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-1 h-5 rounded-full" style={{ background: "var(--gradient-cyan)" }} />
              Device Search
              <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                {hasActiveFilters ? `${displayedCount} of ${totalCount}` : `${totalCount}`} devices
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}
                style={{ border: hasActiveFilters ? "1px solid var(--accent-cyan)" : "1px solid var(--border)" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </Button>
              {hasActiveFilters && <Button variant="secondary" size="sm" onClick={clearFilters}>Clear</Button>}
            </div>
          </div>

          {/* Filter indicator */}
          {hasActiveFilters && (
            <div className="px-4 py-2.5 rounded-xl text-xs" style={{ background: "var(--accent-subtle)", border: "1px solid var(--border-accent)" }}>
              <span style={{ color: "var(--text-secondary)" }}>
                Showing <strong style={{ color: "var(--accent)" }}>{displayedCount}</strong> of{" "}
                <strong style={{ color: "var(--text-primary)" }}>{totalCount}</strong> Devices
                {search && <> &mdash; searching &ldquo;{search}&rdquo;</>}
                {statusFilter && <> &mdash; {statusFilter}</>}
                {deviceTypeFilter && <> &mdash; {deviceTypeFilter}</>}
                {bannedFilter && <> &mdash; {bannedFilter === "true" ? "Banned" : "Not Banned"}</>}
              </span>
            </div>
          )}

          <div className="relative max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search name, ID, brand, model..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>

          {showFilters && (
            <div className="card-3d-static p-4 flex flex-wrap gap-3">
              <div>
                <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="">All</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Type</label>
                <select value={deviceTypeFilter} onChange={e => setDeviceTypeFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="">All</option>
                  <option value="phone">Phone</option>
                  <option value="tablet">Tablet</option>
                  <option value="tv">TV</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Banned</label>
                <select value={bannedFilter} onChange={e => setBannedFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="">All</option>
                  <option value="true">Banned</option>
                  <option value="false">Not Banned</option>
                </select>
              </div>
            </div>
          )}

          {devicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 animate-pulse">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 rounded-xl" style={{ background: "var(--bg-tertiary)" }} />)}
            </div>
          ) : devices.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
                <svg className="w-6 h-6" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No devices found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {devices.map((d) => (
                  <motion.div key={d.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
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
                <div className="flex items-center justify-between pt-2">
                  <Button variant="secondary" size="sm" disabled={searchPage <= 1} onClick={() => setSearchPage(searchPage - 1)}>Previous</Button>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Page {searchPage} of {totalPages} ({totalCount} total)</span>
                  <Button variant="secondary" size="sm" disabled={searchPage >= totalPages} onClick={() => setSearchPage(searchPage + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </MotionSection>

        {/* Status Footer */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs"
          style={{ background: "rgba(52,211,153,0.06)", color: "var(--text-muted)", border: "1px solid rgba(52,211,153,0.1)", borderLeft: "3px solid var(--accent-green)" }}>
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-green-400" />
          </span>
          Real-time intelligence &bull; Auto-refreshes every 10s &bull; {intelligence?.overview.total_devices ?? 0} total devices tracked
        </div>
      </div>

      {/* Device Details Drawer */}
      <DeviceDetailsDrawer device={selectedDevice} onClose={() => setSelectedDevice(null)} />

      {/* Interactive Analytics Modals */}
      <AnalyticsModal
        open={activeModal === "country"}
        onClose={() => setActiveModal(null)}
        type="country"
        title="Countries"
        data={intelligence?.devices_by_country ?? []}
        totalDevices={intelligence?.overview.total_devices ?? 0}
      />
      <AnalyticsModal
        open={activeModal === "city"}
        onClose={() => setActiveModal(null)}
        type="city"
        title="Cities"
        data={intelligence?.devices_by_city ?? []}
        totalDevices={intelligence?.overview.total_devices ?? 0}
      />
      <AnalyticsModal
        open={activeModal === "isp"}
        onClose={() => setActiveModal(null)}
        type="isp"
        title="ISPs"
        data={intelligence?.isp_analytics ?? []}
        totalDevices={intelligence?.overview.total_devices ?? 0}
      />
      <AnalyticsModal
        open={activeModal === "version"}
        onClose={() => setActiveModal(null)}
        type="version"
        title="App Versions"
        data={intelligence?.app_versions ?? []}
        totalDevices={intelligence?.overview.total_devices ?? 0}
      />
      <AnalyticsModal
        open={activeModal === "connection"}
        onClose={() => setActiveModal(null)}
        type="connection"
        title="Connection Types"
        data={intelligence?.connection_types ?? []}
        totalDevices={intelligence?.overview.total_devices ?? 0}
      />
    </>
  )
}
