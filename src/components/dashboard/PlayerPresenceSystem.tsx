"use client"

import { useState, useEffect } from "react"

function AnimatedCounter({ value, color }: { value: number; color: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const duration = 800
    const steps = 20
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])
  return <span style={{ color }}>{display.toLocaleString()}</span>
}

const CARDS = [
  { key: "watching_now", label: "Watching Now", color: "var(--accent-green)", gradient: "var(--gradient-green)", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
  { key: "buffering_now", label: "Buffering Now", color: "var(--accent-orange)", gradient: "var(--gradient-orange)", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "opens_today", label: "Opens Today", color: "var(--accent-cyan)", gradient: "var(--gradient-cyan)", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "avg_session_minutes", label: "Avg Session (min)", color: "var(--accent-purple)", gradient: "var(--gradient-purple)", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
]

export default function PlayerPresenceSystem({ playerStats, loading }: {
  playerStats: { watching_now: number; buffering_now: number; opens_today: number; avg_session_minutes: number } | null
  loading: boolean
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {CARDS.map((card) => (
        <div key={card.key} className="relative overflow-hidden group rounded-2xl p-[1px]" style={{ background: `linear-gradient(135deg, ${card.color}30, transparent 60%)` }}>
          <div className="rounded-2xl p-5 h-full" style={{ background: "var(--surface)" }}>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}18` }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: card.color }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                  </svg>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${card.color}12`, color: card.color, border: `1px solid ${card.color}20` }}>
                  Live
                </span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: card.color }}>
                {loading ? <span style={{ color: card.color }}>&mdash;</span> : <AnimatedCounter value={playerStats?.[card.key as keyof typeof playerStats] ?? 0} color={card.color} />}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>{card.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
