"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useAppSystems } from "@/hooks/useAppSystems"
import { useUpdateAppSystem } from "@/hooks/useMutations"
import type { AppSystemType } from "@/types/database"

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { data: systems, loading: systemsLoading, refetch } = useAppSystems()
  const [mounted, setMounted] = useState(false)
  const [editingVersion, setEditingVersion] = useState(false)
  const [versionTitle, setVersionTitle] = useState("")
  const [versionMessage, setVersionMessage] = useState("")
  const [versionUrl, setVersionUrl] = useState("")
  const [versionForce, setVersionForce] = useState(false)

  const updateSys = useUpdateAppSystem()

  useEffect(() => { setMounted(true) }, [])

  const updateSysData = systems.find(s => s.type === "update")

  useEffect(() => {
    if (updateSysData) {
      setVersionTitle(updateSysData.title || "")
      setVersionMessage(updateSysData.message || "")
      setVersionUrl(updateSysData.update_url || "")
      setVersionForce(updateSysData.force_update || false)
    }
  }, [updateSysData])

  const handleSaveVersion = async () => {
    try {
      await updateSys.mutate("update", {
        title: versionTitle, message: versionMessage, update_url: versionUrl,
        force_update: versionForce, enabled: true,
      })
      setEditingVersion(false)
      refetch()
    } catch {}
  }

  const handleToggle = async (type: AppSystemType) => {
    try {
      const sys = systems.find(s => s.type === type)
      await updateSys.mutate(type, { enabled: !sys?.enabled })
      refetch()
    } catch {}
  }

  const getSystem = (type: AppSystemType) => systems.find(s => s.type === type)

  const systemLabels: Record<AppSystemType, { label: string; desc: string }> = {
    maintenance: { label: "Maintenance Mode", desc: "Show maintenance screen to all users" },
    popup: { label: "Popup Notification", desc: "Show popup message in the app" },
    social_popup: { label: "Social Popup", desc: "Show Telegram/social link popup" },
    update: { label: "Update Notification", desc: "Notify users about app updates" },
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          {[1,2].map(i => <div key={i} className="card p-6" style={{background:"var(--surface)",height:200}}/>)}
        </div>
      </>
    )
  }
  if (!user) return null

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>APK version management & system controls</p>
        </div>

        {updateSys.error && (
          <div className="card px-4 py-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)" }}>
            {updateSys.error}
          </div>
        )}

        {/* APK Version Management */}
        <div className="card p-6" style={{ background: "var(--surface)" }}>
          <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <span className="w-1.5 h-5 rounded-full" style={{ background: "var(--gradient-green)" }} />
            APK Version Management
          </h3>
          <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
            Configure the update notification pushed to all Flutter app users
          </p>

          {editingVersion ? (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Version Title</label>
                <input type="text" value={versionTitle} onChange={e => setVersionTitle(e.target.value)}
                  placeholder="e.g. New Update v2.1.0 Available"
                  className="w-full" />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Update Message</label>
                <textarea value={versionMessage} onChange={e => setVersionMessage(e.target.value)} rows={3}
                  placeholder="Describe what's new in this version..."
                  className="w-full" />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Download URL</label>
                <input type="url" value={versionUrl} onChange={e => setVersionUrl(e.target.value)}
                  placeholder="https://example.com/app-v2.1.0.apk"
                  className="w-full" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <input type="checkbox" checked={versionForce} onChange={e => setVersionForce(e.target.checked)}
                  style={{ accentColor: "var(--accent)" }} />
                Force update (users must update to continue)
              </label>
              <div className="flex gap-2">
                <button onClick={handleSaveVersion} disabled={updateSys.isLoading || !versionTitle}
                  className="btn btn-primary">Save Version</button>
                <button onClick={() => setEditingVersion(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Current Title", value: updateSysData?.title || "—" },
                  { label: "Force Update", value: updateSysData?.force_update ? "Yes" : "No" },
                  { label: "Download URL", value: updateSysData?.update_url || "—", truncate: true },
                  { label: "Status", value: updateSysData?.enabled ? "Active" : "Inactive" },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-4" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{item.label}</div>
                    <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setEditingVersion(true)} className="btn btn-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit Version Details
              </button>
            </div>
          )}
        </div>

        {/* System Controls */}
        <div className="card p-6" style={{ background: "var(--surface)" }}>
          <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <span className="w-1.5 h-5 rounded-full" style={{ background: "var(--gradient-cyan)" }} />
            System Controls
          </h3>
          <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
            Toggle app-wide system features
          </p>
          {systemsLoading ? (
            <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-14 rounded" style={{background:"var(--bg-tertiary)"}}/>)}</div>
          ) : (
            <div className="space-y-4 max-w-lg">
              {(["maintenance", "popup", "social_popup", "update"] as AppSystemType[]).map((type) => {
                const sys = getSystem(type)
                const { label, desc } = systemLabels[type]
                return (
                  <div key={type} className="flex items-center justify-between py-3 px-4 rounded-xl"
                    style={{ background: "var(--bg-tertiary)" }}>
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
                        <span className={`w-2 h-2 rounded-full ${sys?.enabled ? "bg-green-400 animate-pulse-glow" : "bg-gray-500"}`} />
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                    </div>
                    <button onClick={() => handleToggle(type)} disabled={updateSys.isLoading}
                      className="toggle" style={{ background: sys?.enabled ? "var(--accent-green)" : "var(--border)" }}>
                      <span className="toggle-knob" style={{ left: sys?.enabled ? "22px" : "2px" }} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* App Info */}
        <div className="card p-6" style={{ background: "var(--surface)" }}>
          <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <span className="w-1.5 h-5 rounded-full" style={{ background: "var(--gradient-purple)" }} />
            App Info
          </h3>
          <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>General application details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "App Name", value: "ILYASS TV" },
              { label: "Platform", value: "Flutter + Next.js" },
              { label: "Database", value: "Supabase (PostgreSQL)" },
              { label: "Deployment", value: "Vercel (planned)" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3 px-4 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>{item.label}</span>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
