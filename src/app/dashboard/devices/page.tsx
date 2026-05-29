"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useDeviceSessions } from "@/hooks/useDevices"
import { useBanDevice, useUnbanDevice } from "@/hooks/useMutations"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DeviceWithPresence } from "@/types/database"
import { motion } from "framer-motion"

const deviceTypeLabel = (d: DeviceWithPresence) => {
  if (d.is_tv) return "TV"
  if (d.is_tablet) return "Tablet"
  return "Phone"
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b text-sm" style={{ borderColor: "var(--border)" }}>
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="font-medium text-right max-w-[60%] truncate" style={{ color: "var(--text-primary)" }}>
        {value ?? "\u2014"}
      </span>
    </div>
  )
}

export default function DevicesPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("")
  const [bannedFilter, setBannedFilter] = useState("")
  const [activeTodayFilter, setActiveTodayFilter] = useState("")
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithPresence | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { data: devices, count, loading, error, refetch } = useDeviceSessions({
    search: search || undefined,
    status: statusFilter || undefined,
    deviceType: deviceTypeFilter || undefined,
    banned: bannedFilter || undefined,
    activeToday: activeTodayFilter || undefined,
    page, pageSize: 24,
    pollInterval: 10000,
  })

  const banMut = useBanDevice()
  const unbanMut = useUnbanDevice()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setPage(1) }, [search, statusFilter, deviceTypeFilter, bannedFilter, activeTodayFilter])

  const totalPages = Math.ceil(count / 24)
  const onlineCount = devices.filter(d => d.realtime_online).length
  const offlineCount = count - onlineCount
  const tvCount = devices.filter(d => d.is_tv).length
  const tabletCount = devices.filter(d => d.is_tablet).length
  const phoneCount = devices.filter(d => !d.is_tv && !d.is_tablet).length

  const clearFilters = () => {
    setSearch(""); setStatusFilter(""); setDeviceTypeFilter(""); setBannedFilter(""); setActiveTodayFilter(""); setPage(1)
  }

  const handleBan = async (d: DeviceWithPresence) => {
    try {
      if (d.is_banned) await unbanMut.mutate(d.id)
      else await banMut.mutate(d.id)
      refetch()
      if (selectedDevice?.id === d.id) setSelectedDevice({ ...d, is_banned: !d.is_banned })
    } catch {}
  }

  const hasActiveFilters = search || statusFilter || deviceTypeFilter || bannedFilter || activeTodayFilter

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="card-3d" style={{height:100}} />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 card-3d" />)}
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
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Device Sessions
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Monitor and manage connected devices
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
          {[
            { label: "Total", value: count, color: "var(--accent-cyan)" },
            { label: "Online", value: onlineCount, color: "var(--accent-green)" },
            { label: "Offline", value: offlineCount, color: "var(--text-muted)" },
            { label: "TVs", value: tvCount, color: "var(--accent-purple)" },
            { label: "Tablets", value: tabletCount, color: "var(--accent-pink)" },
            { label: "Phones", value: phoneCount, color: "var(--accent-orange)" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="stat-card-3d"
            >
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </div>
              <p className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: s.color }}>
                {loading ? "\u2014" : s.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search name, ID, brand..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}
              style={{ border: hasActiveFilters ? "1px solid var(--accent-cyan)" : "1px solid var(--border)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && ` (${[statusFilter, deviceTypeFilter, bannedFilter, activeTodayFilter].filter(Boolean).length})`}
            </Button>
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>Clear</Button>
            )}
          </div>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="card-3d-static p-4 flex flex-wrap gap-3">
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
            <div>
              <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Activity</label>
              <select value={activeTodayFilter} onChange={e => setActiveTodayFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg outline-none"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <option value="">All Time</option>
                <option value="true">Active Today</option>
              </select>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.15)" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card-3d" style={{height: 140}} />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="card-3d-static p-14 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
              <svg className="w-7 h-7" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No devices found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {devices.map((d, idx) => {
              const statusClass = d.is_banned ? "status-badge-banned" : d.realtime_online ? "status-badge-online" : "status-badge-offline"
              const dotClass = d.is_banned ? "status-banned" : d.realtime_online ? "status-online" : "status-offline"
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="device-card-compact"
                >
                  <div className="device-card-compact-header">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: d.realtime_online ? "rgba(52,211,153,0.12)" : "var(--bg-tertiary)",
                          color: d.realtime_online ? "var(--accent-green)" : "var(--text-muted)",
                        }}>
                        {d.platform?.charAt(0)?.toUpperCase() || "D"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {d.device_name || "Unknown"}
                        </p>
                        <span className={`status-badge ${statusClass}`}>
                          <span className={`status-dot ${dotClass}`} />
                          {d.is_banned ? "Banned" : d.realtime_online ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className="text-xs font-mono" style={{ color: "var(--accent-cyan)" }}>
                        {d.total_opens || 0}
                      </span>
                      <p className="text-[9px] text-right" style={{ color: "var(--text-muted)" }}>opens</p>
                    </div>
                  </div>

                  <div className="device-card-compact-body">
                    <div className="device-card-compact-field">
                      <span className="device-card-compact-field-label">Type</span>
                      <span className="device-card-compact-field-value">{deviceTypeLabel(d)}</span>
                    </div>
                    <div className="device-card-compact-field">
                      <span className="device-card-compact-field-label">Platform</span>
                      <span className="device-card-compact-field-value">{d.platform || "\u2014"}</span>
                    </div>
                    <div className="device-card-compact-field">
                      <span className="device-card-compact-field-label">App</span>
                      <span className="device-card-compact-field-value">v{d.app_version || "\u2014"}</span>
                    </div>
                    <div className="device-card-compact-field">
                      <span className="device-card-compact-field-label">Last Activity</span>
                      <span className="device-card-compact-field-value">
                        {d.last_seen_at ? new Date(d.last_seen_at).toLocaleDateString() : "\u2014"}
                      </span>
                    </div>
                    <div className="device-card-compact-field">
                      <span className="device-card-compact-field-label">Device ID</span>
                      <span className="device-card-compact-field-value text-[11px] font-mono" style={{ color: "var(--accent)" }}>
                        {d.device_id ? d.device_id.substring(0, 12) : "\u2014"}
                      </span>
                    </div>
                    <div className="device-card-compact-field">
                      <span className="device-card-compact-field-label">Brand</span>
                      <span className="device-card-compact-field-value">{d.brand || "\u2014"}</span>
                    </div>
                  </div>

                  <div className="device-card-compact-actions">
                    <Button variant="secondary" size="xs"
                      onClick={(e) => { e.stopPropagation(); setSelectedDevice(d) }}
                      className="text-[10px] px-3 py-1 flex-1">
                      View Details
                    </Button>
                    <Button variant={d.is_banned ? "default" : "destructive"} size="xs"
                      onClick={(e) => { e.stopPropagation(); handleBan(d) }}
                      disabled={banMut.isLoading || unbanMut.isLoading}
                      className="text-[10px] px-3 py-1 flex-[0.5]">
                      {banMut.isLoading || unbanMut.isLoading ? "..." : d.is_banned ? "Unban" : "Ban"}
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Page {page} of {totalPages}
            </span>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}

        <Dialog open={!!selectedDevice} onOpenChange={(open) => { if (!open) setSelectedDevice(null) }}>
          <DialogContent showCloseButton={false} className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Device Details</DialogTitle>
              <DialogDescription>Full device and presence information</DialogDescription>
            </DialogHeader>
            {selectedDevice && (
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-4 p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{
                        background: selectedDevice.realtime_online ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
                        color: selectedDevice.realtime_online ? "var(--accent-green)" : "var(--error)",
                      }}>
                      {selectedDevice.platform?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {selectedDevice.device_name || "Unknown Device"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`status-badge ${selectedDevice.is_banned ? "status-badge-banned" : selectedDevice.realtime_online ? "status-badge-online" : "status-badge-offline"}`}>
                          <span className={`status-dot ${selectedDevice.is_banned ? "status-banned" : selectedDevice.realtime_online ? "status-online" : "status-offline"}`} />
                          {selectedDevice.is_banned ? "Banned" : selectedDevice.realtime_online ? "Online" : "Offline"}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {deviceTypeLabel(selectedDevice)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`status-dot ${selectedDevice.realtime_online ? "status-online" : "status-offline"}`} />
                </div>

                <div className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--accent-cyan)" }}>
                  <span className="w-1 h-4 rounded-full" style={{ background: "var(--gradient-cyan)" }} />
                  Device Information
                </div>
                <DetailRow label="Device Name" value={selectedDevice.device_name} />
                <DetailRow label="Device ID" value={selectedDevice.device_id} />
                <DetailRow label="Brand" value={selectedDevice.brand} />
                <DetailRow label="Manufacturer" value={selectedDevice.manufacturer} />
                <DetailRow label="Model" value={selectedDevice.model} />
                <DetailRow label="Platform" value={selectedDevice.platform} />
                <DetailRow label="Device Type" value={deviceTypeLabel(selectedDevice)} />
                <DetailRow label="Android Version" value={selectedDevice.android_version} />
                <DetailRow label="SDK Version" value={selectedDevice.sdk_version} />
                <DetailRow label="Build Number" value={selectedDevice.build_number} />
                <DetailRow label="App Version" value={selectedDevice.app_version} />
                <DetailRow label="Screen" value={selectedDevice.screen_category
                  ? `${selectedDevice.screen_category} (${selectedDevice.screen_width}x${selectedDevice.screen_height}, ${selectedDevice.screen_dpi}dpi)`
                  : null} />
                <DetailRow label="Orientation" value={selectedDevice.orientation} />

                <div className="text-xs font-semibold mb-2 mt-4 flex items-center gap-2" style={{ color: "var(--accent-green)" }}>
                  <span className="w-1 h-4 rounded-full" style={{ background: "var(--gradient-green)" }} />
                  Presence Information
                </div>
                <DetailRow label="Online Status" value={selectedDevice.realtime_online ? "Online" : "Offline"} />
                <DetailRow label="First Seen" value={selectedDevice.first_seen ? new Date(selectedDevice.first_seen).toLocaleString() : null} />
                <DetailRow label="Last Open" value={selectedDevice.last_open_at ? new Date(selectedDevice.last_open_at).toLocaleString() : null} />
                <DetailRow label="Last Seen" value={selectedDevice.last_seen_at ? new Date(selectedDevice.last_seen_at).toLocaleString() : null} />
                <DetailRow label="Total Opens" value={selectedDevice.total_opens ?? 0} />
                <DetailRow label="Banned" value={selectedDevice.is_banned ? "Yes" : "No"} />
              </div>
            )}
            <DialogFooter className="flex gap-2">
              <Button variant={selectedDevice?.is_banned ? "default" : "destructive"}
                onClick={() => { if (selectedDevice) handleBan(selectedDevice) }}
                disabled={banMut.isLoading || unbanMut.isLoading}>
                {banMut.isLoading || unbanMut.isLoading ? "..." : selectedDevice?.is_banned ? "Unban Device" : "Ban Device"}
              </Button>
              <DialogClose render={<Button variant="secondary">Close</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
          Auto-refreshes every 10s &bull; Online status from heartbeat
        </div>
      </div>
    </>
  )
}
