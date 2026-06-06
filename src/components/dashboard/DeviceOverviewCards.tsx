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

const cards = [
  { key: "total_devices", label: "Total Devices", color: "var(--accent-cyan)", gradient: "var(--gradient-cyan)", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { key: "online_devices", label: "Online Devices", color: "var(--accent-green)", gradient: "var(--gradient-green)", icon: "M5 13l4 4L19 7" },
  { key: "offline_devices", label: "Offline Devices", color: "var(--text-muted)", gradient: "var(--gradient-orange)", icon: "M6 18L18 6M6 6l12 12" },
  { key: "new_today", label: "New Today", color: "var(--accent-purple)", gradient: "var(--gradient-purple)", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
  { key: "new_this_week", label: "New This Week", color: "var(--accent-pink)", gradient: "var(--gradient-pink)", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "active_devices", label: "Active Devices", color: "var(--accent-orange)", gradient: "var(--gradient-orange)", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { key: "watching_streams", label: "Watching Streams", color: "var(--accent-cyan)", gradient: "var(--gradient-blue)", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { key: "in_player", label: "Devices In Player", color: "var(--accent-pink)", gradient: "var(--gradient-pink)", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
]

export default function DeviceOverviewCards({ data, loading }: { data: Record<string, number> | null; loading: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, i) => (
        <div
          key={card.key}
          className="relative overflow-hidden group rounded-2xl p-[1px]"
          style={{ background: `linear-gradient(135deg, ${card.color}30, transparent 60%)` }}
        >
          <div className="rounded-2xl p-5 h-full" style={{ background: "var(--surface)" }}>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: `${card.color}18` }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: card.color }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                  </svg>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${card.color}12`, color: card.color, border: `1px solid ${card.color}20` }}>
                  Live
                </span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: card.color }}>
                {loading ? <span style={{ color: card.color }}>&mdash;</span> : <AnimatedCounter value={data?.[card.key] ?? 0} color={card.color} />}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>{card.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
