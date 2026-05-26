"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/dashboard/Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useEvents, useLeagues } from "@/hooks/useEvents"
import { useCreateEvent, useUpdateEvent, useDeleteLiveEvent } from "@/hooks/useMutations"
import type { LiveEvent } from "@/types/database"

const leagueColors: Record<string, string> = {
  "UEFA": "#1a5cff",
  "Premier": "#e90052",
  "La Liga": "#ffd700",
  "Serie A": "#004b87",
  "Bundesliga": "#e2001a",
  "Ligue 1": "#003da5",
  "CAF": "#008000",
  "AFCON": "#008000",
}

const getLeagueColor = (league: string) => {
  for (const [key, color] of Object.entries(leagueColors)) {
    if (league.toLowerCase().includes(key.toLowerCase())) return color
  }
  return "var(--accent)"
}

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [leagueFilter, setLeagueFilter] = useState("")
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [fTeam1, setFTeam1] = useState("")
  const [fTeam2, setFTeam2] = useState("")
  const [fMatchTime, setFMatchTime] = useState("")
  const [fLeague, setFLeague] = useState("")
  const [fCommentator, setFCommentator] = useState("")
  const [fChannelKey, setFChannelKey] = useState("")
  const [fChannelName, setFChannelName] = useState("")
  const [fTeam1Logo, setFTeam1Logo] = useState("")
  const [fTeam2Logo, setFTeam2Logo] = useState("")

  const { data: events, count, loading, error, refetch } = useEvents({
    search: search || undefined, league: leagueFilter || undefined, page, pageSize: 12,
  })
  const { data: leagues } = useLeagues()
  const createMut = useCreateEvent()
  const updateMut = useUpdateEvent()
  const deleteMut = useDeleteLiveEvent()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setPage(1) }, [search, leagueFilter])

  const resetForm = () => {
    setFTeam1(""); setFTeam2(""); setFMatchTime(""); setFLeague(""); setFCommentator("")
    setFChannelKey(""); setFChannelName(""); setFTeam1Logo(""); setFTeam2Logo("")
    setEditId(null); setShowCreate(false)
  }

  const buildPayload = () => ({
    team1_name: fTeam1, team2_name: fTeam2, match_time: new Date(fMatchTime).toISOString(),
    league: fLeague, commentator: fCommentator, channel_key: fChannelKey, channel_name: fChannelName,
    team1_logo: fTeam1Logo || null, team2_logo: fTeam2Logo || null,
  })

  const handleCreate = async () => {
    try { await createMut.mutate(buildPayload()); resetForm(); refetch() } catch {}
  }

  const handleUpdate = async () => {
    if (!editId) return
    try { await updateMut.mutate(editId, buildPayload()); resetForm(); refetch() } catch {}
  }

  const handleEdit = (ev: LiveEvent) => {
    setEditId(ev.id)
    setFTeam1(ev.team1_name); setFTeam2(ev.team2_name)
    setFMatchTime(ev.match_time.slice(0, 16)); setFLeague(ev.league)
    setFCommentator(ev.commentator); setFChannelKey(ev.channel_key); setFChannelName(ev.channel_name)
    setFTeam1Logo(ev.team1_logo || ""); setFTeam2Logo(ev.team2_logo || "")
    setShowCreate(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return
    try { await deleteMut.mutate(id); refetch() } catch {}
  }

  if (!mounted || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 p-6 space-y-6 animate-pulse" style={{ background: "var(--bg-primary)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="stat-card" style={{background:"var(--surface)",height:100}}/>)}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="card h-48" style={{background:"var(--surface)"}}/>)}
          </div>
        </div>
      </>
    )
  }
  if (!user) return null

  const totalPages = Math.ceil(count / 12)
  const upcoming = events.filter(e => new Date(e.match_time) > new Date()).length
  const past = events.length - upcoming

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--bg-primary)" }}>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: count, color: "var(--gradient-orange)" },
            { label: "Upcoming", value: upcoming, color: "var(--gradient-green)" },
            { label: "Past", value: past, color: "var(--gradient-cyan)" },
            { label: "Leagues", value: leagues.length, color: "var(--gradient-purple)" },
          ].map((s, i) => (
            <div key={s.label} className="stat-card animate-fade-in" style={{ background: "var(--surface)", animationDelay: `${i*0.1}s` }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              <p className="text-3xl font-bold" style={{
                color: s.color.includes("orange") ? "var(--accent-orange)" :
                       s.color.includes("green") ? "var(--accent-green)" :
                       s.color.includes("cyan") ? "var(--accent-cyan)" : "var(--accent-purple)"
              }}>{loading ? "—" : s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search events..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <select value={leagueFilter} onChange={e => { setLeagueFilter(e.target.value); setPage(1) }}
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
            <option value="">All leagues</option>
            {leagues.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={() => { resetForm(); setShowCreate(true) }} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            New
          </button>
        </div>

        {/* Form */}
        {showCreate && (
          <div className="card p-6 animate-fade-in" style={{ background: "var(--surface)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-1.5 h-5 rounded-full" style={{ background: "var(--gradient-orange)" }} />
              {editId ? "Edit Event" : "New Event"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Team 1</label>
                <input type="text" value={fTeam1} onChange={e => setFTeam1(e.target.value)} placeholder="e.g. Real Madrid" /></div>
              <div><label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Team 2</label>
                <input type="text" value={fTeam2} onChange={e => setFTeam2(e.target.value)} placeholder="e.g. Barcelona" /></div>
              <div><label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Match Time</label>
                <input type="datetime-local" value={fMatchTime} onChange={e => setFMatchTime(e.target.value)} /></div>
              <div><label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>League</label>
                <input type="text" value={fLeague} onChange={e => setFLeague(e.target.value)} placeholder="e.g. UEFA Champions League" /></div>
              <div><label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Commentator</label>
                <input type="text" value={fCommentator} onChange={e => setFCommentator(e.target.value)} /></div>
              <div><label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Channel Key</label>
                <input type="text" value={fChannelKey} onChange={e => setFChannelKey(e.target.value)} /></div>
              <div><label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Channel Name</label>
                <input type="text" value={fChannelName} onChange={e => setFChannelName(e.target.value)} /></div>
              <div><label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Team 1 Logo URL</label>
                <input type="text" value={fTeam1Logo} onChange={e => setFTeam1Logo(e.target.value)} /></div>
              <div><label className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>Team 2 Logo URL</label>
                <input type="text" value={fTeam2Logo} onChange={e => setFTeam2Logo(e.target.value)} /></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={editId ? handleUpdate : handleCreate}
                disabled={!fTeam1 || !fTeam2 || !fMatchTime || !fLeague || !fChannelKey || createMut.isLoading || updateMut.isLoading}
                className="btn btn-primary">
                {editId ? "Save Changes" : "Create Event"}
              </button>
              <button onClick={resetForm} className="btn btn-secondary">Cancel</button>
            </div>
            {(createMut.error || updateMut.error) && (
              <p className="text-xs mt-3" style={{ color: "var(--error)" }}>{createMut.error || updateMut.error}</p>
            )}
          </div>
        )}

        {error && (
          <div className="card px-4 py-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)" }}>{error}</div>
        )}

        {/* Event Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="card h-48" style={{background:"var(--surface)"}}/>)}
          </div>
        ) : events.length === 0 ? (
          <div className="card p-12 text-center" style={{ background: "var(--surface)" }}>
            <p style={{ color: "var(--text-muted)" }}>No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(ev => {
              const isUpcoming = new Date(ev.match_time) > new Date()
              const leagueColor = getLeagueColor(ev.league)
              return (
                <div key={ev.id} className="card overflow-hidden animate-fade-in" style={{ background: "var(--surface)" }}>
                  {/* League Banner */}
                  <div className="px-5 py-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ background: `${leagueColor}15`, color: leagueColor }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: leagueColor }} />
                    {ev.league}
                  </div>
                  {/* Teams */}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {ev.team1_logo
                          ? <img src={ev.team1_logo} alt="" className="w-10 h-10 rounded-full object-cover" />
                          : <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>?</div>}
                        <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{ev.team1_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold tracking-widest" style={{ color: "var(--text-muted)" }}>VS</span>
                      </div>
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                        <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{ev.team2_name}</span>
                        {ev.team2_logo
                          ? <img src={ev.team2_logo} alt="" className="w-10 h-10 rounded-full object-cover" />
                          : <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>?</div>}
                      </div>
                    </div>
                    {/* Match Time */}
                    <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(ev.match_time).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      <span className="font-mono">{new Date(ev.match_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {isUpcoming && <span className="badge badge-active ml-auto">Upcoming</span>}
                    </div>
                    {/* Details */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      {ev.channel_name && <span>📺 {ev.channel_name}</span>}
                      {ev.commentator && <span>🎙 {ev.commentator}</span>}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex border-t" style={{ borderColor: "var(--border-light)" }}>
                    <button onClick={() => handleEdit(ev)}
                      className="flex-1 py-2.5 text-xs font-medium transition-all hover:bg-white/[0.03]"
                      style={{ color: "var(--text-secondary)" }}>Edit</button>
                    <button onClick={() => handleDelete(ev.id)} disabled={deleteMut.isLoading}
                      className="flex-1 py-2.5 text-xs font-medium transition-all hover:bg-white/[0.03]"
                      style={{ color: "var(--error)" }}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-secondary">Previous</button>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary">Next</button>
          </div>
        )}
      </div>
    </>
  )
}
