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

function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: color }} />
    </span>
  )
}

export default function OnlinePresenceDashboard({ data, loading }: { data: { online_now: number, recently_active: number, offline: number } | null; loading: boolean }) {
  const items = [
    { key: "online_now", label: "Online Now", color: "var(--accent-green)", gradient: "var(--gradient-green)" },
    { key: "recently_active", label: "Recently Active", color: "var(--accent-cyan)", gradient: "var(--gradient-cyan)" },
    { key: "offline", label: "Offline", color: "var(--text-muted)", gradient: "var(--gradient-orange)" },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      {items.map((item) => (
        <div key={item.key} className="relative overflow-hidden group rounded-2xl p-[1px]" style={{ background: `linear-gradient(135deg, ${item.color}30, transparent 60%)` }}>
          <div className="rounded-2xl p-5 h-full" style={{ background: "var(--surface)" }}>
            <div className="flex items-start justify-between mb-3">
              <PulseDot color={item.color} />
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${item.color}12`, color: item.color, border: `1px solid ${item.color}20` }}>
                Live
              </span>
            </div>
            <p className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: item.color }}>
              {loading ? <span style={{ color: item.color }}>&mdash;</span> : <AnimatedCounter value={data?.[item.key as keyof typeof data] ?? 0} color={item.color} />}
            </p>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
