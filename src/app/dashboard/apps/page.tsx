"use client"

import { useState, useEffect, useCallback } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useSettings } from "@/contexts/SettingsContext"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer, MotionDiv } from "prism-kit"

type ActionType = "maintenance" | "update" | "popup" | "social_popup"

interface AppAction {
  id: string
  type: ActionType
  title: string
  message: string
  created_at: string
  end_time?: string
  button_text?: string
  button_action?: string
  update_url?: string
  force_update?: boolean
  image_url?: string
}

type ActionStatus = "active" | "scheduled" | "expired"

const actionMeta: Record<ActionType, { label: string; color: string; icon: string }> = {
  maintenance: {
    label: "Maintenance",
    color: "var(--accent-orange)",
    icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  },
  update: {
    label: "Update",
    color: "var(--accent-green)",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  popup: {
    label: "Popup",
    color: "var(--accent-cyan)",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
  social_popup: {
    label: "Social Popup",
    color: "var(--accent-pink)",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
}

const statusConfig: Record<ActionStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "var(--accent-green)", bg: "rgba(52,211,153,0.1)" },
  scheduled: { label: "Scheduled", color: "var(--accent-cyan)", bg: "rgba(34,211,238,0.1)" },
  expired: { label: "Expired", color: "var(--accent-orange)", bg: "rgba(251,146,60,0.1)" },
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getStatus(action: AppAction): ActionStatus {
  const now = new Date()
  const created = new Date(action.created_at)
  if (created > now) return "scheduled"
  if (action.end_time) {
    const end = new Date(action.end_time)
    if (end < now) return "expired"
  }
  return "active"
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + "..." : str
}

export default function AppsPage() {
  const { user, loading: authLoading } = useAuth()
  const { settings, saveSetting, loading: settingsLoading, refresh } = useSettings()
  const [mounted, setMounted] = useState(false)
  const [showCreator, setShowCreator] = useState(false)
  const [selectedType, setSelectedType] = useState<ActionType | null>(null)
  const [form, setForm] = useState<Partial<AppAction>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const actions: AppAction[] = (settings.app_actions as AppAction[]) || []

  const resetForm = useCallback(() => {
    setShowCreator(false)
    setSelectedType(null)
    setForm({})
    setEditingId(null)
  }, [])

  const handleSelectType = (type: ActionType) => {
    setSelectedType(type)
    setForm({ title: "", message: "" })
  }

  const handleEdit = (action: AppAction) => {
    setEditingId(action.id)
    setSelectedType(action.type)
    setForm({ ...action })
    setShowCreator(true)
  }

  const handleDelete = async (id: string) => {
    const updated = actions.filter(a => a.id !== id)
    await saveSetting("app_actions", updated)
  }

  const handleSave = async () => {
    if (!selectedType || !form.title?.trim()) return
    setSaving(true)
    try {
      const base = {
        title: form.title.trim(),
        message: form.message?.trim() || "",
        button_text: form.button_text?.trim(),
        button_action: form.button_action?.trim(),
        update_url: form.update_url?.trim(),
        force_update: form.force_update || false,
        image_url: form.image_url?.trim(),
      }
      let updated: AppAction[]
      if (editingId) {
        updated = actions.map(a =>
          a.id === editingId
            ? { ...a, ...base, end_time: selectedType === "maintenance" ? form.end_time || undefined : undefined, type: selectedType }
            : a
        )
      } else {
        const now = new Date().toISOString()
        const action: AppAction = {
          id: generateId(),
          type: selectedType,
          created_at: now,
          ...base,
          ...(selectedType === "maintenance" && form.end_time ? { end_time: form.end_time } : {}),
        }
        updated = [...actions, action]
      }
      await saveSetting("app_actions", updated)
      await refresh()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const stats = {
    total: actions.length,
    active: actions.filter(a => getStatus(a) === "active").length,
    scheduled: actions.filter(a => getStatus(a) === "scheduled").length,
    expired: actions.filter(a => getStatus(a) === "expired").length,
  }

  const canSave = selectedType && form.title?.trim()

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="rounded-2xl" style={{ height: 120, background: "var(--surface)" }} />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="card-premium p-6" style={{ height: 200 }} />)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>App Actions</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Create and manage in-app notifications and actions</p>
          </div>
          {!showCreator && (
            <motion.button
              onClick={() => setShowCreator(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: "var(--accent-gradient)", color: "#fff", boxShadow: "var(--shadow-button)" }}
            >
              + Create New Action
            </motion.button>
          )}
        </div>

        <MotionDiv variants={staggerContainer} initial="hidden" animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Actions", value: stats.total, color: "var(--accent-cyan)" },
            { label: "Active", value: stats.active, color: "var(--accent-green)" },
            { label: "Scheduled", value: stats.scheduled, color: "var(--accent-cyan)" },
            { label: "Expired", value: stats.expired, color: "var(--accent-orange)" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              <p className="text-3xl font-bold tracking-tight" style={{ color: s.color }}>
                {settingsLoading ? "\u2014" : s.value}
              </p>
            </div>
          ))}
        </MotionDiv>

        {showCreator && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {editingId ? "Edit Action" : "Create New Action"}
                </h3>
                <button onClick={resetForm} className="text-xs px-3 py-1 rounded-lg transition-colors hover:opacity-80"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                  Cancel
                </button>
              </div>

              {!selectedType ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.entries(actionMeta) as [ActionType, typeof actionMeta[ActionType]][]).map(([type, meta]) => (
                    <button key={type} onClick={() => handleSelectType(type)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                      style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}20` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${meta.color}15` }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: meta.color }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={meta.icon} />
                        </svg>
                      </div>
                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{meta.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${actionMeta[selectedType].color}15` }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: actionMeta[selectedType].color }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={actionMeta[selectedType].icon} />
                      </svg>
                    </div>
                    <span className="text-sm font-medium" style={{ color: actionMeta[selectedType].color }}>
                      {actionMeta[selectedType].label}
                    </span>
                    <button onClick={() => setSelectedType(null)} className="ml-auto text-[10px] px-2 py-0.5 rounded-full transition-colors hover:opacity-80 cursor-pointer"
                      style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                      Change type
                    </button>
                  </div>

                  <input type="text" placeholder="Title *" value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />

                  <textarea placeholder="Message" value={form.message || ""} onChange={e => setForm({ ...form, message: e.target.value })} rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />

                  {selectedType === "maintenance" && (
                    <div>
                      <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>End Time (optional)</label>
                      <input type="datetime-local" value={form.end_time?.slice(0, 16) || ""}
                        onChange={e => setForm({ ...form, end_time: e.target.value || undefined })}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    </div>
                  )}

                  {selectedType === "update" && (
                    <>
                      <div>
                        <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Update URL</label>
                        <input type="url" placeholder="https://example.com/update.apk" value={form.update_url || ""}
                          onChange={e => setForm({ ...form, update_url: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-muted)" }}>
                        <input type="checkbox" checked={form.force_update ?? false}
                          onChange={e => setForm({ ...form, force_update: e.target.checked })}
                          className="rounded accent-cyan-500" />
                        Force Update
                      </label>
                    </>
                  )}

                  {selectedType === "social_popup" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Button Text</label>
                        <input type="text" placeholder="Join Telegram" value={form.button_text || ""}
                          onChange={e => setForm({ ...form, button_text: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                      </div>
                      <div>
                        <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Social URL</label>
                        <input type="url" placeholder="https://t.me/..." value={form.button_action || ""}
                          onChange={e => setForm({ ...form, button_action: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                      </div>
                    </div>
                  )}

                  {selectedType === "popup" && (
                    <div>
                      <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Image URL (optional)</label>
                      <input type="url" placeholder="https://example.com/image.jpg" value={form.image_url || ""}
                        onChange={e => setForm({ ...form, image_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <motion.button onClick={handleSave} disabled={!canSave || saving}
                      whileHover={{ scale: !canSave || saving ? 1 : 1.02 }}
                      whileTap={{ scale: !canSave || saving ? 1 : 0.98 }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 cursor-pointer"
                      style={{ background: "var(--accent-gradient)", color: "#fff", boxShadow: "var(--shadow-button)" }}>
                      {saving ? "Saving..." : editingId ? "Update Action" : "Create Action"}
                    </motion.button>
                    <button onClick={resetForm}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80 cursor-pointer"
                      style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {settingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="card-premium p-6" style={{ height: 180 }} />)}
          </div>
        ) : actions.length === 0 && !showCreator ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--bg-secondary)" }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-muted)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No actions yet</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Create your first in-app action to get started</p>
            <motion.button onClick={() => setShowCreator(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{ background: "var(--accent-gradient)", color: "#fff", boxShadow: "var(--shadow-button)" }}>
              + Create New Action
            </motion.button>
          </div>
        ) : (
          <MotionDiv variants={staggerContainer} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...actions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((action) => {
              const meta = actionMeta[action.type]
              const status = getStatus(action)
              const statusInfo = statusConfig[status]

              return (
                <MotionDiv key={action.id}
                  variants={fadeInUp}
                  className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${meta.color}, transparent)` }} />
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${meta.color}15` }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: meta.color }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={meta.icon} />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{action.title}</h3>
                          <span className="text-[10px]" style={{ color: meta.color }}>{meta.label}</span>
                        </div>
                      </div>
                    </div>

                    {action.message && (
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {truncate(action.message, 100)}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: statusInfo.bg, color: statusInfo.color }}>
                        {statusInfo.label}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {formatDate(action.created_at)}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleEdit(action)}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80 cursor-pointer"
                        style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(action.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80 cursor-pointer"
                        style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.15)" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </MotionDiv>
              )
            })}
          </MotionDiv>
        )}
      </div>
    </>
  )
}
