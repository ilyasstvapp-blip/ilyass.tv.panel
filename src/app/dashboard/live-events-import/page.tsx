"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useEvents } from "@/hooks/useEvents"
import { useAllChannels } from "@/hooks/useChannels"
import { useCreateEvent } from "@/hooks/useMutations"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { Channel, LiveEvent } from "@/types/database"

interface YSMatch {
  match_id: number
  league: string
  home_team: string
  home_logo: string
  away_team: string
  away_logo: string
  match_date: string
  match_time: string
  match_timestamp: number
  live: number
  status: number
  home_scores: number
  away_scores: number
}

interface YSMatchDetail {
  match_id: number
  league: string
  home_team: string
  away_team: string
  home_logo: string
  away_logo: string
  match_date: string
  match_time: string
  stadium: string
  referee: string
  round: string
  channel_name: string
  commentator: string
  channels: { channel_name: string; commentator_name: string }[]
}

const IMAGE_BASE = "https://api-ar.ysscores.com"

function getTeamInitials(name: string) {
  const cleaned = name.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "").trim()
  if (!cleaned) return "??"
  const parts = cleaned.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return cleaned.slice(0, 2).toUpperCase()
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function formatTime(time: string) {
  if (!time) return ""
  return time.slice(0, 5)
}

export default function LiveEventsImportPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [matches, setMatches] = useState<YSMatch[]>([])
  const [importedIds, setImportedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importingId, setImportingId] = useState<number | null>(null)
  const [manualModal, setManualModal] = useState<{
    match: YSMatch
    detail: YSMatchDetail
    channelSearch: string
    channelResults: Channel[]
    selectedChannel: Channel | null
    packageChannels: { id: string; name: string; package_name: string }[]
  } | null>(null)
  const [showImported, setShowImported] = useState(false)

  const { data: existingEvents } = useEvents({ pageSize: 500 })
  const { data: allChannels } = useAllChannels()
  const createMut = useCreateEvent()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const findChannel = useCallback((channelName: string): { channel: Channel | null; score: number } => {
    if (!channelName || !allChannels.length) return { channel: null, score: 0 }
    const normalized = normalizeName(channelName)
    let bestMatch: { channel: Channel | null; score: number } = { channel: null, score: 0 }
    for (const ch of allChannels) {
      const chName = normalizeName(ch.name)
      const chKey = normalizeName(ch.channel_key)
      if (chName === normalized || chKey === normalized) return { channel: ch, score: 100 }
      if (chName.includes(normalized) || normalized.includes(chName)) {
        const score = Math.max(chName.length, normalized.length) / Math.min(chName.length, normalized.length) * 10
        if (score > bestMatch.score) bestMatch = { channel: ch, score }
      }
      const chNameWords = chName.split(" ")
      const normalizedWords = normalized.split(" ")
      const commonWords = chNameWords.filter(w => normalizedWords.includes(w)).length
      if (commonWords > 0 && commonWords / Math.max(chNameWords.length, normalizedWords.length) > 0.3) {
        const score = commonWords * 20
        if (score > bestMatch.score) bestMatch = { channel: ch, score }
      }
    }
    return bestMatch
  }, [allChannels])

  const isDuplicate = useCallback((match: YSMatch) => {
    if (importedIds.has(match.match_id)) return true
    return (existingEvents ?? []).some(ev => {
      const evDate = ev.match_time?.slice(0, 10)
      const evTime = ev.match_time?.slice(11, 16)
      const matchDate = match.match_date
      const matchTime = match.match_time?.slice(0, 5)
      return evDate === matchDate && evTime === matchTime && normalizeName(ev.team1_name) === normalizeName(match.home_team) && normalizeName(ev.team2_name) === normalizeName(match.away_team)
    })
  }, [existingEvents, importedIds])

  const fetchMatches = async () => {
    if (!selectedDate) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ysscores?date=${selectedDate}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch")
      setMatches(data.matches || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load matches")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) fetchMatches()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, mounted])

  const handleImport = async (match: YSMatch) => {
    setImportingId(match.match_id)
    try {
      const detailRes = await fetch(`/api/ysscores?matchId=${match.match_id}`)
      const detailData = await detailRes.json()
      if (!detailRes.ok) throw new Error(detailData.error || "Failed to fetch match info")
      const detail: YSMatchDetail = detailData.match

      const channelName = detail.channel_name || ""
      const { channel: matchedChannel, score } = findChannel(channelName)

      if (matchedChannel && score >= 50) {
        const matchTime = `${detail.match_date}T${detail.match_time}`
        await createMut.mutate({
          team1_name: detail.home_team,
          team2_name: detail.away_team,
          team1_logo: detail.home_logo ? `${IMAGE_BASE}/images/${detail.home_logo}` : null,
          team2_logo: detail.away_logo ? `${IMAGE_BASE}/images/${detail.away_logo}` : null,
          match_time: new Date(matchTime).toISOString(),
          league: detail.league,
          commentator: detail.commentator || "",
          channel_key: matchedChannel.channel_key,
          channel_name: matchedChannel.name,
          sort_order: 0,
        })
        setImportedIds(prev => new Set(prev).add(match.match_id))
      } else {
        const pkgChannels = allChannels
          .filter(ch => ch.is_active)
          .map(ch => ({ id: ch.id, name: ch.name, package_name: ch.channel_key }))
        setManualModal({
          match,
          detail,
          channelSearch: channelName,
          channelResults: matchedChannel && score > 0 ? [matchedChannel] : [],
          selectedChannel: matchedChannel || null,
          packageChannels: pkgChannels,
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed")
    } finally {
      setImportingId(null)
    }
  }

  const handleManualImport = async () => {
    const modal = manualModal
    if (!modal || !modal.selectedChannel) return
    const ch = modal.selectedChannel
    const matchTime = `${modal.detail.match_date}T${modal.detail.match_time}`
    try {
      await createMut.mutate({
        team1_name: modal.detail.home_team,
        team2_name: modal.detail.away_team,
        team1_logo: modal.detail.home_logo ? `${IMAGE_BASE}/images/${modal.detail.home_logo}` : null,
        team2_logo: modal.detail.away_logo ? `${IMAGE_BASE}/images/${modal.detail.away_logo}` : null,
        match_time: new Date(matchTime).toISOString(),
        league: modal.detail.league,
        commentator: modal.detail.commentator || "",
        channel_key: ch.channel_key,
        channel_name: ch.name,
        sort_order: 0,
      })
      setImportedIds(prev => new Set(prev).add(modal.match.match_id))
      setManualModal(null)
    } catch {}
  }

  const handleManualChannelSearch = (query: string) => {
    if (!manualModal) return
    setManualModal({ ...manualModal, channelSearch: query, selectedChannel: null })
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const q = normalizeName(query)
      const results = allChannels.filter(ch => {
        if (!ch.is_active) return false
        return normalizeName(ch.name).includes(q) || normalizeName(ch.channel_key).includes(q)
      }).slice(0, 20)
      setManualModal(prev => prev ? { ...prev, channelResults: results } : null)
    }, 300)
  }

  const importedMatches = matches.filter(m => isDuplicate(m))
  const pendingMatches = matches.filter(m => !isDuplicate(m))

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 content-area animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="p-6 space-y-6">{/* skeleton handled by loading state */}</div>
        </div>
      </>
    )
  }
  if (!user) return null

  return (
    <>
      <Navbar />
      <div className="flex-1 content-area space-y-6 p-4 sm:p-6 lg:p-8" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Auto Import Live Events
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Import matches from YSScores with automatic channel linking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <Button variant="secondary" size="sm" onClick={() => {
              const d = new Date()
              setSelectedDate(d.toISOString().slice(0, 10))
            }}>Today</Button>
            <Button variant="secondary" size="sm" onClick={() => {
              const d = new Date()
              d.setDate(d.getDate() + 1)
              setSelectedDate(d.toISOString().slice(0, 10))
            }}>Tomorrow</Button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.15)" }}>
            {error}
          </div>
        )}

        {importedMatches.length > 0 && (
          <div className="accordion-section">
            <button className="accordion-header" onClick={() => setShowImported(!showImported)}>
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-green)" }} />
                Imported Matches ({importedMatches.length})
              </div>
              <svg className={`accordion-chevron ${showImported ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="accordion-body" style={{ maxHeight: showImported ? "5000px" : "0" }}>
              <div className="accordion-content">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {importedMatches.map(m => (
                    <div key={m.match_id} className="rounded-xl p-4 opacity-60"
                      style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between gap-2 text-xs mb-2">
                        <span className="truncate" style={{ color: "var(--accent-green)" }}>{m.league}</span>
                        <span style={{ color: "var(--text-muted)" }}>{formatTime(m.match_time)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>{getTeamInitials(m.home_team)}</div>
                          <span className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{m.home_team}</span>
                        </div>
                        <span className="text-[10px] font-bold shrink-0" style={{ color: "var(--text-muted)" }}>vs</span>
                        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                          <span className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{m.away_team}</span>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>{getTeamInitials(m.away_team)}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.1)", color: "var(--accent-green)" }}>Imported</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-2xl p-5" style={{ background: "var(--surface)", height: 180 }} />
            ))}
          </div>
        ) : pendingMatches.length === 0 ? (
          <div className="rounded-2xl p-14 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
              <svg className="w-7 h-7" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              {matches.length === 0 ? "No matches found for this date" : "All matches have been imported"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {matches.length === 0 ? "Select a different date or check back later" : "Showing imported matches above"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {pendingMatches.map((match, idx) => (
              <motion.div
                key={match.match_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl p-5 relative overflow-hidden group"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-medium truncate px-2 py-0.5 rounded-md" style={{ background: "var(--bg-tertiary)", color: "var(--accent)" }}>
                    {match.league || "Unknown League"}
                  </span>
                  <span className="text-[11px] font-mono shrink-0" style={{ color: "var(--text-muted)" }}>
                    {formatTime(match.match_time)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 py-2">
                  <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "var(--bg-tertiary)", color: "var(--accent-cyan)" }}>
                      {getTeamInitials(match.home_team)}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight truncate w-full" style={{ color: "var(--text-primary)" }}>
                      {match.home_team}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>VS</span>
                    {match.status === 4 && (
                      <span className="text-xs font-bold" style={{ color: "var(--accent-green)" }}>
                        {match.home_scores} - {match.away_scores}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "var(--bg-tertiary)", color: "var(--accent-pink)" }}>
                      {getTeamInitials(match.away_team)}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight truncate w-full" style={{ color: "var(--text-primary)" }}>
                      {match.away_team}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => handleImport(match)}
                    disabled={importingId === match.match_id || createMut.isLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))", color: "white" }}
                  >
                    {importingId === match.match_id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Importing...
                      </span>
                    ) : isDuplicate(match) ? "Imported" : "Import Match"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!manualModal} onOpenChange={(open) => { if (!open) setManualModal(null) }}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Channel Selection</DialogTitle>
            <DialogDescription>
              No matching channel was found automatically for this match. Select a channel manually.
            </DialogDescription>
          </DialogHeader>
          {manualModal && (
            <div className="space-y-4">
              <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--bg-tertiary)" }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{manualModal.detail.home_team}</span>
                  <span className="font-bold" style={{ color: "var(--text-muted)" }}>vs</span>
                  <span className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{manualModal.detail.away_team}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span>{manualModal.detail.league}</span>
                  <span>{formatTime(manualModal.detail.match_time)}</span>
                </div>
                {manualModal.detail.commentator && (
                  <p className="text-[10px]" style={{ color: "var(--accent-orange)" }}>
                    Commentator: {manualModal.detail.commentator}
                  </p>
                )}
                {manualModal.detail.channel_name && (
                  <p className="text-[10px]" style={{ color: "var(--error)" }}>
                    Channel not found: &quot;{manualModal.detail.channel_name}&quot;
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Search Channel</label>
                <input type="text" value={manualModal.channelSearch} onChange={e => handleManualChannelSearch(e.target.value)}
                  placeholder="Type channel name..." className="w-full"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", outline: "none" }} />
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {manualModal.channelResults.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>No channels found</p>
                ) : (
                  manualModal.channelResults.map(ch => (
                    <button key={ch.id} onClick={() => setManualModal({ ...manualModal, selectedChannel: ch })}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                      style={{
                        background: manualModal.selectedChannel?.id === ch.id ? "rgba(34,211,238,0.08)" : "var(--bg-tertiary)",
                        border: `1px solid ${manualModal.selectedChannel?.id === ch.id ? "rgba(34,211,238,0.2)" : "var(--border)"}`,
                        color: manualModal.selectedChannel?.id === ch.id ? "var(--accent)" : "var(--text-primary)",
                      }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: "var(--bg-secondary)", color: "var(--accent)" }}>{getTeamInitials(ch.name)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{ch.name}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{ch.channel_key}</p>
                      </div>
                      {manualModal.selectedChannel?.id === ch.id && (
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="secondary">Cancel</Button>} />
            <Button onClick={handleManualImport} disabled={!manualModal?.selectedChannel || createMut.isLoading}>
              {createMut.isLoading ? "Importing..." : "Import with Selected Channel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
