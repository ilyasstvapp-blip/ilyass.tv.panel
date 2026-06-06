"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { usePackages } from "@/hooks/usePackages"
import { useAllChannels } from "@/hooks/useChannels"
import { useUpdatePackage, useUpdateChannel } from "@/hooks/useMutations"
import { motion } from "framer-motion"
import type { Package, Channel } from "@/types/database"

export default function IPTVOrderPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dragPkgId, setDragPkgId] = useState<string | null>(null)
  const [dragChId, setDragChId] = useState<string | null>(null)
  const [dragOverPkgId, setDragOverPkgId] = useState<string | null>(null)
  const [dragOverChId, setDragOverChId] = useState<string | null>(null)

  const { data: packages, loading, error, refetch } = usePackages({
    sortBy: "sort_order", sortOrder: "asc", pageSize: 200, includeChannelCounts: true,
  })
  const { data: allChannels, loading: chLoading } = useAllChannels()
  const updatePkg = useUpdatePackage()
  const updateCh = useUpdateChannel()

  useEffect(() => { setMounted(true) }, [])

  const channelsByPkg = (pkgId: string): Channel[] =>
    (allChannels ?? []).filter(ch => ch.package_id === pkgId).sort((a, b) => a.sort_order - b.sort_order)

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const handlePkgDragStart = (id: string) => {
    setDragPkgId(id)
  }

  const handlePkgDragOver = (e: React.DragEvent, id: string) => {
    if (!dragPkgId) return
    e.preventDefault()
    setDragOverPkgId(id)
  }

  const handlePkgDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverPkgId(null)
    if (!dragPkgId || dragPkgId === targetId) { setDragPkgId(null); return }
    const dragged = packages.find(p => p.id === dragPkgId)
    const target = packages.find(p => p.id === targetId)
    if (!dragged || !target) { setDragPkgId(null); return }
    const tempOrder = dragged.sort_order
    try {
      await updatePkg.mutate(dragPkgId, { sort_order: target.sort_order })
      await updatePkg.mutate(targetId, { sort_order: tempOrder })
      refetch()
    } catch {}
    setDragPkgId(null)
  }

  const handlePkgDragEnd = () => {
    setDragPkgId(null)
    setDragOverPkgId(null)
  }

  const handleChDragStart = (id: string) => setDragChId(id)

  const handleChDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverChId(id)
  }

  const handleChDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverChId(null)
    if (!dragChId || dragChId === targetId) { setDragChId(null); return }
    const channels = channelsByPkg(expandedId!)
    const dragged = channels.find(c => c.id === dragChId)
    const target = channels.find(c => c.id === targetId)
    if (!dragged || !target) { setDragChId(null); return }
    const tempOrder = dragged.sort_order
    try {
      await updateCh.mutate(dragChId, { sort_order: target.sort_order })
      await updateCh.mutate(targetId, { sort_order: tempOrder })
      refetch()
    } catch {}
    setDragChId(null)
  }

  const handleChDragEnd = () => {
    setDragChId(null)
    setDragOverChId(null)
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 content-area space-y-5 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          {[1,2,3,4,5].map(i => <div key={i} className="iptv-card" style={{height:80}}/>)}
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
            IPTV Ordering
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Drag and drop to reorder packages and channels
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.15)" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="iptv-card" style={{height:72}}/>)}
          </div>
        ) : packages.length === 0 ? (
          <div className="iptv-card p-14 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
              <svg className="w-7 h-7" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No packages yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Create packages in the Packages section first</p>
          </div>
        ) : (
          <div className="space-y-2">
            {packages.map((pkg, idx) => {
              const pkgChannels = channelsByPkg(pkg.id)
              const chCount = pkgChannels.length
              const isExpanded = expandedId === pkg.id
              return (
                <div
                  key={pkg.id}
                  className={`iptv-card ${dragPkgId === pkg.id ? "dragging" : ""} ${dragOverPkgId === pkg.id ? "drag-over" : ""}`}
                  onDragOver={(e) => handlePkgDragOver(e, pkg.id)}
                  onDrop={(e) => handlePkgDrop(e, pkg.id)}
                  onDragEnd={handlePkgDragEnd}
                >
                  <div className="iptv-card-header" onClick={() => toggleExpand(pkg.id)}>
                    <div
                      className="iptv-drag-handle"
                      draggable
                      onDragStart={(e) => { e.stopPropagation(); handlePkgDragStart(pkg.id) }}
                      onDragEnd={handlePkgDragEnd}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 23a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: pkg.is_active ? "rgba(34,211,238,0.1)" : "var(--bg-tertiary)" }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: pkg.is_active ? "var(--accent)" : "var(--text-muted)" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{pkg.name}</span>
                          <span className="iptv-count-badge">{chCount}</span>
                        </div>
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          Order #{pkg.sort_order} &middot; {pkg.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <svg className={`iptv-expand-icon ${isExpanded ? "expanded" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <div className="iptv-channels-container" style={{
                    maxHeight: isExpanded ? `${pkgChannels.length * 48 + 8}px` : "0",
                  }}>
                    {chLoading && isExpanded ? (
                      <div className="px-5 py-3 text-xs animate-pulse" style={{ color: "var(--text-muted)" }}>Loading channels...</div>
                    ) : pkgChannels.length === 0 ? (
                      <div className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>No channels in this package</div>
                    ) : (
                      pkgChannels.map(ch => (
                        <div
                          key={ch.id}
                          className={`iptv-channel-item ${dragChId === ch.id ? "dragging" : ""} ${dragOverChId === ch.id ? "drag-over" : ""}`}
                          draggable
                          onDragStart={() => handleChDragStart(ch.id)}
                          onDragOver={(e) => handleChDragOver(e, ch.id)}
                          onDrop={(e) => handleChDrop(e, ch.id)}
                          onDragEnd={handleChDragEnd}
                        >
                          <div className="iptv-drag-handle" style={{ cursor: "grab", padding: "4px", opacity: 0.4, display: "flex", alignItems: "center" }}>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 23a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                            </svg>
                          </div>
                          {ch.logo
                            ? <img src={ch.logo} alt="" className="iptv-channel-logo" />
                            : <div className="iptv-channel-logo flex items-center justify-center text-[9px] font-bold"
                                style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>TV</div>}
                          <div className="iptv-channel-info">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{ch.name}</span>
                              {!ch.is_active && (
                                <span className="text-[9px] px-1 py-0 rounded" style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)" }}>inactive</span>
                              )}
                            </div>
                            <code className="text-[10px]" style={{ color: "var(--accent)" }}>{ch.channel_key}</code>
                          </div>
                          <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--text-muted)" }}>
                            #{ch.sort_order}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
