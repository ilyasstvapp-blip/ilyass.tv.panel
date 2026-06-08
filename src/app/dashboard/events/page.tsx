"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useEvents, useLeagues } from "@/hooks/useEvents"
import { useAllChannels } from "@/hooks/useChannels"
import { useCreateEvent, useUpdateEvent, useDeleteLiveEvent } from "@/hooks/useMutations"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { LiveEvent, Channel } from "@/types/database"

/* ── Interfaces ── */

interface YSMatch {
  match_id: number
  league: string
  league_image: string
  home_team: string
  home_logo: string
  away_team: string
  away_logo: string
  match_date: string
  match_time: string
  match_timestamp: number
  live: number
  status: string
  home_scores: string | null
  away_scores: string | null
  channel_commm?: Array<{ channel_name: string; commentator_name: string }>
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
  match_timestamp: number
  stadium: string
  referee: string
  round: string
  channel_name: string
  commentator: string
  channels: { channel_name: string; commentator_name: string }[]
}

/* ── Constants & Helpers ── */

const LOGO_BASE = "https://imgs.ysscores.com/teams/150/"

const getLogoUrl = (filename: string | null | undefined) => {
  if (!filename) return null
  if (filename.startsWith("http")) return filename
  return `${LOGO_BASE}${filename}`
}

const leagueColors: Record<string, string> = {
  "World Cup": "#8b5cf6", "Champions": "#1a5cff", "Premier": "#e90052",
  "La Liga": "#ffd700", "Bundesliga": "#e2001a", "Serie A": "#004b87",
  "Ligue 1": "#003da5", "CAF": "#008000", "Europa": "#ff6b35",
  "Copa": "#e90052", "UEFA": "#1a5cff", "Cup": "#f97316",
}

const getLeagueColor = (league: string) => {
  for (const [key, c] of Object.entries(leagueColors)) {
    if (league.toLowerCase().includes(key.toLowerCase())) return c
  }
  return "var(--accent)"
}

function getMatchStatus(event: { match_time: string; is_live?: boolean; event_status?: string }) {
  if (event.event_status) return event.event_status
  if (event.is_live) return "LIVE"
  const now = new Date()
  const matchTime = new Date(event.match_time)
  if (now >= matchTime && now < new Date(matchTime.getTime() + 3 * 60 * 60 * 1000)) return "LIVE"
  if (now < matchTime) return "UPCOMING"
  return "FINISHED"
}

const arabicChannelMap: Record<string, string> = {
  "\u0628\u064A\u0646 \u0633\u0628\u0648\u0631\u062A \u0645\u0627\u0643\u0633": "beIN SPORTS MAX",
  "\u0628\u064A\u0646 \u0633\u0628\u0648\u0631\u062A": "beIN SPORTS",
  "\u0628\u064A \u0627\u0646 \u0633\u0628\u0648\u0631\u062A \u0645\u0627\u0643\u0633": "beIN SPORTS MAX",
  "\u0628\u064A \u0627\u0646 \u0633\u0628\u0648\u0631\u062A": "beIN SPORTS",
  "\u0627\u0644\u0643\u0623\u0633": "ALKASS",
  " SSC ": " SSC ",
}

function normalizeChannelName(name: string) {
  let n = name.replace(/\b(FR|AR|EN|ES|TR|DE|PT)\b/gi, "")
  n = n.replace(/\b(HD|FHD|UHD|4K|HDR|SD)\b/gi, "")
  n = n.replace(/[^a-zA-Z0-9\s]/g, " ")
  n = n.replace(/\s+/g, " ").trim().toLowerCase()
  return n
}

function isGenericTerm(name: string): boolean {
  const generic = /^(bein|ssc|alkass| Sports | channel|tv|hd|sd|fhd|uhd|4k)$/i
  return generic.test(name.trim())
}

/* ── Searchable League Dropdown ── */

function LeagueDropdown({
  leagues,
  selected,
  onChange,
}: {
  leagues: string[]
  selected: string | null
  onChange: (league: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = leagues.filter(l => l.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    } else {
      setPosition(null)
    }
  }, [open])

  return (
    <div style={{ minWidth: 200 }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 12,
          fontSize: 13,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}>
        <span style={{ flex: 1, textAlign: "left" }}>
          {selected || "All Leagues"}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && position && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: position.width,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 9999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}>
          <div style={{ padding: 8 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search league..."
              autoFocus
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: 12,
                outline: "none",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); setSearch("") }}
              style={{
                width: "100%",
                padding: "8px 12px",
                textAlign: "left",
                fontSize: 13,
                background: selected === null ? "rgba(34,211,238,0.08)" : "transparent",
                color: selected === null ? "var(--accent)" : "var(--text-primary)",
                border: "none",
                cursor: "pointer",
                display: "block",
              }}>
              All Leagues
            </button>
            {filtered.map(league => (
              <button
                key={league}
                type="button"
                onClick={() => { onChange(league); setOpen(false); setSearch("") }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  textAlign: "left",
                  fontSize: 13,
                  background: selected === league ? "rgba(34,211,238,0.08)" : "transparent",
                  color: selected === league ? "var(--accent)" : "var(--text-primary)",
                  border: "none",
                  cursor: "pointer",
                  display: "block",
                }}>
                {league}
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: 12, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                No leagues found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Logo Image with fallback ── */

function TeamLogo({ src, alt, size = 10 }: { src: string | null | undefined; alt: string; size?: number }) {
  const [error, setError] = useState(false)
  if (!src || error) {
    return (
      <div className={`w-${size} h-${size} rounded-full flex items-center justify-center shrink-0 ring-2`}
        style={{ background: "var(--bg-tertiary)", "--tw-ring-color": "rgba(34,211,238,0.1)" } as React.CSSProperties}>
        <svg className="w-5 h-5" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a15 15 0 010 20 15 15 0 010-20z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 12h20" />
        </svg>
      </div>
    )
  }
  return (
    <img src={src} alt={alt}
      className={`w-${size} h-${size} rounded-full object-cover shrink-0 ring-2`}
      style={{ "--tw-ring-color": "rgba(34,211,238,0.1)" } as React.CSSProperties}
      onError={() => setError(true)}
    />
  )
}

/* ── Feedback Toast ── */

function FeedbackToast({ feedback, onDismiss }: { feedback: { type: "success" | "error"; message: string } | null; onDismiss: () => void }) {
  if (!feedback) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
      style={{
        background: feedback.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(248,113,113,0.08)",
        border: `1px solid ${feedback.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(248,113,113,0.15)"}`,
        color: feedback.type === "success" ? "var(--accent-green)" : "var(--error)",
      }}>
      {feedback.type === "success" ? (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span className="flex-1">{feedback.message}</span>
      <button onClick={onDismiss} className="text-xs font-medium cursor-pointer hover:opacity-80" style={{ opacity: 0.6 }}>Dismiss</button>
    </motion.div>
  )
}

/* ── Page ── */

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  /* App events state */
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<LiveEvent | null>(null)

  /* Edit form state */
  const [formTeam1, setFormTeam1] = useState("")
  const [formTeam2, setFormTeam2] = useState("")
  const [formTime, setFormTime] = useState("")
  const [formLeague, setFormLeague] = useState("")
  const [formCommentator, setFormCommentator] = useState("")
  const [formChannelKey, setFormChannelKey] = useState("")
  const [formChannelName, setFormChannelName] = useState("")
  const [formOrder, setFormOrder] = useState(0)
  const [formTeam1Logo, setFormTeam1Logo] = useState("")
  const [formTeam2Logo, setFormTeam2Logo] = useState("")

  /* YSScores state */
  const [ysDate, setYsDate] = useState(new Date().toISOString().slice(0, 10))
  const [ysMatches, setYsMatches] = useState<YSMatch[]>([])
  const [ysLoading, setYsLoading] = useState(false)
  const [ysError, setYsError] = useState<string | null>(null)
  const [ysSelectedLeague, setYsSelectedLeague] = useState<string | null>(null)
  const [ysAvailableLeagues, setYsAvailableLeagues] = useState<string[]>([])
  const [importingId, setImportingId] = useState<number | null>(null)
  const [importFeedback, setImportFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  /* Manual channel modal state */
  const [manualOpen, setManualOpen] = useState(false)
  const [manualData, setManualData] = useState<{
    match: YSMatch
    detail: YSMatchDetail
    commentator: string
    channelName: string
  } | null>(null)
  const [manualChannelSearch, setManualChannelSearch] = useState("")
  const [manualSelectedChannel, setManualSelectedChannel] = useState<Channel | null>(null)
  const [manualCommentator, setManualCommentator] = useState("")

  /* ── Data Hooks ── */

  const { data: events, count, loading, error, refetch } = useEvents({
    page,
    pageSize: 12,
  })
  const { data: leagues } = useLeagues()
  const { data: allChannels } = useAllChannels()
  const createMut = useCreateEvent()
  const updateMut = useUpdateEvent()
  const deleteMut = useDeleteLiveEvent()

  /* ── Effects ── */

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!importFeedback) return
    const timer = setTimeout(() => setImportFeedback(null), 5000)
    return () => clearTimeout(timer)
  }, [importFeedback])

  /* ── YSScores date helpers ── */

  const setToday = () => setYsDate(new Date().toISOString().slice(0, 10))
  const setTomorrow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    setYsDate(d.toISOString().slice(0, 10))
  }

  const fetchYsMatches = useCallback(async () => {
    setYsLoading(true)
    setYsError(null)
    setYsMatches([])
    setYsAvailableLeagues([])
    setYsSelectedLeague(null)
    try {
      const res = await fetch(`/api/ysscores?date=${ysDate}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch matches")
      const matches: YSMatch[] = data.matches || []
      setYsMatches(matches)
      const leagues = [...new Set(matches.map(m => m.league).filter(Boolean))] as string[]
      setYsAvailableLeagues(leagues.sort())
    } catch (e) {
      setYsError(e instanceof Error ? e.message : "Failed to fetch matches")
    } finally {
      setYsLoading(false)
    }
  }, [ysDate])

  useEffect(() => { fetchYsMatches() }, [fetchYsMatches])

  /* ── Filter helpers ── */

  const filteredYsMatches = ysMatches.filter(m => {
    if (ysSelectedLeague && m.league !== ysSelectedLeague) return false
    return true
  })

  const importedFingerprints = new Set(
    events.map(e => `${e.team1_name}|${e.team2_name}|${e.league}|${e.match_time.slice(0, 10)}`)
  )
  const isMatchImported = (match: YSMatch) =>
    importedFingerprints.has(`${match.home_team}|${match.away_team}|${match.league}|${match.match_date}`)

  const findChannel = (channelName: string): { channel: Channel | null; score: number } => {
    if (!channelName || !allChannels.length) return { channel: null, score: 0 }

    let convertedName = channelName
    const arabicRegex = /[\u0600-\u06FF]/
    if (arabicRegex.test(channelName)) {
      for (const [arabic, latin] of Object.entries(arabicChannelMap)) {
        if (channelName.includes(arabic)) {
          convertedName = channelName.replace(arabic, latin)
          break
        }
      }
    }

    const norm = normalizeChannelName(convertedName)
    if (isGenericTerm(norm)) return { channel: null, score: 0 }

    const exact = allChannels.find(c => c.name === channelName || c.channel_key === channelName)
    if (exact) return { channel: exact, score: 100 }

    const normExact = allChannels.find(
      c => normalizeChannelName(c.name) === norm || normalizeChannelName(c.channel_key) === norm
    )
    if (normExact) return { channel: normExact, score: 90 }

    const normParts = norm.split(/\s+/).filter(Boolean)
    if (normParts.length >= 2) {
      const matched = allChannels.find(c => {
        const cNorm = normalizeChannelName(c.name)
        return normParts.every(p => cNorm.includes(p))
      })
      if (matched) return { channel: matched, score: 75 }
    }

    return { channel: null, score: 0 }
  }

  /* ── Import handlers ── */

  const handleImport = async (match: YSMatch) => {
    setImportingId(match.match_id)
    setImportFeedback(null)
    try {
      const res = await fetch(`/api/ysscores?matchId=${match.match_id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch match detail")
      const detail: YSMatchDetail = data.match
      const channelInfo = detail.channels?.[0] || {}
      const commentator = channelInfo.commentator_name || detail.commentator || ""
      const channelName = channelInfo.channel_name || detail.channel_name || ""

      const { channel: foundChannel } = findChannel(channelName)

      if (foundChannel) {
        await createMut.mutate({
          team1_name: match.home_team,
          team2_name: match.away_team,
          match_time: new Date(match.match_timestamp * 1000).toISOString(),
          league: match.league,
          commentator,
          channel_key: foundChannel.channel_key,
          channel_name: foundChannel.name,
          team1_logo: getLogoUrl(match.home_logo),
          team2_logo: getLogoUrl(match.away_logo),
          sort_order: 0,
        })
        refetch()
        setImportFeedback({
          type: "success",
          message: `"${match.home_team} vs ${match.away_team}" imported successfully`,
        })
      } else {
        throw new Error(`No matching IPTV channel found for "${channelName}"`)
      }
    } catch (e) {
      setImportFeedback({
        type: "error",
        message: e instanceof Error ? e.message : "Import failed",
      })
    } finally {
      setImportingId(null)
    }
  }

  const handleManualImport = async () => {
    if (!manualData) return
    const { match, detail } = manualData
    const ch = manualSelectedChannel
    const commentator = manualCommentator || detail.channels?.[0]?.commentator_name || detail.commentator || ""

    try {
      await createMut.mutate({
        team1_name: match.home_team,
        team2_name: match.away_team,
        match_time: new Date(match.match_timestamp * 1000).toISOString(),
        league: match.league,
        commentator,
        channel_key: ch?.channel_key || "",
        channel_name: ch?.name || manualData.channelName,
        team1_logo: getLogoUrl(match.home_logo),
        team2_logo: getLogoUrl(match.away_logo),
        sort_order: 0,
      })
      setManualOpen(false)
      setManualData(null)
      refetch()
      setImportFeedback({
        type: "success",
        message: `"${match.home_team} vs ${match.away_team}" imported successfully`,
      })
    } catch (e) {
      setImportFeedback({
        type: "error",
        message: e instanceof Error ? e.message : "Import failed",
      })
    }
  }

  /* ── CRUD handlers ── */

  const resetForm = () => {
    setFormTeam1("")
    setFormTeam2("")
    setFormTime("")
    setFormLeague("")
    setFormCommentator("")
    setFormChannelKey("")
    setFormChannelName("")
    setFormOrder(0)
    setFormTeam1Logo("")
    setFormTeam2Logo("")
    setEditEvent(null)
  }

  const openEdit = (ev: LiveEvent) => {
    setEditEvent(ev)
    setFormTeam1(ev.team1_name)
    setFormTeam2(ev.team2_name)
    setFormTime(ev.match_time.slice(0, 16))
    setFormLeague(ev.league)
    setFormCommentator(ev.commentator || "")
    setFormChannelKey(ev.channel_key)
    setFormChannelName(ev.channel_name)
    setFormOrder((ev as any).sort_order ?? 0)
    setFormTeam1Logo(ev.team1_logo || "")
    setFormTeam2Logo(ev.team2_logo || "")
  }

  const handleUpdate = async () => {
    if (!editEvent) return
    try {
      await updateMut.mutate(editEvent.id, {
        team1_name: formTeam1,
        team2_name: formTeam2,
        match_time: new Date(formTime).toISOString(),
        league: formLeague,
        commentator: formCommentator,
        channel_key: formChannelKey,
        channel_name: formChannelName,
        sort_order: formOrder,
        team1_logo: formTeam1Logo || null,
        team2_logo: formTeam2Logo || null,
      })
      resetForm()
      refetch()
    } catch {}
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMut.mutate(deleteId)
      setDeleteId(null)
      refetch()
    } catch {}
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBatchDelete = async () => {
    try {
      for (const id of selectedIds) await deleteMut.mutate(id)
      setSelectedIds(new Set())
      setBatchDeleteOpen(false)
      refetch()
    } catch {}
  }

  const handleDeleteAll = async () => {
    try {
      for (const ev of events) await deleteMut.mutate(ev.id)
      setDeleteAllOpen(false)
      refetch()
    } catch {}
  }

  const filteredManualChannels = allChannels.filter(c =>
    !manualChannelSearch ||
    c.name.toLowerCase().includes(manualChannelSearch.toLowerCase()) ||
    c.channel_key.toLowerCase().includes(manualChannelSearch.toLowerCase())
  )

  const sortedEvents = [...events].sort((a, b) => {
    const orderMap: Record<string, number> = { LIVE: 0, UPCOMING: 1, FINISHED: 2 }
    const statusA = getMatchStatus(a)
    const statusB = getMatchStatus(b)
    if (orderMap[statusA] !== orderMap[statusB]) return orderMap[statusA] - orderMap[statusB]
    return new Date(a.match_time).getTime() - new Date(b.match_time).getTime()
  })

  /* ── Derived stats ── */

  const liveCount = events.filter(e => getMatchStatus(e) === "LIVE").length
  const upcomingCount = events.filter(e => getMatchStatus(e) === "UPCOMING").length
  const finishedCount = events.filter(e => getMatchStatus(e) === "FINISHED").length
  const totalPages = Math.ceil(count / 12)

  /* ── Loading / Auth Guard ── */

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="card-premium" style={{ height: 100 }} />)}
          </div>
          <div className="card-premium h-48" style={{ background: "var(--surface)" }} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="card-premium h-52" style={{ background: "var(--surface)" }} />)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */

  const todayStr = new Date().toISOString().slice(0, 10)
  const tomorrowStr = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })()
  const isToday = ysDate === todayStr
  const isTomorrow = ysDate === tomorrowStr

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>

        {/* ── Header ── */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Live Events
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            YSScores auto-import &bull; match statistics &bull; LIVE, UPCOMING, and FINISHED event management
          </p>
        </div>

        {/* ── Statistics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: count, color: "var(--accent-orange)", delay: 0 },
            { label: "LIVE", value: liveCount, color: "var(--accent-green)", delay: 1 },
            { label: "Upcoming", value: upcomingCount, color: "var(--accent-cyan)", delay: 2 },
            { label: "Finished", value: finishedCount, color: "var(--accent-purple)", delay: 3 },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-premium p-5"
              style={{ background: "var(--surface)" }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              <p className="text-3xl font-bold tracking-tight" style={{ color: s.color }}>
                {loading ? "\u2014" : s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Import Center ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium overflow-hidden"
          style={{ background: "var(--surface)" }}>
          <div className="px-5 pt-5 pb-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                <span className="w-1 h-5 rounded-full" style={{ background: "var(--gradient-purple)" }} />
                Import Center
              </h3>
              <span className="badge text-[10px] px-2 py-0.5" style={{ background: "rgba(167,139,250,0.1)", color: "var(--accent-purple)" }}>
                {ysMatches.length} matches
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Fetch matches from YSScores and import with one click. Auto-links to your channels.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Date</label>
                <input type="date" value={ysDate} onChange={e => setYsDate(e.target.value)}
                  className="w-40 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div style={{ display: "flex", gap: 6, paddingBottom: 2 }}>
                <button
                  type="button"
                  onClick={setToday}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    border: `1px solid ${isToday ? "var(--accent-cyan)" : "var(--border)"}`,
                    background: isToday ? "rgba(34,211,238,0.12)" : "var(--bg-secondary)",
                    color: isToday ? "var(--accent-cyan)" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}>
                  Today
                </button>
                <button
                  type="button"
                  onClick={setTomorrow}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    border: `1px solid ${isTomorrow ? "var(--accent-cyan)" : "var(--border)"}`,
                    background: isTomorrow ? "rgba(34,211,238,0.12)" : "var(--bg-secondary)",
                    color: isTomorrow ? "var(--accent-cyan)" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}>
                  Tomorrow
                </button>
              </div>
              <div className="flex gap-2 items-end pb-0.5">
                <Button onClick={fetchYsMatches} disabled={ysLoading}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* League filter dropdown */}
          {ysAvailableLeagues.length > 0 && (
            <div className="px-5 pb-5 mt-2">
              <label className="text-xs block mb-2 font-medium" style={{ color: "var(--text-muted)" }}>Filter by League</label>
              <LeagueDropdown
                leagues={ysAvailableLeagues}
                selected={ysSelectedLeague}
                onChange={(league) => setYsSelectedLeague(league)}
              />
            </div>
          )}
        </motion.div>

        {/* ── Feedback Toast ── */}
        <FeedbackToast feedback={importFeedback} onDismiss={() => setImportFeedback(null)} />

        {/* ── YSScores Loading ── */}
        {ysLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <span className="w-10 h-10 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--accent-purple) transparent transparent transparent" }} />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>Fetching matches from YSScores...</span>
            </div>
          </div>
        )}

        {/* ── YSScores Error ── */}
        {ysError && !ysLoading && (
          <div className="card-premium p-8 text-center" style={{ background: "var(--surface)" }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(248,113,113,0.08)" }}>
              <svg className="w-7 h-7" style={{ color: "var(--error)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--error)" }}>Failed to fetch matches</p>
            <p className="text-xs mt-1 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>{ysError}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={fetchYsMatches}>Retry</Button>
            </div>
          </div>
        )}

        {/* ── YSScores Match Cards ── */}
        {!ysLoading && !ysError && ysMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Showing {filteredYsMatches.length} of {ysMatches.length} matches
              </p>
            </div>

            {filteredYsMatches.length === 0 ? (
              <div className="card-premium p-10 text-center" style={{ background: "var(--surface)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No matches match the selected league
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredYsMatches.map((match, i) => {
                  const lc = getLeagueColor(match.league)
                  const isLive = match.live === 1
                  const isImported = isMatchImported(match)
                  const matchDate = new Date(match.match_timestamp * 1000)
                  const hasChannels = match.channel_commm && match.channel_commm.length > 0
                  const firstChannel = hasChannels ? match.channel_commm![0] : null
                  const commentator = firstChannel?.commentator_name || ""
                  const channelName = firstChannel?.channel_name || ""
                  const extraChannels = hasChannels ? match.channel_commm!.length - 1 : 0
                  return (
                    <motion.div
                      key={match.match_id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="card-premium overflow-hidden group hover:scale-[1.01] transition-all duration-200"
                      style={{ background: "var(--surface)" }}>
                      {/* League header */}
                      <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: `${lc}14`, color: lc }}>
                        <span className="relative flex w-2 h-2">
                          {isLive && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: lc }} />
                          )}
                          <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: lc }} />
                        </span>
                        {match.league}
                        {isLive ? (
                          <span className="badge text-[8px] px-1.5 py-0 ml-auto animate-pulse"
                            style={{ background: `${lc}24`, color: lc, border: `1px solid ${lc}40` }}>
                            LIVE
                          </span>
                        ) : (
                          <span className="badge text-[8px] px-1.5 py-0 ml-auto"
                            style={{ background: `${lc}18`, color: lc, border: `1px solid ${lc}30` }}>
                            UPCOMING
                          </span>
                        )}
                      </div>
                      {/* Card body */}
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          {/* Home team */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <TeamLogo src={getLogoUrl(match.home_logo)} alt={match.home_team} size={12} />
                            <span className="text-sm font-bold block truncate" style={{ color: "var(--text-primary)" }}>
                              {match.home_team}
                            </span>
                          </div>
                          {/* VS */}
                          <div className="flex flex-col items-center px-2 py-1 rounded-lg shrink-0" style={{ background: "var(--bg-tertiary)" }}>
                            <span className="text-[10px] font-extrabold tracking-widest" style={{ color: lc }}>VS</span>
                          </div>
                          {/* Away team */}
                          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                            <span className="text-sm font-bold block truncate" style={{ color: "var(--text-primary)" }}>
                              {match.away_team}
                            </span>
                            <TeamLogo src={getLogoUrl(match.away_logo)} alt={match.away_team} size={12} />
                          </div>
                        </div>
                        {/* Date + Time */}
                        <div className="flex items-center gap-2 text-xs p-2 rounded-lg mb-2" style={{ background: "var(--bg-tertiary)" }}>
                          <svg className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium" style={{ color: lc }}>
                            {matchDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                          <span className="font-mono" style={{ color: lc }}>
                            {matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {/* Commentator row */}
                        <div className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium" style={{ color: "var(--accent-cyan)" }}>Commentary:</span>
                          <span>{commentator || "Not Available"}</span>
                        </div>
                        {/* Channel row */}
                        <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {channelName ? (
                            <>
                              <span>{channelName}</span>
                              {extraChannels > 0 && (
                                <span className="badge text-[9px] px-1.5 py-0"
                                  style={{ background: "rgba(34,211,238,0.12)", color: "var(--accent-cyan)" }}>
                                  +{extraChannels} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span>Not Available</span>
                          )}
                        </div>
                        {/* Import button */}
                        <Button
                          size="sm"
                          onClick={() => handleImport(match)}
                          disabled={importingId === match.match_id || isImported || createMut.isLoading}
                          style={{
                            width: "100%",
                            background: isImported ? "rgba(34,197,94,0.15)" : undefined,
                            color: isImported ? "var(--accent-green)" : undefined,
                          }}>
                          {importingId === match.match_id
                            ? "Importing..."
                            : isImported
                              ? "Imported"
                              : "Import Match"}
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── YSScores Empty State ── */}
        {!ysLoading && !ysError && ysMatches.length === 0 && (
          <div className="card-premium p-14 text-center" style={{ background: "var(--surface)" }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
              <svg className="w-7 h-7" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No matches fetched yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Select a date and click &ldquo;Refresh&rdquo; to load matches from YSScores
            </p>
          </div>
        )}

        {/* ── Imported Events Section ── */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1 h-6 rounded-full" style={{ background: "var(--gradient-purple)" }} />
              <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Imported Events
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectMode(!selectMode)
                  if (selectMode) setSelectedIds(new Set())
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  border: `1px solid ${selectMode ? "var(--accent-cyan)" : "var(--border)"}`,
                  background: selectMode ? "rgba(34,211,238,0.12)" : "var(--bg-secondary)",
                  color: selectMode ? "var(--accent-cyan)" : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}>
                {selectMode ? "Exit Select Mode" : "Select Mode"}
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)", border: "1px solid rgba(248,113,113,0.15)" }}>
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="card-premium h-52" style={{ background: "var(--surface)" }} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && events.length === 0 && (
            <div className="card-premium p-14 text-center" style={{ background: "var(--surface)" }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
                <svg className="w-7 h-7" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No events imported yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Use Import Center above to add matches
              </p>
            </div>
          )}

          {/* Event cards grid */}
          {!loading && events.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sortedEvents.map((ev, idx) => {
                const status = getMatchStatus(ev)
                const leagueColor = getLeagueColor(ev.league)
                const isSelected = selectedIds.has(ev.id)
                const isLive = status === "LIVE"
                const isUpcoming = status === "UPCOMING"
                const isFinished = status === "FINISHED"
                return (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`card-premium overflow-hidden group transition-all duration-200 ${isSelected ? "ring-2" : ""}`}
                    style={{
                      background: "var(--surface)",
                      "--tw-ring-color": isSelected ? leagueColor : "transparent",
                    } as React.CSSProperties}>
                    {/* League header */}
                    <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: `${leagueColor}12`, color: leagueColor }}>
                      <div className="flex items-center gap-2 flex-1">
                        {selectMode && (
                          <input type="checkbox" checked={isSelected}
                            onChange={() => toggleSelect(ev.id)}
                            className="rounded accent-cyan-500 w-3.5 h-3.5 cursor-pointer" />
                        )}
                        <span className="relative flex w-2 h-2">
                          {isLive && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: leagueColor }} />
                          )}
                          <span className="relative inline-flex rounded-full w-2 h-2"
                            style={{ background: isLive ? "#22c55e" : isUpcoming ? leagueColor : "var(--text-muted)" }} />
                        </span>
                        {ev.league}
                      </div>
                      <span className="badge text-[8px] px-1.5 py-0"
                        style={{
                          background: isLive
                            ? "rgba(34,197,94,0.2)"
                            : isUpcoming
                              ? `${leagueColor}20`
                              : "rgba(107,114,128,0.2)",
                          color: isLive ? "#22c55e" : isUpcoming ? leagueColor : "var(--text-muted)",
                          border: `1px solid ${
                            isLive
                              ? "rgba(34,197,94,0.3)"
                              : isUpcoming
                                ? `${leagueColor}30`
                                : "rgba(107,114,128,0.3)"
                          }`,
                        }}>
                        {status}
                      </span>
                    </div>
                    {/* Card body */}
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <TeamLogo src={ev.team1_logo} alt={ev.team1_name} size={12} />
                          <span className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                            {ev.team1_name}
                          </span>
                        </div>
                        <div className="flex flex-col items-center px-2 py-1 rounded-lg shrink-0" style={{ background: "var(--bg-tertiary)" }}>
                          <span className="text-[10px] font-extrabold tracking-widest" style={{ color: leagueColor }}>VS</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          <span className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                            {ev.team2_name}
                          </span>
                          <TeamLogo src={ev.team2_logo} alt={ev.team2_name} size={12} />
                        </div>
                      </div>
                      {/* Date + Time */}
                      <div className="flex items-center gap-2 text-xs p-2 rounded-lg mb-2" style={{ background: "var(--bg-tertiary)" }}>
                        <svg className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium" style={{ color: leagueColor }}>
                          {new Date(ev.match_time).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                        <span className="font-mono" style={{ color: leagueColor }}>
                          {new Date(ev.match_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {/* Commentator row */}
                      <div className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium" style={{ color: "var(--accent-cyan)" }}>Commentary:</span>
                        <span>{ev.commentator || "Not Available"}</span>
                      </div>
                      {/* Channel row */}
                      <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{ev.channel_name || "Not Available"}</span>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(ev)}
                          className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200"
                          style={{ background: "rgba(34,211,238,0.08)", color: "var(--accent)" }}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(ev.id)} disabled={deleteMut.isLoading}
                          className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200"
                          style={{ background: "rgba(248,113,113,0.08)", color: "var(--error)" }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Select Mode floating action bar */}
          {selectMode && events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mt-4 rounded-xl"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <Button size="sm" variant="secondary" onClick={() => {
                if (selectedIds.size === sortedEvents.length) {
                  setSelectedIds(new Set())
                } else {
                  const allIds = new Set(sortedEvents.map(e => e.id))
                  setSelectedIds(allIds)
                }
              }}>
                {selectedIds.size === sortedEvents.length ? "Deselect All" : "Select All"}
              </Button>
              <Button size="sm" variant="destructive" disabled={selectedIds.size === 0} onClick={() => setBatchDeleteOpen(true)}>
                Delete Selected ({selectedIds.size})
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setDeleteAllOpen(true)}>
                Delete All
              </Button>
              {selectedIds.size > 0 && (
                <button onClick={() => setSelectedIds(new Set())}
                  className="text-xs font-medium px-2 py-1 rounded-lg"
                  style={{ color: "var(--text-muted)", background: "var(--bg-tertiary)" }}>
                  Clear
                </button>
              )}
            </motion.div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Page {page} of {totalPages}
              </span>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>

        {/* ── EDIT DIALOG ── */}
        {editEvent && (
          <Dialog open={!!editEvent} onOpenChange={(open) => { if (!open) resetForm() }}>
            <DialogContent showCloseButton={false} className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogDescription>Update event details for {editEvent.team1_name} vs {editEvent.team2_name}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Team 1</label>
                  <input type="text" value={formTeam1} onChange={e => setFormTeam1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Team 2</label>
                  <input type="text" value={formTeam2} onChange={e => setFormTeam2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Team 1 Logo URL</label>
                  <input type="text" value={formTeam1Logo} onChange={e => setFormTeam1Logo(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Team 2 Logo URL</label>
                  <input type="text" value={formTeam2Logo} onChange={e => setFormTeam2Logo(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Match Time</label>
                  <input type="datetime-local" value={formTime} onChange={e => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>League</label>
                  <input type="text" value={formLeague} onChange={e => setFormLeague(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Commentator</label>
                  <input type="text" value={formCommentator} onChange={e => setFormCommentator(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Channel Key</label>
                  <input type="text" value={formChannelKey} onChange={e => setFormChannelKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Channel Name</label>
                  <input type="text" value={formChannelName} onChange={e => setFormChannelName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Sort Order</label>
                  <input type="number" value={formOrder} onChange={e => setFormOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              {(updateMut.error) && (
                <p className="text-xs mt-2" style={{ color: "var(--error)" }}>{updateMut.error}</p>
              )}
              <DialogFooter>
                <DialogClose render={<Button variant="secondary">Cancel</Button>} />
                <Button onClick={handleUpdate}
                  disabled={!formTeam1 || !formTeam2 || !formTime || !formLeague || updateMut.isLoading}>
                  {updateMut.isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ── DELETE DIALOG ── */}
        <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
          <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription>Are you sure you want to delete this event? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary">Cancel</Button>} />
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMut.isLoading}>
                {deleteMut.isLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── BATCH DELETE DIALOG ── */}
        <Dialog open={batchDeleteOpen} onOpenChange={(open) => { if (!open) setBatchDeleteOpen(false) }}>
          <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Selected Events</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedIds.size} selected events? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary">Cancel</Button>} />
              <Button variant="destructive" onClick={handleBatchDelete} disabled={deleteMut.isLoading}>
                {deleteMut.isLoading ? "Deleting..." : `Delete ${selectedIds.size} Events`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── DELETE ALL DIALOG ── */}
        <Dialog open={deleteAllOpen} onOpenChange={(open) => { if (!open) setDeleteAllOpen(false) }}>
          <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete All Events</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete all {events.length} events on this page? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary">Cancel</Button>} />
              <Button variant="destructive" onClick={handleDeleteAll} disabled={deleteMut.isLoading}>
                {deleteMut.isLoading ? "Deleting..." : "Delete All"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── CHANNEL NOT FOUND MODAL ── */}
        <Dialog open={manualOpen} onOpenChange={(open) => { if (!open) { setManualOpen(false); setManualData(null) } }}>
          <DialogContent showCloseButton={false} className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Channel Not Found</DialogTitle>
              <DialogDescription>
                {manualData && (
                  <span>
                    &ldquo;{manualData.channelName}&rdquo; was not found in your channels.
                    Select a channel manually to continue importing.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {manualData && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Match</label>
                    <div className="p-2 rounded-lg text-xs" style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}>
                      {manualData.match.home_team} vs {manualData.match.away_team}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1 font-medium" style={{ color: "var(--text-muted)" }}>League</label>
                    <div className="p-2 rounded-lg text-xs" style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}>
                      {manualData.match.league}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>
                  Search Channels
                  <span className="ml-1.5 text-[9px] font-normal" style={{ color: "var(--accent-cyan)" }}>
                    ({allChannels.length} total)
                  </span>
                </label>
                <input type="text" value={manualChannelSearch} onChange={e => setManualChannelSearch(e.target.value)}
                  placeholder="Search channels by name or key..."
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {filteredManualChannels.length === 0 ? (
                    <p className="text-xs py-2" style={{ color: "var(--text-muted)" }}>No channels found</p>
                  ) : (
                    filteredManualChannels.slice(0, 50).map(ch => (
                      <button key={ch.id} onClick={() => { setManualSelectedChannel(ch); setManualChannelSearch(ch.name) }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer"
                        style={{
                          background: manualSelectedChannel?.id === ch.id ? "rgba(34,211,238,0.08)" : "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          border: manualSelectedChannel?.id === ch.id ? "1px solid rgba(34,211,238,0.2)" : "1px solid transparent",
                        }}>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate block">{ch.name}</span>
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{ch.channel_key}</span>
                        </div>
                        {manualSelectedChannel?.id === ch.id && (
                          <svg className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>Commentator</label>
                <input type="text" value={manualCommentator} onChange={e => setManualCommentator(e.target.value)}
                  placeholder="Commentator name"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary">Cancel</Button>} />
              <Button onClick={handleManualImport} disabled={!manualSelectedChannel || createMut.isLoading}>
                {createMut.isLoading ? "Importing..." : "Import Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  )
}
