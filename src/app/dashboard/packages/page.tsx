"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { usePackages } from "@/hooks/usePackages"
import { useCreatePackage, useUpdatePackage, useDeletePackage } from "@/hooks/useMutations"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Package } from "@/types/database"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"

const MAX_SAME_ORDER = 3

export default function PackagesPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formOrder, setFormOrder] = useState(0)
  const [orderWarning, setOrderWarning] = useState("")

  const { data: packages, count, loading, error, refetch, channelCounts } = usePackages({
    search: search || undefined,
    sortBy: "sort_order", sortOrder: "asc", page, pageSize: 50,
    includeChannelCounts: true,
  })
  const createMut = useCreatePackage()
  const updateMut = useUpdatePackage()
  const deleteMut = useDeletePackage()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setPage(1) }, [search])

  const resetForm = () => {
    setFormName(""); setFormOrder(0); setEditId(null); setShowForm(false); setOrderWarning("")
  }

  const checkOrderWarning = (order: number, excludeId?: string) => {
    const same = packages.filter((p) => p.sort_order === order && p.id !== excludeId)
    if (same.length >= MAX_SAME_ORDER) {
      setOrderWarning(`⚠ ${MAX_SAME_ORDER} packages already have order #${order}. Consider using a different order.`)
    } else {
      setOrderWarning("")
    }
  }

  const handleCreate = async () => {
    try {
      await createMut.mutate({ name: formName, sort_order: formOrder })
      resetForm(); refetch()
    } catch {}
  }

  const handleUpdate = async () => {
    if (!editId) return
    try {
      await updateMut.mutate(editId, { name: formName, sort_order: formOrder })
      resetForm(); refetch()
    } catch {}
  }

  const handleEdit = (pkg: Package) => {
    setEditId(pkg.id); setFormName(pkg.name); setFormOrder(pkg.sort_order); setShowForm(true)
    checkOrderWarning(pkg.sort_order, pkg.id)
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try { await updateMut.mutate(id, { is_active: !current }); refetch() } catch {}
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteMut.mutate(deleteId); setDeleteId(null); refetch() } catch {}
  }

  const openCreateForm = () => {
    resetForm()
    const nextOrder = packages.length > 0 ? Math.max(...packages.map(p => p.sort_order)) + 1 : 1
    setFormOrder(nextOrder)
    setShowForm(true)
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="card-premium" style={{height:100}}/>)}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="card-premium" style={{height:200}}/>)}</div>
        </div>
      </>
    )
  }
  if (!user) return null

  const totalPages = Math.ceil(count / 50)
  const activeCount = packages.filter(p => p.is_active).length
  const totalChannels = channelCounts ? Object.values(channelCounts).reduce((a, b) => a + b, 0) : 0

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Packages</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Manage IPTV subscription packages — channels auto-link to packages</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Packages", value: count, color: "var(--accent-cyan)" },
            { label: "Active", value: activeCount, color: "var(--accent-green)" },
            { label: "Total Channels", value: totalChannels, color: "var(--accent-purple)" },
            { label: "Inactive", value: count - activeCount, color: "var(--accent-orange)" },
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
              <input type="text" placeholder="Search packages..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <Button onClick={openCreateForm}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              New Package
            </Button>
          </div>
        </div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="card-premium p-6" style={{ background: "var(--surface)" }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <span className="w-1 h-5 rounded-full" style={{ background: "var(--gradient-cyan)" }} />
                {editId ? "Edit Package" : "New Package"}
              </h3>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Package Name</label>
                  <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                    className="w-64" placeholder="e.g. Premium Plan" />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Sort Order</label>
                  <input type="number" value={formOrder} onChange={e => {
                    const val = parseInt(e.target.value) || 0
                    setFormOrder(val)
                    checkOrderWarning(val, editId || undefined)
                  }} className="w-24" />
                  {orderWarning && (
                    <p className="text-[10px] mt-1" style={{ color: "var(--accent-orange)" }}>{orderWarning}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={editId ? handleUpdate : handleCreate}
                    disabled={!formName || createMut.isLoading || updateMut.isLoading}>
                    {editId ? "Save Changes" : "Create Package"}
                  </Button>
                  <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                </div>
              </div>
              {(createMut.error || updateMut.error) && (
                <p className="text-xs mt-3" style={{ color: "var(--error)" }}>{createMut.error || updateMut.error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.15)" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="card-premium" style={{height:180, background:"var(--surface)"}}/>)}
          </div>
        ) : packages.length === 0 ? (
          <div className="card-premium p-14 text-center" style={{ background: "var(--surface)" }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
              <svg className="w-7 h-7" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No packages yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Create your first IPTV package</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg, idx) => {
              const chCount = channelCounts?.[pkg.id] || 0
              const orderCount = packages.filter(p => p.sort_order === pkg.sort_order).length
              const isOverMax = orderCount > MAX_SAME_ORDER
              return (
                <motion.div key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="card-premium overflow-hidden transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: "var(--surface)",
                    border: `1px solid ${pkg.is_active ? "rgba(34,211,238,0.15)" : "var(--border)"}`,
                  }}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: pkg.is_active ? "rgba(34,211,238,0.12)" : "var(--bg-tertiary)",
                          }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            style={{ color: pkg.is_active ? "var(--accent)" : "var(--text-muted)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{pkg.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="badge text-[10px] px-1.5 py-0" style={{
                              background: "var(--bg-tertiary)",
                              color: "var(--text-muted)",
                              border: "1px solid var(--border)",
                            }}>
                              #{pkg.sort_order}
                            </span>
                            {isOverMax && (
                              <span className="text-[9px]" style={{ color: "var(--accent-orange)" }}>
                                duplicate order
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Switch checked={pkg.is_active} onCheckedChange={() => handleToggleActive(pkg.id, pkg.is_active)} />
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mb-4 px-3 py-2.5 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" style={{ color: "var(--accent-cyan)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-mono" style={{ color: "var(--accent-cyan)" }}>{chCount}</span>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>channels</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {new Date(pkg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleEdit(pkg)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => setDeleteId(pkg.id)} disabled={deleteMut.isLoading}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}

        {/* Delete Confirmation */}
        <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
          <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Package</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this package? Channels linked to it may lose their package assignment.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary">Cancel</Button>} />
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMut.isLoading}>
                {deleteMut.isLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
