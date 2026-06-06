"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useSettings } from "@/contexts/SettingsContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"



interface AppCard {
  id: string
  name: string
  platform: string
  version: string
  image: string
  screenshots: string[]
  description: string
}

const platformOptions = ["Android Mobile", "Android TV", "Emulator"]

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
  const [addForm, setAddForm] = useState({ name: "", platform: "Android Mobile", version: "", image: "", description: "" })
  const [features, setFeatures] = useState<{ id: string; title: string; description: string }[]>([])
  const [footerDesc, setFooterDesc] = useState("")
  const [footerEmail, setFooterEmail] = useState("")
  const [footerTelegram, setFooterTelegram] = useState("")
  const [footerWhatsapp, setFooterWhatsapp] = useState("")
  const [footerWebsite, setFooterWebsite] = useState("")
  const [saving, setSaving] = useState(false)
  const [savingFooter, setSavingFooter] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    settings,
    loading: ctxLoading,
    saveSetting,
  } = useSettings()

  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({})
  const toggleAccordion = (key: string) => setAccordionOpen(prev => ({ ...prev, [key]: !prev[key] }))

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
      if (s.features) setFeatures(s.features as { id: string; title: string; description: string }[])
      if (s.footer) {
        const f = s.footer as Record<string, unknown>
        setFooterDesc((f.description as string) || "")
        setFooterEmail((f.email as string) || "")
        setFooterTelegram(((f.social as Record<string, string>)?.telegram) || "")
        setFooterWhatsapp(((f.social as Record<string, string>)?.whatsapp) || "")
        setFooterWebsite(((f.social as Record<string, string>)?.website) || "")
      }
      setDataLoaded(true)
    }
  }, [ctxLoading, settings])

  const saveHomepage = async () => {
    setSaving(true)
    try {
      await saveSetting("homepage", { title: heroTitle, subtitle: heroSubtitle, banner: heroBanner })
    } catch {} finally { setSaving(false) }
  }

  const saveFooter = async () => {
    setSavingFooter(true)
    try {
      await saveSetting("footer", {
        description: footerDesc,
        email: footerEmail,
        social: { telegram: footerTelegram, whatsapp: footerWhatsapp, website: footerWebsite },
      })
    } catch {} finally { setSavingFooter(false) }
  }

  const scheduleAutoSave = useCallback((apps: AppCard[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveSetting("app_cards", apps)
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

  const addFeature = () => {
    const newFeature = { id: crypto.randomUUID(), title: "", description: "" }
    const next = [...features, newFeature]
    setFeatures(next)
    saveSetting("features", next)
  }

  const updateFeature = (id: string, updates: { title?: string; description?: string }) => {
    const next = features.map(f => f.id === id ? { ...f, ...updates } : f)
    setFeatures(next)
    saveSetting("features", next)
  }

  const removeFeature = (id: string) => {
    const next = features.filter(f => f.id !== id)
    setFeatures(next)
    saveSetting("features", next)
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
    setAddForm({ name: "", platform: "Android Mobile", version: "", image: "", description: "" })
    setShowAddModal(true)
  }

  const confirmAddApp = () => {
    const card: AppCard = {
      id: crypto.randomUUID(),
      name: addForm.name,
      platform: addForm.platform,
      version: addForm.version,
      image: addForm.image,
      screenshots: [],
      description: addForm.description,
    }
    const apps = [...appCards, card]
    setAppCards(apps)
    setEditCardId(card.id)
    setShowAddModal(false)
    scheduleAutoSave(apps)
  }

  const updateCard = (id: string, updates: Partial<AppCard>) => {
    const apps = appCards.map(c => c.id === id ? { ...c, ...updates } : c)
    setAppCards(apps)
    scheduleAutoSave(apps)
  }

  const removeCard = (id: string) => {
    const apps = appCards.filter(c => c.id !== id)
    setAppCards(apps)
    if (editCardId === id) setEditCardId(null)
    scheduleAutoSave(apps)
  }

  const addScreenshot = (id: string) => {
    if (!screenshotInput.trim()) return
    const card = appCards.find(c => c.id === id)
    if (!card) return
    const apps = appCards.map(c => c.id === id ? { ...c, screenshots: [...c.screenshots, screenshotInput.trim()] } : c)
    setAppCards(apps)
    setScreenshotInput("")
    scheduleAutoSave(apps)
  }

  const removeScreenshot = (id: string, idx: number) => {
    const card = appCards.find(c => c.id === id)
    if (!card) return
    const apps = appCards.map(c => c.id === id ? { ...c, screenshots: c.screenshots.filter((_, i) => i !== idx) } : c)
    setAppCards(apps)
    scheduleAutoSave(apps)
  }

  const platformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      "Android Mobile": "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
      "Android TV": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      "Emulator": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
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
                Android Mobile, Android TV, and Emulator apps with versioning, screenshots, and descriptions
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
                            <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Image URL</label>
                            <input type="url" value={card.image} onChange={e => updateCard(card.id, { image: e.target.value })}
                              placeholder="https://example.com/app-icon.png" className="w-full" />
                            {card.image && (
                              <div className="mt-1 rounded-lg overflow-hidden h-16">
                                <img src={card.image} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
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

        {/* ── Footer ── */}
        <div className="accordion-section">
          <button className="accordion-header" onClick={() => toggleAccordion("footer")}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-cyan)" }} />
              Footer Content
            </div>
            <svg className={`accordion-chevron ${accordionOpen["footer"] ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="accordion-body" style={{ maxHeight: accordionOpen["footer"] ? "2000px" : "0" }}>
            <div className="accordion-content">
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Customize the footer on your public website
              </p>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Description</label>
                  <textarea rows={2} value={footerDesc} onChange={e => setFooterDesc(e.target.value)}
                    placeholder="Describe your IPTV service..." className="w-full resize-none" />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Contact Email</label>
                  <input type="email" value={footerEmail} onChange={e => setFooterEmail(e.target.value)}
                    placeholder="contact@example.com" className="w-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Telegram URL</label>
                    <input type="url" value={footerTelegram} onChange={e => setFooterTelegram(e.target.value)}
                      placeholder="https://t.me/..." className="w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>WhatsApp URL</label>
                    <input type="url" value={footerWhatsapp} onChange={e => setFooterWhatsapp(e.target.value)}
                      placeholder="https://wa.me/..." className="w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Website URL</label>
                    <input type="url" value={footerWebsite} onChange={e => setFooterWebsite(e.target.value)}
                      placeholder="https://..." className="w-full" />
                  </div>
                </div>
                <Button onClick={saveFooter} disabled={savingFooter}>{savingFooter ? "Saving..." : "Save Footer"}</Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Features ── */}
        <div className="accordion-section">
          <div role="button" tabIndex={0} className="accordion-header" onClick={() => toggleAccordion("features")} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAccordion("features") } }}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-purple)" }} />
              Features
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); addFeature() }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Feature
              </Button>
              <svg className={`accordion-chevron ${accordionOpen["features"] ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="accordion-body" style={{ maxHeight: accordionOpen["features"] ? "3000px" : "0" }}>
            <div className="accordion-content">
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Manage feature cards displayed on your public website. Each feature has a title and description.
              </p>

              {features.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
                    <svg className="w-6 h-6" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No features configured</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Add features to display on your homepage</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {features.map((f) => (
                    <div key={f.id} className="rounded-xl p-4"
                      style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Title</label>
                          <input type="text" value={f.title} onChange={e => updateFeature(f.id, { title: e.target.value })}
                            placeholder="Feature title" className="w-full" />
                        </div>
                        <div>
                          <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Description</label>
                          <textarea rows={1} value={f.description} onChange={e => updateFeature(f.id, { description: e.target.value })}
                            placeholder="Feature description" className="w-full resize-none" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="destructive" size="xs" onClick={() => removeFeature(f.id)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

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
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Description</label>
                <textarea rows={2} value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})}
                  placeholder="Brief app description..." className="w-full resize-none" />
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Image URL</label>
                <input type="url" value={addForm.image} onChange={e => setAddForm({...addForm, image: e.target.value})}
                  placeholder="https://example.com/app-icon.png" className="w-full" />
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
