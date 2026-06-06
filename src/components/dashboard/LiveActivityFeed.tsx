"use client"

import { motion, AnimatePresence } from "framer-motion"

const EVENT_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  app_open: { label: "App Opened", color: "var(--accent-green)", icon: "M5 13l4 4L19 7" },
  channel_enter: { label: "Channel Entered", color: "var(--accent-cyan)", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  package_open: { label: "Package Opened", color: "var(--accent-purple)", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  player_start: { label: "Playback Started", color: "var(--accent-cyan)", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
  player_close: { label: "Playback Closed", color: "var(--accent-orange)", icon: "M6 18L18 6M6 6l12 12" },
  heartbeat: { label: "Heartbeat", color: "var(--text-muted)", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function LiveActivityFeed({ events, loading }: { events: Array<{ id: string; device_name: string; event_type: string; metadata: Record<string, string> | null; created_at: string }> | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Real-Time Activity Feed</h3>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg" style={{ background: "var(--bg-tertiary)" }} />
              <div className="flex-1">
                <div className="h-3 w-40 rounded mb-1" style={{ background: "var(--bg-tertiary)" }} />
                <div className="h-2 w-20 rounded" style={{ background: "var(--bg-tertiary)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const sorted = events && events.length > 0
    ? [...events].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : []

  return (
    <div className="p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Real-Time Activity Feed</h3>
        {sorted.length > 0 && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--accent-green)12", color: "var(--accent-green)" }}>
            {sorted.length} events
          </span>
        )}
      </div>
      <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {sorted.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-muted)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No recent activity</p>
            </motion.div>
          ) : (
            sorted.map((ev, i) => {
              const cfg = EVENT_CONFIG[ev.event_type] || { label: ev.event_type, color: "var(--text-muted)", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-white/[0.03]"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cfg.color}15` }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: cfg.color }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cfg.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {ev.device_name} <span style={{ color: "var(--text-muted)" }}>&middot;</span> <span style={{ color: cfg.color }}>{cfg.label}</span>
                    </p>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>{timeAgo(ev.created_at)}</span>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
