"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useAppSystems } from "@/hooks/useAppSystems"
import { useUpdateAppSystem } from "@/hooks/useMutations"
import type { AppSystem, AppSystemType } from "@/types/database"

type FormState = Partial<AppSystem>

const systemMeta: Record<AppSystemType, { label: string; desc: string; gradient: string; borderGlow: string }> = {
  popup: {
    label: "Popup Notification",
    desc: "Show a popup message in the app",
    gradient: "var(--gradient-cyan)",
    borderGlow: "glow-cyan",
  },
  maintenance: {
    label: "Maintenance Mode",
    desc: "Show maintenance screen to all users",
    gradient: "var(--gradient-orange)",
    borderGlow: "glow-orange",
  },
  social_popup: {
    label: "Social Popup",
    desc: "Show Telegram/social link popup",
    gradient: "var(--gradient-pink)",
    borderGlow: "glow-pink",
  },
  update: {
    label: "Update Notification",
    desc: "Notify users about app updates",
    gradient: "var(--gradient-green)",
    borderGlow: "glow-green",
  },
}

export default function AppsPage() {
  const { user, loading: authLoading } = useAuth()
  const { data: systems, loading, error, refetch } = useAppSystems()
  const [mounted, setMounted] = useState(false)
  const [editingType, setEditingType] = useState<AppSystemType | null>(null)
  const [form, setForm] = useState<FormState>({})

  const updateSys = useUpdateAppSystem()

  useEffect(() => { setMounted(true) }, [])

  const startEdit = (sys: AppSystem) => { setEditingType(sys.type); setForm({ ...sys }) }
  const cancelEdit = () => { setEditingType(null); setForm({}) }

  const handleToggle = async (sys: AppSystem) => {
    try { await updateSys.mutate(sys.type, { enabled: !sys.enabled }); refetch() } catch {}
  }

  const handleSave = async () => {
    if (!editingType) return
    try {
      await updateSys.mutate(editingType, {
        title: form.title, message: form.message, button_text: form.button_text,
        button_action: form.button_action, update_url: form.update_url,
        force_update: form.force_update, closable: form.closable, enabled: form.enabled,
      })
      cancelEdit(); refetch()
    } catch {}
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="card p-6" style={{background:"var(--surface)",height:200}}/>)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  const enabledCount = systems.filter(s => s.enabled).length

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Systems", value: systems.length, color: "var(--gradient-cyan)" },
            { label: "Active", value: enabledCount, color: "var(--gradient-green)" },
            { label: "Inactive", value: systems.length - enabledCount, color: "var(--gradient-orange)" },
            { label: "Types", value: 4, color: "var(--gradient-pink)" },
          ].map((s, i) => (
            <div key={s.label} className="stat-card animate-fade-in" style={{ background: "var(--surface)", animationDelay: `${i*0.1}s` }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              <p className="text-3xl font-bold" style={{
                color: s.color.includes("cyan") ? "var(--accent-cyan)" : s.color.includes("green") ? "var(--accent-green)" : s.color.includes("orange") ? "var(--accent-orange)" : "var(--accent-pink)"
              }}>{s.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="card px-4 py-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)" }}>{error}</div>
        )}

        {/* System Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="card p-6" style={{background:"var(--surface)",height:220}}/>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(["popup", "maintenance", "social_popup", "update"] as AppSystemType[]).map((type) => {
              const sys = systems.find(s => s.type === type)
              const meta = systemMeta[type]
              const isEditing = editingType === type

              return (
                <div key={type}
                  className={`card p-5 animate-fade-in ${meta.borderGlow}`}
                  style={{ background: "var(--surface)", borderTop: `3px solid ${meta.gradient.includes("cyan") ? "var(--accent-cyan)" : meta.gradient.includes("orange") ? "var(--accent-orange)" : meta.gradient.includes("pink") ? "var(--accent-pink)" : "var(--accent-green)"}` }}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{meta.label}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{meta.desc}</p>
                    </div>
                    <button onClick={() => sys && handleToggle(sys)} disabled={updateSys.isLoading}
                      className="toggle" style={{ background: sys?.enabled ? "var(--accent-green)" : "var(--bg-tertiary)" }}>
                      <span className="toggle-knob" style={{ left: sys?.enabled ? "22px" : "2px" }} />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`badge ${sys?.enabled ? "badge-active" : "badge-inactive"} text-[10px]`}>
                      {sys?.enabled ? "● Active" : "○ Inactive"}
                    </span>
                  </div>

                  {/* Preview / Editor */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] block mb-0.5" style={{ color: "var(--text-muted)" }}>Title</label>
                        <input type="text" value={form.title || ""} onChange={e => setForm({...form, title: e.target.value})}
                          className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                      </div>
                      <div>
                        <label className="text-[10px] block mb-0.5" style={{ color: "var(--text-muted)" }}>Message</label>
                        <textarea value={form.message || ""} onChange={e => setForm({...form, message: e.target.value})} rows={2}
                          className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                      </div>
                      {type !== "maintenance" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] block mb-0.5" style={{ color: "var(--text-muted)" }}>Button Text</label>
                            <input type="text" value={form.button_text || ""} onChange={e => setForm({...form, button_text: e.target.value})}
                              className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                          </div>
                          <div>
                            <label className="text-[10px] block mb-0.5" style={{ color: "var(--text-muted)" }}>Action</label>
                            <input type="text" value={form.button_action || ""} onChange={e => setForm({...form, button_action: e.target.value})}
                              className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                          </div>
                        </div>
                      )}
                      {(type === "social_popup" || type === "update") && (
                        <div>
                          <label className="text-[10px] block mb-0.5" style={{ color: "var(--text-muted)" }}>URL</label>
                          <input type="url" value={form.update_url || ""} onChange={e => setForm({...form, update_url: e.target.value})}
                            className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        </div>
                      )}
                      {(type === "maintenance" || type === "update") && (
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                            <input type="checkbox" checked={form.force_update ?? false} onChange={e => setForm({...form, force_update: e.target.checked})}
                              style={{ accentColor: "var(--accent)" }} />
                            Force
                          </label>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                            <input type="checkbox" checked={form.closable ?? false} onChange={e => setForm({...form, closable: e.target.checked})}
                              style={{ accentColor: "var(--accent)" }} />
                            Closable
                          </label>
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button onClick={handleSave} disabled={updateSys.isLoading}
                          className="btn btn-primary text-xs py-1.5 px-3">Save</button>
                        <button onClick={cancelEdit}
                          className="btn btn-secondary text-xs py-1.5 px-3">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      {sys ? (
                        <>
                          <div><span className="font-medium" style={{ color: "var(--text-secondary)" }}>Title:</span> {sys.title || <span className="italic">not set</span>}</div>
                          {sys.message && <div className="truncate"><span className="font-medium" style={{ color: "var(--text-secondary)" }}>Msg:</span> {sys.message}</div>}
                          {sys.button_text && <div><span className="font-medium" style={{ color: "var(--text-secondary)" }}>Btn:</span> {sys.button_text}</div>}
                          <button onClick={() => startEdit(sys)}
                            className="btn btn-secondary text-xs py-1.5 px-3 mt-2 w-full">Edit Details</button>
                        </>
                      ) : (
                        <p className="italic">Not configured</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {updateSys.error && (
          <div className="card px-4 py-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)" }}>
            {updateSys.error}
          </div>
        )}
      </div>
    </>
  )
}
