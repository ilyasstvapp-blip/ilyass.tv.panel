"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useDeviceSessions } from "@/hooks/useDevices"

export default function DevicesPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data: devices, count, loading, error } = useDeviceSessions({
    search: search || undefined, page, pageSize: 10,
  })

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setPage(1) }, [search])

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="stat-card" style={{background:"var(--surface)",height:100}}/>)}</div>
          <div className="card p-6" style={{ background: "var(--surface)" }}>
            {[1,2,3,4].map(i => <div key={i} className="h-12 rounded mb-3" style={{background:"var(--bg-tertiary)"}}/>)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  const totalPages = Math.ceil(count / 10)
  const online = devices.filter(d => {
    const diff = Date.now() - new Date(d.last_seen).getTime()
    return diff < 5 * 60 * 1000
  }).length

  const uniqueVersions = [...new Set(devices.filter(d => d.app_version).map(d => d.app_version!))]
  const uniquePlatforms = [...new Set(devices.filter(d => d.platform).map(d => d.platform!))]
  const bannedCount = devices.filter(d => d.is_banned).length

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Sessions", value: count, color: "var(--gradient-pink)" },
            { label: "Online (5min)", value: online, color: "var(--gradient-green)" },
            { label: "App Versions", value: uniqueVersions.length, color: "var(--gradient-cyan)" },
            { label: "Banned", value: bannedCount, color: "var(--gradient-orange)" },
          ].map((s, i) => (
            <div key={s.label} className="stat-card animate-fade-in" style={{ background: "var(--surface)", animationDelay: `${i*0.1}s` }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              <p className="text-3xl font-bold" style={{
                color: s.color.includes("pink") ? "var(--accent-pink)" : s.color.includes("green") ? "var(--accent-green)" : s.color.includes("cyan") ? "var(--accent-cyan)" : "var(--accent-orange)"
              }}>{loading ? "—" : s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search devices..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          {uniquePlatforms.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {uniquePlatforms.map(p => (
                <span key={p} className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>{p}</span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="card p-4" style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)" }}>{error}</div>
        )}

        {loading ? (
          <div className="card p-6 animate-pulse" style={{ background: "var(--surface)" }}>
            {[1,2,3,4].map(i => <div key={i} className="h-12 rounded mb-3" style={{background:"var(--bg-tertiary)"}}/>)}
          </div>
        ) : devices.length === 0 ? (
          <div className="card p-12 text-center" style={{ background: "var(--surface)" }}>
            <p style={{ color: "var(--text-muted)" }}>No device sessions found</p>
          </div>
        ) : (
          <div className="card overflow-hidden" style={{ background: "var(--surface)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="table-header">
                  {["Device", "Platform", "Android", "App Ver", "Model", "First Seen", "Last Seen", "Status"].map(h => <th key={h}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {devices.map(d => {
                    const isOnline = Date.now() - new Date(d.last_seen).getTime() < 5 * 60 * 1000
                    return (
                      <tr key={d.id} className="table-row">
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400" : "bg-gray-500"}`} />
                            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{d.device_name}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>{d.platform || "—"}</td>
                        <td><code className="text-xs" style={{ color: "var(--text-muted)" }}>{d.android_version || d.sdk_version || "—"}</code></td>
                        <td><span className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--accent)" }}>{d.app_version || "—"}</span></td>
                        <td><span className="text-xs" style={{ color: "var(--text-muted)" }}>{d.model || d.brand || "—"}</span></td>
                        <td className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(d.first_seen).toLocaleDateString()}</td>
                        <td className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(d.last_seen).toLocaleString()}
                          {isOnline && <span className="ml-1 text-green-400">•</span>}
                        </td>
                        <td>
                          <span className={`badge ${d.is_banned ? "badge-banned" : "badge-active"}`}>
                            {d.is_banned ? "Banned" : isOnline ? "Online" : "Offline"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-secondary">Previous</button>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary">Next</button>
          </div>
        )}

        <div className="card px-4 py-3 text-xs flex items-center gap-2" style={{ background: "var(--surface)", color: "var(--text-muted)", borderLeft: "3px solid var(--warning)" }}>
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          READ ONLY — Device management is handled by the Flutter app.
        </div>
      </div>
    </>
  )
}
