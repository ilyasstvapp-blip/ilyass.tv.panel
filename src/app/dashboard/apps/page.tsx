"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useAppSystems } from "@/hooks/useAppSystems"
import { useUpdateAppSystem } from "@/hooks/useMutations"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import type { AppSystem, AppSystemType } from "@/types/database"
import { motion } from "framer-motion"

type FormState = Partial<AppSystem>

const systemMeta: Record<AppSystemType, { label: string; desc: string; color: string; borderGlow: string; icon: string }> = {
  popup: {
    label: "Popup Notification",
    desc: "Show a popup message in the app",
    color: "var(--accent-cyan)",
    borderGlow: "glow-cyan",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
  maintenance: {
    label: "Maintenance Mode",
    desc: "Show maintenance screen to all users",
    color: "var(--accent-orange)",
    borderGlow: "glow-orange",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
  },
  social_popup: {
    label: "Social Popup",
    desc: "Show Telegram/social link popup",
    color: "var(--accent-pink)",
    borderGlow: "glow-pink",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  update: {
    label: "Update Notification",
    desc: "Notify users about app updates",
    color: "var(--accent-green)",
    borderGlow: "glow-green",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
}

function addDurationToDate(minutes: number) {
  const d = new Date()
  d.setMinutes(d.getMinutes() + minutes)
  return d.toISOString().slice(0, 16)
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
    try {
      await updateSys.mutate(sys.type, { enabled: !sys.enabled })
      refetch()
    } catch {}
  }

  const handleSave = async () => {
    if (!editingType) return
    try {
      const payload: any = {
        title: form.title, message: form.message, button_text: form.button_text,
        button_action: form.button_action, update_url: form.update_url,
        app_version: form.app_version, latest_version: form.latest_version,
        force_update: form.force_update, closable: form.closable, enabled: form.enabled,
      }
      if (editingType === "maintenance") {
        payload.end_time = form.end_time || null
      }
      await updateSys.mutate(editingType, payload)
      cancelEdit(); refetch()
    } catch {}
  }

  const setQuickEndTime = (minutes: number) => {
    setForm({ ...form, end_time: addDurationToDate(minutes) })
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="card-premium p-6" style={{height:260}}/>)}
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>App Systems</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Manage system-wide notifications and popups</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Systems", value: systems.length, color: "var(--accent-cyan)" },
            { label: "Active", value: enabledCount, color: "var(--accent-green)" },
            { label: "Inactive", value: systems.length - enabledCount, color: "var(--accent-orange)" },
            { label: "Types", value: 4, color: "var(--accent-pink)" },
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

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.15)" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="card-premium p-6" style={{height:300}}/>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(["popup", "maintenance", "social_popup", "update"] as AppSystemType[]).map((type, idx) => {
              const sys = systems.find(s => s.type === type)
              const meta = systemMeta[type]
              const isEditing = editingType === type
              const maintenance = type === "maintenance"
              const useEndTime = form.end_time != null && form.end_time !== ""

              return (
                <motion.div key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`card-premium overflow-hidden ${meta.borderGlow}`}
                  style={{ background: "var(--surface)" }}>
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${meta.color}, transparent)` }} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${meta.color}15` }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: meta.color }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={meta.icon} />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{meta.label}</h3>
                          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{meta.desc}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className={`badge ${sys?.enabled ? "badge-active" : "badge-inactive"} text-[10px]`}>
                        {sys?.enabled ? "\u25cf Active" : "\u25cb Inactive"}
                      </span>
                      <Switch checked={sys?.enabled ?? false} onCheckedChange={() => sys && handleToggle(sys)} disabled={updateSys.isLoading} />
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] block mb-0.5 font-medium" style={{ color: "var(--text-muted)" }}>Title</label>
                          <input type="text" value={form.title || ""} onChange={e => setForm({...form, title: e.target.value})}
                            className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        </div>
                        <div>
                          <label className="text-[10px] block mb-0.5 font-medium" style={{ color: "var(--text-muted)" }}>Message</label>
                          <textarea value={form.message || ""} onChange={e => setForm({...form, message: e.target.value})} rows={2}
                            className="w-full px-3 py-1.5 rounded-lg text-xs outline-none resize-none"
                            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        </div>
                        {!maintenance && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] block mb-0.5 font-medium" style={{ color: "var(--text-muted)" }}>Button Text</label>
                              <input type="text" value={form.button_text || ""} onChange={e => setForm({...form, button_text: e.target.value})}
                                className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                            </div>
                            <div>
                              <label className="text-[10px] block mb-0.5 font-medium" style={{ color: "var(--text-muted)" }}>Action</label>
                              <input type="text" value={form.button_action || ""} onChange={e => setForm({...form, button_action: e.target.value})}
                                className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                            </div>
                          </div>
                        )}
                        {(!maintenance) && (
                          <div>
                            <label className="text-[10px] block mb-0.5 font-medium" style={{ color: "var(--text-muted)" }}>URL</label>
                            <input type="url" value={form.update_url || ""} onChange={e => setForm({...form, update_url: e.target.value})}
                              className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                          </div>
                        )}

                        {maintenance && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="useEndTime" checked={useEndTime}
                                onChange={e => setForm({...form, end_time: e.target.checked ? addDurationToDate(1440) : "" })}
                                className="rounded accent-cyan-500" />
                              <label htmlFor="useEndTime" className="text-xs" style={{ color: "var(--text-muted)" }}>Use End Time</label>
                            </div>
                            {useEndTime && (
                              <>
                                <div>
                                  <label className="text-[10px] block mb-0.5 font-medium" style={{ color: "var(--text-muted)" }}>End Time</label>
                                  <input type="datetime-local" value={form.end_time?.slice(0, 16) || ""}
                                    onChange={e => setForm({...form, end_time: e.target.value})}
                                    className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                                </div>
                                <div className="flex gap-1.5 flex-wrap">
                                  {[
                                    { label: "+1d", mins: 1440 },
                                    { label: "+2d", mins: 2880 },
                                    { label: "+6h", mins: 360 },
                                    { label: "+12h", mins: 720 },
                                  ].map(q => (
                                    <button key={q.label} type="button" onClick={() => setQuickEndTime(q.mins)}
                                      className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors hover:opacity-80"
                                      style={{ background: "var(--bg-tertiary)", color: "var(--accent)", border: "1px solid rgba(34,211,238,0.15)" }}>
                                      {q.label}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                            <div className="flex items-center gap-4 pt-1">
                              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                                <input type="checkbox" checked={form.force_update ?? false} onChange={e => setForm({...form, force_update: e.target.checked})}
                                  className="rounded accent-cyan-500" />
                                Force
                              </label>
                              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                                <input type="checkbox" checked={form.closable ?? false} onChange={e => setForm({...form, closable: e.target.checked})}
                                  className="rounded accent-cyan-500" />
                                Closable
                              </label>
                            </div>
                          </div>
                        )}

                        {type === "update" && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] block mb-0.5 font-medium" style={{ color: "var(--text-muted)" }}>App Version</label>
                                <input type="text" value={form.app_version || ""} onChange={e => setForm({...form, app_version: e.target.value})}
                                  className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                              </div>
                              <div>
                                <label className="text-[10px] block mb-0.5 font-medium" style={{ color: "var(--text-muted)" }}>Latest Version</label>
                                <input type="text" value={form.latest_version || ""} onChange={e => setForm({...form, latest_version: e.target.value})}
                                  className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                              </div>
                            </div>
                            <div className="flex items-center gap-4 pt-1">
                              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                                <input type="checkbox" checked={form.force_update ?? false} onChange={e => setForm({...form, force_update: e.target.checked})}
                                  className="rounded accent-cyan-500" />
                                Force
                              </label>
                              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                                <input type="checkbox" checked={form.closable ?? false} onChange={e => setForm({...form, closable: e.target.checked})}
                                  className="rounded accent-cyan-500" />
                                Closable
                              </label>
                            </div>
                          </>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={handleSave} disabled={updateSys.isLoading}>Save</Button>
                          <Button variant="secondary" size="sm" onClick={cancelEdit}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        {sys ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>Title</span>
                              <span className="truncate ml-2">{sys.title || <span className="italic">not set</span>}</span>
                            </div>
                            {sys.message && (
                              <div className="flex justify-between">
                                <span className="text-[10px] font-medium shrink-0" style={{ color: "var(--text-secondary)" }}>Message</span>
                                <span className="truncate ml-2">{sys.message}</span>
                              </div>
                            )}
                            {maintenance && sys.end_time && (
                              <div className="flex justify-between">
                                <span className="text-[10px] font-medium shrink-0" style={{ color: "var(--text-secondary)" }}>Ends</span>
                                <span className="truncate ml-2">{new Date(sys.end_time).toLocaleString()}</span>
                              </div>
                            )}
                            <Button variant="secondary" size="sm" onClick={() => startEdit(sys)} className="w-full mt-3">Edit Details</Button>
                          </>
                        ) : (
                          <>
                            <p className="italic py-2">Not configured</p>
                            <Button size="sm" onClick={() => startEdit({ type } as AppSystem)} className="w-full mt-2">Configure</Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {updateSys.error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.15)" }}>
            {updateSys.error}
          </div>
        )}
      </div>
    </>
  )
}
