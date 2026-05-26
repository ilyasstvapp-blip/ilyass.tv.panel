"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useChannels, useChannelPackages } from "@/hooks/useChannels"
import { useCreateChannel, useUpdateChannel, useDeleteChannel } from "@/hooks/useMutations"
import type { Channel } from "@/types/database"

export default function ChannelsPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formPackage, setFormPackage] = useState("")
  const [formKey, setFormKey] = useState("")
  const [formName, setFormName] = useState("")
  const [formLogo, setFormLogo] = useState("")
  const [formServers, setFormServers] = useState<{ url: string; name: string }[]>([])
  const [serverInputUrl, setServerInputUrl] = useState("")
  const [serverInputName, setServerInputName] = useState("")

  const { data: channels, count, loading, error, refetch } = useChannels({
    search: search || undefined,
    sortBy: "created_at", sortOrder: "desc", page, pageSize: 15,
  })
  const { data: packages } = useChannelPackages()
  const createMut = useCreateChannel()
  const updateMut = useUpdateChannel()
  const deleteMut = useDeleteChannel()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setPage(1) }, [search])

  const resetForm = () => {
    setFormPackage(""); setFormKey(""); setFormName(""); setFormLogo("")
    setFormServers([]); setServerInputUrl(""); setServerInputName("")
    setEditId(null); setShowCreate(false)
  }

  const addServer = () => {
    if (!serverInputUrl.trim()) return
    setFormServers([...formServers, { url: serverInputUrl.trim(), name: serverInputName.trim() || `Server ${formServers.length + 1}` }])
    setServerInputUrl(""); setServerInputName("")
  }

  const removeServer = (idx: number) => {
    setFormServers(formServers.filter((_, i) => i !== idx))
  }

  const handleCreate = async () => {
    try {
      await createMut.mutate({ package_id: formPackage, channel_key: formKey, name: formName, logo: formLogo || undefined, servers: formServers })
      resetForm(); refetch()
    } catch {}
  }

  const handleUpdate = async () => {
    if (!editId) return
    try {
      await updateMut.mutate(editId, { package_id: formPackage, channel_key: formKey, name: formName, logo: formLogo, servers: formServers })
      resetForm(); refetch()
    } catch {}
  }

  const handleEdit = (ch: Channel) => {
    setEditId(ch.id); setFormPackage(ch.package_id); setFormKey(ch.channel_key)
    setFormName(ch.name); setFormLogo(ch.logo); setFormServers(ch.servers || [])
    setShowCreate(true)
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try { await updateMut.mutate(id, { is_active: !current }); refetch() } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this channel?")) return
    try { await deleteMut.mutate(id); refetch() } catch {}
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="stat-card" style={{background:"var(--surface)",height:100}}/>)}</div>
          <div className="card p-6" style={{ background: "var(--surface)" }}>
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded mb-3" style={{background:"var(--bg-tertiary)"}}/>)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  const totalPages = Math.ceil(count / 15)
  const activeCount = channels.filter(c => c.is_active).length
  const totalServers = channels.reduce((a, c) => a + (c.servers?.length || 0), 0)

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Total Channels", value: count, color: "var(--gradient-green)" },
            { label: "Active", value: activeCount, color: "var(--gradient-cyan)" },
            { label: "Stream Servers", value: totalServers, color: "var(--gradient-purple)" },
          ].map((s, i) => (
            <div key={s.label} className="stat-card animate-fade-in" style={{ background: "var(--surface)", animationDelay: `${i*0.1}s` }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              <p className="text-3xl font-bold" style={{ color: s.color.includes("green") ? "var(--accent-green)" : s.color.includes("cyan") ? "var(--accent-cyan)" : "var(--accent-purple)" }}>
                {loading ? "—" : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search channels..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <button onClick={() => { resetForm(); setShowCreate(true) }} className="btn btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              New
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreate && (
          <div className="card p-6 animate-fade-in" style={{ background: "var(--surface)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-1.5 h-5 rounded-full" style={{ background: "var(--gradient-green)" }} />
              {editId ? "Edit Channel" : "New Channel"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Package</label>
                <select value={formPackage} onChange={e => setFormPackage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="">Select package...</option>
                  {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Channel Key</label>
                <input type="text" value={formKey} onChange={e => setFormKey(e.target.value)}
                  placeholder="e.g. aljazeera-hd" />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Name</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Al Jazeera HD" />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Logo URL</label>
                <input type="text" value={formLogo} onChange={e => setFormLogo(e.target.value)}
                  placeholder="https://example.com/logo.png" />
              </div>
            </div>

            {/* Stream Servers */}
            <div className="mt-5">
              <label className="text-xs block mb-2 font-medium" style={{ color: "var(--text-muted)" }}>Stream Servers</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={serverInputUrl} onChange={e => setServerInputUrl(e.target.value)}
                  placeholder="https://stream.example.com/live/..." className="flex-1" />
                <input type="text" value={serverInputName} onChange={e => setServerInputName(e.target.value)}
                  placeholder="Server name" className="w-40" />
                <button onClick={addServer} disabled={!serverInputUrl.trim()} className="btn btn-secondary text-sm">+ Add</button>
              </div>
              {formServers.length > 0 && (
                <div className="space-y-2">
                  {formServers.map((srv, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
                      style={{ background: "var(--bg-tertiary)" }}>
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                        style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{srv.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{srv.url}</p>
                      </div>
                      <button onClick={() => removeServer(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={editId ? handleUpdate : handleCreate}
                disabled={!formPackage || !formKey || !formName || createMut.isLoading || updateMut.isLoading}
                className="btn btn-primary">
                {editId ? "Save Changes" : "Create Channel"}
              </button>
              <button onClick={resetForm} className="btn btn-secondary">Cancel</button>
            </div>
            {(createMut.error || updateMut.error) && (
              <p className="text-xs mt-3" style={{ color: "var(--error)" }}>{createMut.error || updateMut.error}</p>
            )}
          </div>
        )}

        {error && (
          <div className="card px-4 py-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)" }}>{error}</div>
        )}

        {/* Table */}
        {loading ? (
          <div className="card p-6 animate-pulse" style={{ background: "var(--surface)" }}>
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded mb-3" style={{background:"var(--bg-tertiary)"}}/>)}
          </div>
        ) : channels.length === 0 ? (
          <div className="card p-12 text-center" style={{ background: "var(--surface)" }}>
            <p style={{ color: "var(--text-muted)" }}>No channels found</p>
          </div>
        ) : (
          <div className="card overflow-hidden" style={{ background: "var(--surface)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="table-header">
                  <th>Key</th>
                  <th>Name</th>
                  <th>Package</th>
                  <th>Servers</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr></thead>
                <tbody>
                  {channels.map(ch => (
                    <tr key={ch.id} className="table-row">
                      <td>
                        <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-tertiary)", color: "var(--accent)" }}>
                          {ch.channel_key}
                        </code>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          {ch.logo
                            ? <img src={ch.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            : <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>TV</div>}
                          <span className="font-medium" style={{ color: "var(--text-primary)" }}>{ch.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {packages.find(p => p.id === ch.package_id)?.name ?? ch.package_id.substring(0, 8)}
                        </span>
                      </td>
                      <td>
                        <div className="flex -space-x-1">
                          {(ch.servers ?? []).slice(0, 3).map((srv, i) => (
                            <span key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                              style={{ background: "var(--bg-tertiary)", borderColor: "var(--surface)", color: "var(--accent)" }}
                              title={`${srv.name}: ${srv.url}`}>
                              {i + 1}
                            </span>
                          ))}
                          {(ch.servers?.length ?? 0) > 3 && (
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border-2"
                              style={{ background: "var(--bg-tertiary)", borderColor: "var(--surface)", color: "var(--text-muted)" }}>
                              +{ch.servers!.length - 3}
                            </span>
                          )}
                          {(!ch.servers || ch.servers.length === 0) && (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>None</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button onClick={() => handleToggleActive(ch.id, ch.is_active)}
                          className="toggle" style={{ background: ch.is_active ? "var(--accent-green)" : "var(--bg-tertiary)" }}>
                          <span className="toggle-knob" style={{ left: ch.is_active ? "22px" : "2px" }} />
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(ch)} className="btn btn-secondary text-xs py-1 px-3">Edit</button>
                          <button onClick={() => handleDelete(ch.id)} disabled={deleteMut.isLoading}
                            className="btn btn-danger text-xs py-1 px-3">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
      </div>
    </>
  )
}
