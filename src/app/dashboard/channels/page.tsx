"use client"

import { useState, useEffect, useCallback, Fragment } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useChannels, useChannelPackages } from "@/hooks/useChannels"
import { useCreateChannel, useUpdateChannel, useDeleteChannel } from "@/hooks/useMutations"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import type { Channel } from "@/types/database"

export default function ChannelsPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedServers, setExpandedServers] = useState<string | null>(null)
  const [formPackage, setFormPackage] = useState("")
  const [formKey, setFormKey] = useState("")
  const [formName, setFormName] = useState("")
  const [formLogo, setFormLogo] = useState("")
  const [formOrder, setFormOrder] = useState(0)
  const [formServers, setFormServers] = useState<{ url: string; name: string; enabled?: boolean }[]>([])
  const [serverInputUrl, setServerInputUrl] = useState("")
  const [serverInputName, setServerInputName] = useState("")
  const [keyManualOverride, setKeyManualOverride] = useState(false)

  const { data: channels, count, loading, error, refetch } = useChannels({
    search: search || undefined,
    sortBy: "sort_order", sortOrder: "asc", page, pageSize: 50,
  })
  const { data: packages } = useChannelPackages()
  const createMut = useCreateChannel()
  const updateMut = useUpdateChannel()
  const deleteMut = useDeleteChannel()

  const generateKey = (pkgId: string, name: string) => {
    const pkg = packages.find(p => p.id === pkgId)
    const prefix = pkg ? pkg.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") : "ch"
    const safeName = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
    if (!safeName) return ""
    return `${prefix}_${safeName}`
  }

  useEffect(() => {
    if (!keyManualOverride && formPackage && formName) {
      const generated = generateKey(formPackage, formName)
      if (generated) setFormKey(generated)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formPackage, formName, keyManualOverride])

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setPage(1) }, [search])

  const resetForm = () => {
    setFormPackage(""); setFormKey(""); setFormName(""); setFormLogo(""); setFormOrder(0)
    setFormServers([]); setServerInputUrl(""); setServerInputName("")
    setEditId(null); setShowCreate(false); setKeyManualOverride(false)
  }

  const addServer = () => {
    if (!serverInputUrl.trim()) return
    setFormServers([...formServers, { url: serverInputUrl.trim(), name: serverInputName.trim() || `Server ${formServers.length + 1}`, enabled: true }])
    setServerInputUrl(""); setServerInputName("")
  }

  const removeServer = (idx: number) => {
    setFormServers(formServers.filter((_, i) => i !== idx))
  }

  const handleCreate = async () => {
    try {
      await createMut.mutate({ package_id: formPackage, channel_key: formKey, name: formName, logo: formLogo || undefined, servers: formServers, sort_order: formOrder })
      resetForm(); refetch()
    } catch {}
  }

  const handleUpdate = async () => {
    if (!editId) return
    try {
      await updateMut.mutate(editId, { package_id: formPackage, channel_key: formKey, name: formName, logo: formLogo, servers: formServers, sort_order: formOrder })
      resetForm(); refetch()
    } catch {}
  }

  const handleEdit = (ch: Channel) => {
    setEditId(ch.id); setFormPackage(ch.package_id); setFormKey(ch.channel_key)
    setFormName(ch.name); setFormLogo(ch.logo); setFormServers(ch.servers || [])
    setFormOrder((ch as any).sort_order ?? 0)
    setShowCreate(true)
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try { await updateMut.mutate(id, { is_active: !current }); refetch() } catch {}
  }

  const handleToggleServer = async (chId: string, srvIdx: number, currentEnabled: boolean) => {
    const ch = channels.find(c => c.id === chId)
    if (!ch || !ch.servers) return
    const servers = ch.servers.map((s, i) => i === srvIdx ? { ...s, enabled: !currentEnabled } : s)
    try { await updateMut.mutate(chId, { servers }); refetch() } catch {}
  }

  const handleRemoveServer = async (chId: string, srvIdx: number) => {
    const ch = channels.find(c => c.id === chId)
    if (!ch || !ch.servers) return
    const servers = ch.servers.filter((_, i) => i !== srvIdx)
    try { await updateMut.mutate(chId, { servers }); refetch() } catch {}
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteMut.mutate(deleteId); setDeleteId(null); refetch() } catch {}
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="card-premium" style={{height:100}}/>)}</div>
          <div className="card-premium p-6">{[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded mb-3" style={{background:"var(--bg-tertiary)"}}/>)}</div>
        </div>
      </>
    )
  }
  if (!user) return null

  const totalPages = Math.ceil(count / 50)
  const activeCount = channels.filter(c => c.is_active).length
  const totalServers = channels.reduce((a, c) => a + (c.servers?.length || 0), 0)

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Channels</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Manage your IPTV channel lineup</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Total Channels", value: count, color: "var(--accent-green)" },
            { label: "Active", value: activeCount, color: "var(--accent-cyan)" },
            { label: "Stream Servers", value: totalServers, color: "var(--accent-purple)" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-premium p-5" style={{ background: "var(--surface)" }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              <p className="text-3xl font-bold tracking-tight" style={{ color: s.color }}>
                {loading ? "\u2014" : s.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search channels..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <button onClick={() => { resetForm(); setShowCreate(true) }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))", color: "white" }}>
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              New Channel
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.15)" }}>
            {error}
          </div>
        )}

        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="card-premium p-6" style={{ background: "var(--surface)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-1 h-5 rounded-full" style={{ background: "var(--gradient-green)" }} />
              {editId ? "Edit Channel" : "New Channel"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Package</label>
                <select value={formPackage} onChange={e => { setFormPackage(e.target.value); setKeyManualOverride(false) }}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="">Select package...</option>
                  {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>
                  Channel Key
                  {!keyManualOverride && formKey && <span className="ml-1.5 text-[9px] font-normal" style={{ color: "var(--accent-green)" }}>(auto)</span>}
                </label>
                <div className="relative">
                  <input type="text" value={formKey} onChange={e => { setFormKey(e.target.value); setKeyManualOverride(true) }}
                    placeholder="e.g. premier_league_man_city"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Name</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Al Jazeera HD"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Sort Order</label>
                <input type="number" value={formOrder} onChange={e => setFormOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Logo URL</label>
                <input type="text" value={formLogo} onChange={e => setFormLogo(e.target.value)} placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs block mb-2 font-medium" style={{ color: "var(--text-muted)" }}>Stream Servers</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <input type="text" value={serverInputUrl} onChange={e => setServerInputUrl(e.target.value)}
                  placeholder="https://stream.example.com/live/..." className="flex-1 min-w-[200px] px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input type="text" value={serverInputName} onChange={e => setServerInputName(e.target.value)}
                  placeholder="Server name" className="w-36 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <button onClick={addServer} disabled={!serverInputUrl.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background: "var(--bg-tertiary)", color: "var(--accent)", border: "1px solid var(--border)" }}>
                  + Add Server
                </button>
              </div>
              {formServers.length > 0 && (
                <div className="space-y-2">
                  {formServers.map((srv, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: "var(--bg-tertiary)" }}>
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: `${srv.enabled !== false ? "var(--accent-cyan)" : "var(--error)"}15`, color: srv.enabled !== false ? "var(--accent-cyan)" : "var(--error)" }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{srv.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{srv.url}</p>
                      </div>
                      <span className={`status-dot ${srv.enabled !== false ? "status-online" : "status-offline"}`} />
                      <button onClick={() => removeServer(i)} className="text-xs font-medium transition-colors hover:opacity-80"
                        style={{ color: "var(--error)" }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={editId ? handleUpdate : handleCreate}
                disabled={!formPackage || !formKey || !formName || createMut.isLoading || updateMut.isLoading}
                className="px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))", color: "white", opacity: (!formPackage || !formKey || !formName) ? 0.5 : 1 }}>
                {editId ? "Save Changes" : "Create Channel"}
              </button>
              <button onClick={resetForm}
                className="px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Cancel
              </button>
            </div>
            {(createMut.error || updateMut.error) && (
              <p className="text-xs mt-3" style={{ color: "var(--error)" }}>{createMut.error || updateMut.error}</p>
            )}
          </motion.div>
        )}

        {loading ? (
          <div className="card-premium p-6 animate-pulse" style={{ background: "var(--surface)" }}>
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded mb-3" style={{background:"var(--bg-tertiary)"}}/>)}
          </div>
        ) : channels.length === 0 ? (
          <div className="card-premium p-14 text-center" style={{ background: "var(--surface)" }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
              <svg className="w-7 h-7" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No channels found</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Create your first channel to get started</p>
          </div>
        ) : (
          <div className="card-premium overflow-hidden" style={{ background: "var(--surface)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="table-header">
                  <th>Key</th>
                  <th>Name</th>
                  <th>Package</th>
                  <th>Servers</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr></thead>
                <tbody>
                  {channels.map((ch, idx) => (
                    <Fragment key={ch.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="table-row">
                        <td>
                          <code className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "var(--bg-tertiary)", color: "var(--accent)" }}>
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
                          <span className="text-xs px-2 py-1 rounded-md" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                            {packages.find(p => p.id === ch.package_id)?.name ?? ch.package_id.substring(0, 8)}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => setExpandedServers(expandedServers === ch.id ? null : ch.id)}
                            className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                            style={{ color: "var(--accent)" }}>
                            {(ch.servers?.length ?? 0)} server{(ch.servers?.length ?? 0) !== 1 ? "s" : ""}
                            <svg className={`w-3 h-3 transition-transform ${expandedServers === ch.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>
                        <td>
                          <span className="badge text-[10px]" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                            {(ch as any).sort_order ?? idx}
                          </span>
                        </td>
                        <td>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={ch.is_active} onChange={() => handleToggleActive(ch.id, ch.is_active)}
                              className="sr-only peer" />
                            <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                              style={{ background: ch.is_active ? "var(--accent-green)" : "var(--bg-tertiary)" }} />
                          </label>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(ch)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              style={{ background: "var(--bg-tertiary)", color: "var(--accent)", border: "1px solid var(--border)" }}>
                              Edit
                            </button>
                            <button onClick={() => setDeleteId(ch.id)} disabled={deleteMut.isLoading}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.2)" }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                      {expandedServers === ch.id && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                              className="p-4 space-y-2" style={{ background: "var(--bg-tertiary)" }}>
                              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Stream Servers</p>
                              {(ch.servers ?? []).length === 0 ? (
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No servers configured</p>
                              ) : (
                                (ch.servers ?? []).map((srv, si) => (
                                  <div key={si} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
                                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                    <span className={`status-dot ${srv.enabled !== false ? "status-online" : "status-offline"}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{srv.name}</p>
                                      <p className="text-xs truncate font-mono" style={{ color: "var(--text-muted)" }}>{srv.url}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                      <input type="checkbox" checked={srv.enabled !== false}
                                        onChange={() => handleToggleServer(ch.id, si, srv.enabled !== false)}
                                        className="sr-only peer" />
                                      <div className="w-8 h-4 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[0.5px] after:left-[0.5px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all"
                                        style={{ background: srv.enabled !== false ? "var(--accent-green)" : "var(--bg-tertiary)" }} />
                                    </label>
                                    <button onClick={() => handleRemoveServer(ch.id, si)}
                                      className="text-xs font-medium transition-colors hover:opacity-80"
                                      style={{ color: "var(--error)" }}>Remove</button>
                                  </div>
                                ))
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              Previous
            </button>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              Next
            </button>
          </div>
        )}

        <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
          <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Channel</DialogTitle>
              <DialogDescription>Are you sure you want to delete this channel? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<button className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Cancel</button>} />
              <button onClick={handleDelete} disabled={deleteMut.isLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: "var(--error)", color: "white" }}>
                {deleteMut.isLoading ? "Deleting..." : "Delete"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
