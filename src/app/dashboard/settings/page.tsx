"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useSettings } from "@/contexts/SettingsContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

import { TIMEZONE_OPTIONS } from "@/lib/football/timezone"
import { DEFAULT_LEAGUES } from "@/lib/football/api-sports"
import { saveFootballApi, type FootballApi } from "@/lib/services/settings"

interface AppCard {
  id: string
  name: string
  platform: string
  version: string
  apkUrl: string
  apkFile: string | null
  banner: string
  screenshots: string[]
  changelog: string
  description: string
}

interface DownloaderCode {
  id: string
  code: string
  label: string
}

const platformOptions = ["Android Mobile", "Android TV", "Emulator"]
const downloaderPlatforms = ["Downloader App"]

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [heroTitle, setHeroTitle] = useState("")
  const [heroSubtitle, setHeroSubtitle] = useState("")
  const [heroBanner, setHeroBanner] = useState("")
  const [appCards, setAppCards] = useState<AppCard[]>([])
  const [editCardId, setEditCardId] = useState<string | null>(null)
  const [screenshotInput, setScreenshotInput] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: "", platform: "Android Mobile", version: "", apkUrl: "", apkFile: null as string | null, description: "", changelog: "", banner: "" })
  const [downloaderCodes, setDownloaderCodes] = useState<DownloaderCode[]>([])
  const [saving, setSaving] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    settings,
    timezone: ctxTimezone,
    apiSportsKey: ctxApiKey,
    enabledLeagues: ctxLeagues,
    footballApis,
    loading: ctxLoading,
    saveSetting,
    refreshApis,
  } = useSettings()

  // Football API management
  const [showApiModal, setShowApiModal] = useState(false)
  const [editApi, setEditApi] = useState<FootballApi | null>(null)
  const [apiForm, setApiForm] = useState({ api_name: "", api_url: "", api_type: "direct" })
  const [savingApi, setSavingApi] = useState(false)

  // API-Sports integration
  const [apiSportsKey, setApiSportsKey] = useState("")
  const [savingApiKey, setSavingApiKey] = useState(false)
  const [apiKeyFeedback, setApiKeyFeedback] = useState<"success" | "error" | null>(null)
  const [enabledLeagues, setEnabledLeagues] = useState<string[]>(DEFAULT_LEAGUES.map(l => l.name))
  const [savingLeagues, setSavingLeagues] = useState(false)

  // Accordion
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({})
  const toggleAccordion = (key: string) => setAccordionOpen(prev => ({ ...prev, [key]: !prev[key] }))

  // Timezone
  const [selectedTimezone, setSelectedTimezone] = useState("browser")
  const [savingTz, setSavingTz] = useState(false)
  const [tzFeedback, setTzFeedback] = useState<"success" | "error" | null>(null)
  const [apiFeedback, setApiFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Sync settings from global context after it loads
  useEffect(() => {
    if (!ctxLoading) {
      const s = settings
      if (s.homepage) {
        const h = s.homepage as Record<string, string>
        setHeroTitle(h.title || "")
        setHeroSubtitle(h.subtitle || "")
        setHeroBanner(h.banner || "")
      }
      if (s.app_cards) setAppCards(s.app_cards as AppCard[])
      if (s.downloader_codes) setDownloaderCodes(s.downloader_codes as DownloaderCode[])
      else setDownloaderCodes([
        { id: "1", code: "", label: "Main Downloader Code" },
        { id: "2", code: "", label: "Backup Downloader Code" },
      ])
      if (ctxTimezone) setSelectedTimezone(ctxTimezone)
      if (ctxApiKey) setApiSportsKey(ctxApiKey)
      if (ctxLeagues.length > 0) setEnabledLeagues(ctxLeagues)
      setDataLoaded(true)
    }
  }, [ctxLoading, settings, ctxTimezone, ctxApiKey, ctxLeagues])

  const saveHomepage = async () => {
    setSaving(true)
    try {
      await saveSetting("homepage", { title: heroTitle, subtitle: heroSubtitle, banner: heroBanner })
    } catch {} finally { setSaving(false) }
  }

  // Auto-save app cards + downloader codes with debounce
  const scheduleAutoSave = useCallback((apps: AppCard[], codes: DownloaderCode[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveSetting("app_cards", apps)
      saveSetting("downloader_codes", codes)
    }, 1500)
  }, [saveSetting])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    }
  }, [])

  const showFeedback = (type: "success" | "error", msg: string) => {
    setApiFeedback({ type, msg })
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setApiFeedback(null), 3000)
  }

  const saveTimezone = async () => {
    setSavingTz(true)
    setTzFeedback(null)
    const ok = await saveSetting("timezone", selectedTimezone)
    setTzFeedback(ok ? "success" : "error")
    setSavingTz(false)
  }

  // ── API-Sports Integration ──
  const saveApiSportsKey = async () => {
    setSavingApiKey(true)
    setApiKeyFeedback(null)
    const ok = await saveSetting("api_sports_key", apiSportsKey)
    setApiKeyFeedback(ok ? "success" : "error")
    setSavingApiKey(false)
  }

  const saveEnabledLeagues = async (leagues: string[]) => {
    setSavingLeagues(true)
    await saveSetting("enabled_leagues", leagues)
    setSavingLeagues(false)
  }

  const toggleLeague = (name: string) => {
    const next = enabledLeagues.includes(name)
      ? enabledLeagues.filter(l => l !== name)
      : [...enabledLeagues, name]
    setEnabledLeagues(next)
    saveEnabledLeagues(next)
  }

  const openAddApi = () => {
    setEditApi(null)
    setApiForm({ api_name: "", api_url: "", api_type: "direct" })
    setShowApiModal(true)
  }

  const openEditApi = (api: FootballApi) => {
    setEditApi(api)
    setApiForm({ api_name: api.api_name, api_url: api.api_url, api_type: api.api_type })
    setShowApiModal(true)
  }

  const saveApi = async () => {
    if (!apiForm.api_name || !apiForm.api_url) return
    setSavingApi(true)
    try {
      const action = editApi ? "update" : "create"
      await saveFootballApi(action, { id: editApi?.id, ...apiForm })
      setShowApiModal(false)
      showFeedback("success", editApi ? "API updated successfully" : "API created successfully")
      await refreshApis()
    } catch (e) {
      showFeedback("error", e instanceof Error ? e.message : "Failed to save API")
    } finally { setSavingApi(false) }
  }

  const activateApi = async (id: string) => {
    try {
      await saveFootballApi("activate", { id })
      showFeedback("success", "API activated")
      await refreshApis()
    } catch (e) {
      showFeedback("error", e instanceof Error ? e.message : "Failed to activate")
    }
  }

  const deactivateApi = async (id: string) => {
    try {
      await saveFootballApi("deactivate", { id })
      await refreshApis()
    } catch {}
  }

  const deleteApi = async (id: string) => {
    try {
      await saveFootballApi("delete", { id })
      showFeedback("success", "API deleted")
      await refreshApis()
    } catch (e) {
      showFeedback("error", e instanceof Error ? e.message : "Failed to delete")
    }
  }

  if (!mounted || authLoading || !dataLoaded) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          {[1,2,3].map(i => <div key={i} className="card-premium p-6" style={{height:300}}/>)}
        </div>
      </>
    )
  }
  if (!user) return null

  const openAddModal = () => {
    setAddForm({ name: "", platform: "Android Mobile", version: "", apkUrl: "", apkFile: null, description: "", changelog: "", banner: "" })
    setShowAddModal(true)
  }

  const confirmAddApp = () => {
    const card: AppCard = {
      id: crypto.randomUUID(),
      name: addForm.name,
      platform: addForm.platform,
      version: addForm.version,
      apkUrl: addForm.apkUrl,
      apkFile: addForm.apkFile,
      banner: addForm.banner,
      screenshots: [],
      changelog: addForm.changelog,
      description: addForm.description,
    }
    const apps = [...appCards, card]
    setAppCards(apps)
    setEditCardId(card.id)
    setShowAddModal(false)
    scheduleAutoSave(apps, downloaderCodes)
  }

  const updateCard = (id: string, updates: Partial<AppCard>) => {
    const apps = appCards.map(c => c.id === id ? { ...c, ...updates } : c)
    setAppCards(apps)
    scheduleAutoSave(apps, downloaderCodes)
  }

  const removeCard = (id: string) => {
    const apps = appCards.filter(c => c.id !== id)
    setAppCards(apps)
    if (editCardId === id) setEditCardId(null)
    scheduleAutoSave(apps, downloaderCodes)
  }

  const addScreenshot = (id: string) => {
    if (!screenshotInput.trim()) return
    const card = appCards.find(c => c.id === id)
    if (!card) return
    const apps = appCards.map(c => c.id === id ? { ...c, screenshots: [...c.screenshots, screenshotInput.trim()] } : c)
    setAppCards(apps)
    setScreenshotInput("")
    scheduleAutoSave(apps, downloaderCodes)
  }

  const removeScreenshot = (id: string, idx: number) => {
    const card = appCards.find(c => c.id === id)
    if (!card) return
    const apps = appCards.map(c => c.id === id ? { ...c, screenshots: c.screenshots.filter((_, i) => i !== idx) } : c)
    setAppCards(apps)
    scheduleAutoSave(apps, downloaderCodes)
  }

  const updateDownloaderCode = (id: string, updates: Partial<DownloaderCode>) => {
    const codes = downloaderCodes.map(c => c.id === id ? { ...c, ...updates } : c)
    setDownloaderCodes(codes)
    scheduleAutoSave(appCards, codes)
  }

  const addDownloaderCode = () => {
    const codes = [...downloaderCodes, { id: crypto.randomUUID(), code: "", label: `Code ${downloaderCodes.length + 1}` }]
    setDownloaderCodes(codes)
    scheduleAutoSave(appCards, codes)
  }

  const removeDownloaderCode = (id: string) => {
    const codes = downloaderCodes.filter(c => c.id !== id)
    setDownloaderCodes(codes)
    scheduleAutoSave(appCards, codes)
  }

  const platformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      "Android Mobile": "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
      "Android TV": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      "Emulator": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      "Downloader App": "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    }
    return icons[platform] || icons["Android Mobile"]
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Manage your public homepage and app download page</p>
        </div>

        {/* Feedback toast */}
        {apiFeedback && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="px-5 py-3 rounded-xl text-sm flex items-center gap-2"
            style={{
              background: apiFeedback.type === "success" ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
              border: `1px solid ${apiFeedback.type === "success" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)"}`,
              color: apiFeedback.type === "success" ? "var(--accent-green)" : "var(--error)",
            }}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {apiFeedback.type === "success"
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
            </svg>
            {apiFeedback.msg}
          </motion.div>
        )}

        {/* Public Homepage */}
        <div className="accordion-section">
          <button className="accordion-header" onClick={() => toggleAccordion("homepage")}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-cyan)" }} />
              Public Homepage
            </div>
            <svg className={`accordion-chevron ${accordionOpen["homepage"] ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="accordion-body" style={{ maxHeight: accordionOpen["homepage"] ? "2000px" : "0" }}>
            <div className="accordion-content">
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Control hero section content displayed on your public website
              </p>
              <div className="space-y-4 max-w-lg">
            <div>
              <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Hero Title</label>
              <input type="text" value={heroTitle} onChange={e => setHeroTitle(e.target.value)}
                placeholder="e.g. Watch TV Anywhere" className="w-full" />
            </div>
            <div>
              <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Hero Subtitle</label>
              <textarea rows={2} value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)}
                placeholder="Describe your IPTV service..." className="w-full resize-none" />
            </div>
            <div>
              <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Hero Banner / Background URL</label>
              <input type="url" value={heroBanner} onChange={e => setHeroBanner(e.target.value)}
                placeholder="https://example.com/banner.jpg" className="w-full" />
              {heroBanner && (
                <div className="mt-2 rounded-xl overflow-hidden h-32">
                  <img src={heroBanner} alt="Banner preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
            <Button onClick={saveHomepage} disabled={saving}>{saving ? "Saving..." : "Save Homepage"}</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Platform App Cards */}
        <div className="accordion-section">
          <div role="button" tabIndex={0} className="accordion-header" onClick={() => toggleAccordion("apps")} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAccordion("apps") } }}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-green)" }} />
              Platform Apps
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); openAddModal() }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                Add Application
              </Button>
              <svg className={`accordion-chevron ${accordionOpen["apps"] ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="accordion-body" style={{ maxHeight: accordionOpen["apps"] ? "6000px" : "0" }}>
            <div className="accordion-content">
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Android Mobile, Android TV, and Emulator apps with APK upload, versioning, changelogs, and screenshots
              </p>

          {appCards.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
                <svg className="w-7 h-7" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No platform apps yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Click "Add Application" to create your first app card</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appCards.map(card => (
                <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--bg-tertiary)" }}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${"var(--accent)"}12` }}>
                          <svg className="w-5 h-5" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={platformIcon(card.platform)} />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {card.name || <span className="italic opacity-50">App name not set</span>}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="badge badge-premium text-[10px]">{card.platform}</span>
                            {card.version && <span className="badge badge-active text-[10px]">v{card.version}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button variant="secondary" size="xs" onClick={() => setEditCardId(editCardId === card.id ? null : card.id)}>
                          {editCardId === card.id ? "Collapse" : "Edit"}
                        </Button>
                        <Button variant="destructive" size="xs" onClick={() => removeCard(card.id)}>Remove</Button>
                      </div>
                    </div>

                    {editCardId === card.id && (
                      <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>App Name</label>
                            <input type="text" value={card.name} onChange={e => updateCard(card.id, { name: e.target.value })}
                              placeholder="e.g. ILYASS TV Mobile" className="w-full" />
                          </div>
                          <div>
                            <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Platform</label>
                            <select value={card.platform} onChange={e => updateCard(card.id, { platform: e.target.value })}
                              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                              {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Version</label>
                            <input type="text" value={card.version} onChange={e => updateCard(card.id, { version: e.target.value })}
                              placeholder="e.g. 2.1.0" className="w-full" />
                          </div>
                          <div>
                            <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>APK File Upload</label>
                            <div className="flex items-center gap-2">
                              <input type="file" accept=".apk" className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium"
                                style={{ color: "var(--text-muted)" }}
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  if (file) updateCard(card.id, { apkFile: file.name, apkUrl: "" })
                                }} />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>APK URL (external)</label>
                            <input type="url" value={card.apkUrl} onChange={e => updateCard(card.id, { apkUrl: e.target.value })}
                              placeholder="https://example.com/app.apk" className="w-full" />
                          </div>
                          <div>
                            <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Banner / Image URL</label>
                            <input type="url" value={card.banner} onChange={e => updateCard(card.id, { banner: e.target.value })}
                              placeholder="https://example.com/banner.png" className="w-full" />
                            {card.banner && (
                              <div className="mt-1 rounded-lg overflow-hidden h-16">
                                <img src={card.banner} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Description</label>
                          <textarea rows={2} value={card.description} onChange={e => updateCard(card.id, { description: e.target.value })}
                            placeholder="Brief description of this platform app..." className="w-full resize-none" />
                        </div>
                        <div>
                          <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Changelog</label>
                          <textarea rows={2} value={card.changelog} onChange={e => updateCard(card.id, { changelog: e.target.value })}
                            placeholder="What's new in this version..." className="w-full resize-none" />
                        </div>
                        <div>
                          <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Screenshots</label>
                          <div className="flex gap-2 mb-2">
                            <input type="text" value={screenshotInput} onChange={e => setScreenshotInput(e.target.value)}
                              placeholder="https://example.com/screenshot.png" className="flex-1" />
                            <Button variant="secondary" size="sm" onClick={() => addScreenshot(card.id)} disabled={!screenshotInput.trim()}>Add</Button>
                          </div>
                          {card.screenshots.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {card.screenshots.map((ss, si) => (
                                <div key={si} className="relative group rounded-lg overflow-hidden h-16 w-24"
                                  style={{ border: "1px solid var(--border)" }}>
                                  <img src={ss} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                                  <button onClick={() => removeScreenshot(card.id, si)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white">x</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={() => setEditCardId(null)}>Done</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>

        {/* Downloader Codes — separate section, no APK uploads */}
        <div className="accordion-section">
          <div role="button" tabIndex={0} className="accordion-header" onClick={() => toggleAccordion("downloader")} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAccordion("downloader") } }}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-orange)" }} />
              Downloader Codes
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); addDownloaderCode() }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                Add Code
              </Button>
              <svg className={`accordion-chevron ${accordionOpen["downloader"] ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="accordion-body" style={{ maxHeight: accordionOpen["downloader"] ? "2000px" : "0" }}>
            <div className="accordion-content">
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Downloader codes allow users to download your app directly. Codes only — no APK uploads.
              </p>

          {downloaderCodes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No downloader codes yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {downloaderCodes.map(code => (
                <motion.div key={code.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(251,191,36,0.1)" }}>
                    <svg className="w-5 h-5" style={{ color: "var(--accent-orange)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <input type="text" value={code.label} onChange={e => updateDownloaderCode(code.id, { label: e.target.value })}
                      placeholder="Code label" className="text-xs font-medium w-full mb-1 bg-transparent outline-none"
                      style={{ color: "var(--text-primary)" }} />
                    <input type="text" value={code.code} onChange={e => updateDownloaderCode(code.id, { code: e.target.value })}
                      placeholder="e.g. 123456" className="w-full text-xs bg-transparent outline-none font-mono"
                      style={{ color: "var(--accent-orange)" }} />
                  </div>
                  <button onClick={() => removeDownloaderCode(code.id)}
                    className="text-xs font-medium transition-colors shrink-0"
                    style={{ color: "var(--text-muted)" }}>Remove</button>
                </motion.div>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>

        {/* ── Timezone Settings ── */}
        <div className="accordion-section">
          <button className="accordion-header" onClick={() => toggleAccordion("timezone")}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-cyan)" }} />
              Timezone Settings
            </div>
            <svg className={`accordion-chevron ${accordionOpen["timezone"] ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="accordion-body" style={{ maxHeight: accordionOpen["timezone"] ? "2000px" : "0" }}>
            <div className="accordion-content">
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Choose a global timezone for displaying match times across the dashboard
          </p>
          <div className="flex items-end gap-4 max-w-md">
            <div className="flex-1">
              <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Display Timezone</label>
              <select value={selectedTimezone} onChange={e => setSelectedTimezone(e.target.value)}
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {TIMEZONE_OPTIONS.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={saveTimezone} disabled={savingTz}>{savingTz ? "Saving..." : "Save Timezone"}</Button>
              {tzFeedback === "success" && (
                <span className="text-xs font-medium animate-fade-in" style={{ color: "var(--accent-green)" }}>{"\u2713"} Saved</span>
              )}
              {tzFeedback === "error" && (
                <span className="text-xs font-medium animate-fade-in" style={{ color: "var(--error)" }}>Failed to save</span>
              )}
            </div>
            </div>
          </div>
        </div>
        </div>

        {/* ── API-Sports Integration ── */}
        <div className="accordion-section">
          <button className="accordion-header" onClick={() => toggleAccordion("apisports")}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-cyan)" }} />
              API-Sports Integration
            </div>
            <svg className={`accordion-chevron ${accordionOpen["apisports"] ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="accordion-body" style={{ maxHeight: accordionOpen["apisports"] ? "3000px" : "0" }}>
            <div className="accordion-content">
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Connect your API-Football account from API-Sports. Get your key at https://api-sports.io
              </p>

          <div className="max-w-md space-y-5">
            {/* API Key */}
            <div>
              <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>API-Sports API Key</label>
              <div className="flex gap-2">
                <input type="password" value={apiSportsKey} onChange={e => setApiSportsKey(e.target.value)}
                  placeholder="x-apisports-key" className="flex-1 font-mono text-xs" />
                <Button onClick={saveApiSportsKey} disabled={savingApiKey || !apiSportsKey}>
                  {savingApiKey ? "Saving..." : "Save Key"}
                </Button>
              </div>
              {apiKeyFeedback === "success" && (
                <span className="text-xs font-medium mt-1 block animate-fade-in" style={{ color: "var(--accent-green)" }}>
                  {"\u2713"} Key saved
                </span>
              )}
              {apiKeyFeedback === "error" && (
                <span className="text-xs font-medium mt-1 block animate-fade-in" style={{ color: "var(--error)" }}>
                  Failed to save key
                </span>
              )}
            </div>

            {/* Enabled Leagues */}
            <div>
              <label className="text-xs block mb-2 font-medium" style={{ color: "var(--text-muted)" }}>Enabled Leagues</label>
              <p className="text-[10px] mb-3" style={{ color: "var(--text-muted)" }}>
                Select which leagues to fetch matches from
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_LEAGUES.map((league) => {
                  const isEnabled = enabledLeagues.includes(league.name)
                  return (
                    <button key={league.id} onClick={() => toggleLeague(league.name)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 text-left"
                      style={{
                        background: isEnabled ? "rgba(34,211,238,0.08)" : "var(--bg-tertiary)",
                        border: `1px solid ${isEnabled ? "rgba(34,211,238,0.2)" : "var(--border)"}`,
                        color: isEnabled ? "var(--accent-light)" : "var(--text-muted)",
                      }}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${isEnabled ? "shadow-sm" : ""}`}
                        style={{
                          background: isEnabled ? "var(--accent)" : "transparent",
                          border: `1px solid ${isEnabled ? "var(--accent)" : "var(--border)"}`,
                        }}>
                        {isEnabled && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="truncate">{league.name}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              {savingLeagues && (
                <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Saving...</p>
              )}
            </div>
            </div>
          </div>
        </div>
        </div>

        {/* ── Football API Management ── */}
        <div className="accordion-section">
          <div role="button" tabIndex={0} className="accordion-header" onClick={() => toggleAccordion("football")} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAccordion("football") } }}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-purple)" }} />
              Football APIs
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); openAddApi() }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add API
              </Button>
              <svg className={`accordion-chevron ${accordionOpen["football"] ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="accordion-body" style={{ maxHeight: accordionOpen["football"] ? "3000px" : "0" }}>
            <div className="accordion-content">
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Manage football data source APIs. Activate one at a time for match importing.
              </p>

          {footballApis.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
                <svg className="w-6 h-6" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No football APIs configured</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Add your first API source to start importing matches. Default: yallashoottt.online</p>
            </div>
          ) : (
            <div className="space-y-3">
              {footballApis.map(api => {
                const isActive = api.active
                const lastUsed = api.updated_at ? new Date(api.updated_at).toLocaleDateString() : "Never"
                return (
                  <motion.div key={api.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-4 flex items-center gap-4"
                    style={{ background: "var(--bg-tertiary)", border: `1px solid ${isActive ? "rgba(34,211,238,0.2)" : "var(--border)"}` }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "shadow-lg" : ""}`}
                      style={{ background: isActive ? "rgba(34,211,238,0.12)" : "var(--bg-secondary)" }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{api.api_name}</span>
                        {isActive && (
                          <span className="badge text-[9px] px-1.5 py-0" style={{ background: "rgba(34,211,238,0.12)", color: "var(--accent)", border: "1px solid rgba(34,211,238,0.2)" }}>ACTIVE</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-[10px] truncate max-w-[200px] inline-block" style={{ color: "var(--text-muted)" }}>{api.api_url}</code>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>| {api.api_type}</span>
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Last used: {lastUsed}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {isActive ? (
                        <Button variant="secondary" size="xs" onClick={() => deactivateApi(api.id)}>Deactivate</Button>
                      ) : (
                        <Button variant="secondary" size="xs" onClick={() => activateApi(api.id)}>Activate</Button>
                      )}
                      <Button variant="secondary" size="xs" onClick={() => openEditApi(api)}>Edit</Button>
                      <Button variant="destructive" size="xs" onClick={() => deleteApi(api.id)}>Delete</Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
            </div>
          </div>
        </div>

        {/* Add/Edit API Modal */}
        <Dialog open={showApiModal} onOpenChange={(open) => { if (!open) setShowApiModal(false) }}>
          <DialogContent showCloseButton={false} className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editApi ? "Edit API" : "Add Football API"}</DialogTitle>
              <DialogDescription>
                {editApi ? "Update the API configuration" : "Configure a new football data source API"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>API Name</label>
                <input type="text" value={apiForm.api_name} onChange={e => setApiForm({...apiForm, api_name: e.target.value})}
                  placeholder="e.g. Yalla Shoot" className="w-full" />
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>API URL</label>
                <input type="url" value={apiForm.api_url} onChange={e => setApiForm({...apiForm, api_url: e.target.value})}
                  placeholder="https://example.com/api?date={date}&league={league}" className="w-full" />
                <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                  Use <code>{`{date}`}</code> and <code>{`{league}`}</code> as placeholders for dynamic values
                </p>
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>API Type</label>
                <select value={apiForm.api_type} onChange={e => setApiForm({...apiForm, api_type: e.target.value})}
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="direct">Direct JSON API</option>
                  <option value="proxy">Proxy (via our server)</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary">Cancel</Button>} />
              <Button onClick={saveApi} disabled={!apiForm.api_name || !apiForm.api_url || savingApi}>
                {savingApi ? "Saving..." : editApi ? "Update API" : "Add API"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Application Modal */}
        <Dialog open={showAddModal} onOpenChange={(open) => { if (!open) setShowAddModal(false) }}>
          <DialogContent showCloseButton={false} className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Application</DialogTitle>
              <DialogDescription>Configure your app before adding it to the download page</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Platform Type</label>
                <select value={addForm.platform} onChange={e => setAddForm({...addForm, platform: e.target.value})}
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>App Name</label>
                  <input type="text" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})}
                    placeholder="e.g. ILYASS TV" className="w-full" />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Version</label>
                  <input type="text" value={addForm.version} onChange={e => setAddForm({...addForm, version: e.target.value})}
                    placeholder="e.g. 2.1.0" className="w-full" />
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Upload Type</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-muted)" }}>APK File</label>
                    <input type="file" accept=".apk" className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium"
                      style={{ color: "var(--text-muted)" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) setAddForm({...addForm, apkFile: f.name, apkUrl: "" }) }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-muted)" }}>APK URL</label>
                    <input type="url" value={addForm.apkUrl} onChange={e => setAddForm({...addForm, apkUrl: e.target.value, apkFile: null})}
                      placeholder="https://..." className="w-full" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Description</label>
                <textarea rows={2} value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})}
                  placeholder="Brief app description..." className="w-full resize-none" />
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Changelog</label>
                <textarea rows={2} value={addForm.changelog} onChange={e => setAddForm({...addForm, changelog: e.target.value})}
                  placeholder="What's new..." className="w-full resize-none" />
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Banner / Image URL</label>
                <input type="url" value={addForm.banner} onChange={e => setAddForm({...addForm, banner: e.target.value})}
                  placeholder="https://example.com/banner.png" className="w-full" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary">Cancel</Button>} />
              <Button onClick={confirmAddApp} disabled={!addForm.name || !addForm.platform}>
                Create Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* App Info */}
        <div className="accordion-section">
          <button className="accordion-header" onClick={() => toggleAccordion("appinfo")}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-purple)" }} />
              App Info
            </div>
            <svg className={`accordion-chevron ${accordionOpen["appinfo"] ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="accordion-body" style={{ maxHeight: accordionOpen["appinfo"] ? "2000px" : "0" }}>
            <div className="accordion-content">
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>General application details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "App Name", value: "ILYASS TV" },
              { label: "Platform", value: "Flutter + Next.js" },
              { label: "Database", value: "Supabase (PostgreSQL)" },
              { label: "Deployment", value: "Vercel (planned)" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>{item.label}</span>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.value}</span>
              </div>
            ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
