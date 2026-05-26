"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { usePackages } from "@/hooks/usePackages"
import { useCreatePackage, useUpdatePackage, useDeletePackage } from "@/hooks/useMutations"
import type { Package } from "@/types/database"

export default function PackagesPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formOrder, setFormOrder] = useState(0)

  const { data: packages, count, loading, error, refetch } = usePackages({
    search: search || undefined,
    sortBy: "sort_order", sortOrder: "asc", page, pageSize: 10,
  })
  const createMut = useCreatePackage()
  const updateMut = useUpdatePackage()
  const deleteMut = useDeletePackage()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setPage(1) }, [search])

  const resetForm = () => { setFormName(""); setFormOrder(0); setEditId(null); setShowCreate(false) }

  const handleCreate = async () => {
    try { await createMut.mutate({ name: formName, sort_order: formOrder }); resetForm(); refetch() } catch {}
  }

  const handleUpdate = async () => {
    if (!editId) return
    try { await updateMut.mutate(editId, { name: formName, sort_order: formOrder }); resetForm(); refetch() } catch {}
  }

  const handleEdit = (pkg: Package) => {
    setEditId(pkg.id); setFormName(pkg.name); setFormOrder(pkg.sort_order); setShowCreate(true)
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try { await updateMut.mutate(id, { is_active: !current }); refetch() } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package?")) return
    try { await deleteMut.mutate(id); refetch() } catch {}
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="stat-card" style={{background:"var(--surface)",height:100}}/>)}</div>
          <div className="card p-6" style={{ background: "var(--surface)" }}>
            {[1,2,3,4].map(i => <div key={i} className="h-12 rounded mb-3" style={{background:"var(--bg-tertiary)"}}/>)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  const totalPages = Math.ceil(count / 10)
  const activeCount = packages.filter(p => p.is_active).length

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Total Packages", value: count, color: "var(--gradient-cyan)" },
            { label: "Active", value: activeCount, color: "var(--gradient-green)" },
            { label: "Inactive", value: count - activeCount, color: "var(--gradient-orange)" },
          ].map((s, i) => (
            <div key={s.label} className="stat-card animate-fade-in" style={{ background: "var(--surface)", animationDelay: `${i*0.1}s` }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              <p className="text-3xl font-bold" style={{ color: s.color.includes("cyan") ? "var(--accent-cyan)" : s.color.includes("green") ? "var(--accent-green)" : "var(--accent-orange)" }}>
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
              <input type="text" placeholder="Search packages..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
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
              <span className="w-1.5 h-5 rounded-full" style={{ background: "var(--gradient-cyan)" }} />
              {editId ? "Edit Package" : "New Package"}
            </h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Package Name</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                  className="w-64" placeholder="e.g. Premium Plan" />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Sort Order</label>
                <input type="number" value={formOrder} onChange={e => setFormOrder(parseInt(e.target.value) || 0)}
                  className="w-24" />
              </div>
              <div className="flex gap-2">
                <button onClick={editId ? handleUpdate : handleCreate}
                  disabled={!formName || createMut.isLoading || updateMut.isLoading} className="btn btn-primary">
                  {editId ? "Save Changes" : "Create Package"}
                </button>
                <button onClick={resetForm} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
            {(createMut.error || updateMut.error) && (
              <p className="text-xs mt-3" style={{ color: "var(--error)" }}>{createMut.error || updateMut.error}</p>
            )}
          </div>
        )}

        {error && (
          <div className="card px-4 py-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)" }}>
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="card p-6 animate-pulse" style={{ background: "var(--surface)" }}>
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded mb-3" style={{background:"var(--bg-tertiary)"}}/>)}
          </div>
        ) : packages.length === 0 ? (
          <div className="card p-12 text-center" style={{ background: "var(--surface)" }}>
            <p style={{ color: "var(--text-muted)" }}>No packages found</p>
          </div>
        ) : (
          <div className="card overflow-hidden" style={{ background: "var(--surface)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="table-header">
                  <th>Name</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr></thead>
                <tbody>
                  {packages.map(pkg => (
                    <tr key={pkg.id} className="table-row">
                      <td><span className="font-medium" style={{ color: "var(--text-primary)" }}>{pkg.name}</span></td>
                      <td><span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>#{pkg.sort_order}</span></td>
                      <td>
                        <button onClick={() => handleToggleActive(pkg.id, pkg.is_active)}
                          className="toggle" style={{ background: pkg.is_active ? "var(--accent-green)" : "var(--bg-tertiary)" }}>
                          <span className="toggle-knob" style={{ left: pkg.is_active ? "22px" : "2px" }} />
                        </button>
                      </td>
                      <td className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(pkg.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(pkg)} className="btn btn-secondary text-xs py-1 px-3">Edit</button>
                          <button onClick={() => handleDelete(pkg.id)} disabled={deleteMut.isLoading}
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
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="btn btn-secondary">Previous</button>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
              className="btn btn-secondary">Next</button>
          </div>
        )}
      </div>
    </>
  )
}
