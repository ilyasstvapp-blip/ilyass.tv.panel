"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AnalyticsModalProps {
  open: boolean
  onClose: () => void
  type: "country" | "city" | "isp" | "version" | "connection"
  title: string
  data: any[]
  extraData?: Record<string, any>
  totalDevices?: number
}

const COUNTRY_ICON = "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
const CITY_ICON = "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
const ISP_ICON = "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
const VERSION_ICON = "M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5 5 5M12 5v10"
const CONNECTION_ICON = "M5 12a10 10 0 0114 0M8 9a6 6 0 018 0M11 6a2 2 0 012 0"
const X_ICON = "M6 18L18 6M6 6l12 12"
const CHEVRON_DOWN = "M19 9l-7 7-7-7"
const CHEVRON_UP = "M5 15l7-7 7 7"
const GLOBE_ICON = "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
const WIFI_ICON = "M5 12a10 10 0 0114 0M8 9a6 6 0 018 0M11 6a2 2 0 012 0"
const MOBILE_DATA_ICON = "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zM8 9h8M8 13h6M8 17h4"
const ETHERNET_ICON = "M8 9l3 3-3 3m5 0h3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"

const TYPE_ICONS: Record<string, string> = {
  country: COUNTRY_ICON,
  city: CITY_ICON,
  isp: ISP_ICON,
  version: VERSION_ICON,
  connection: CONNECTION_ICON,
}

const TYPE_ACCENTS: Record<string, string> = {
  country: "var(--accent-cyan)",
  city: "var(--accent-purple)",
  isp: "var(--accent-orange)",
  version: "var(--accent-pink)",
  connection: "var(--accent-green)",
}

const CONNECTION_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  wifi: { label: "WiFi", color: "var(--accent-cyan)", icon: WIFI_ICON },
  mobile_data: { label: "Mobile Data", color: "var(--accent-purple)", icon: MOBILE_DATA_ICON },
  ethernet: { label: "Ethernet", color: "var(--accent-orange)", icon: ETHERNET_ICON },
}

function AnimatedBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  return (
    <div className="flex-1 h-2 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  )
}

function BarItem({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.08 * index }}
      className="flex items-center gap-3 py-1.5"
    >
      {children}
    </motion.div>
  )
}

function ModalSummary({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-center gap-6 pt-4 mt-4 text-xs font-medium"
      style={{ borderTop: "1px solid var(--border)", color: "var(--text-secondary)" }}
    >
      {children}
    </div>
  )
}

function CountryModal({ data, extraData, totalDevices }: { data: any[]; extraData?: Record<string, any>; totalDevices?: number }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const sorted = useMemo(() => [...data].sort((a, b) => (b.count || 0) - (a.count || 0)), [data])
  const totalCount = totalDevices ?? sorted.reduce((s, d) => s + (d.count || 0), 0)

  return (
    <>
      <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-0.5">
        {sorted.map((item, i) => {
          const pct = totalCount > 0 ? ((item.count || 0) / totalCount) * 100 : 0
          const isExpanded = expanded === item.country || expanded === item.country_code
          const cityBreakdown = extraData?.cityBreakdown?.[item.country] || extraData?.cityBreakdown?.[item.country_code]
          return (
            <div key={item.country || item.country_code || i}>
              <BarItem index={i}>
                <span className="text-xs font-medium w-4 shrink-0" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent-cyan)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={GLOBE_ICON} />
                </svg>
                <span className="text-xs font-medium w-24 truncate" style={{ color: "var(--text-primary)" }}>
                  {item.country || item.country_code || "Unknown"}
                </span>
                <AnimatedBar pct={pct} color="var(--accent-cyan)" delay={0.08 * i} />
                <span className="text-xs font-semibold w-12 text-right" style={{ color: "var(--text-secondary)" }}>{item.count || 0}</span>
                <span className="text-[10px] w-10 text-right" style={{ color: "var(--text-muted)" }}>{pct.toFixed(1)}%</span>
                {cityBreakdown && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : item.country || item.country_code)}
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0 hover:bg-white/[0.06] transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? CHEVRON_UP : CHEVRON_DOWN} />
                    </svg>
                  </button>
                )}
              </BarItem>
              {cityBreakdown && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden ml-10 pl-4 border-l-2 mb-1"
                  style={{ borderColor: "var(--border)" }}
                >
                  {cityBreakdown.map((city: any, ci: number) => {
                    const cityPct = totalCount > 0 ? ((city.count || 0) / totalCount) * 100 : 0
                    return (
                      <div key={ci} className="flex items-center gap-2 py-1">
                        <span className="text-[10px] w-20 truncate" style={{ color: "var(--text-muted)" }}>{city.city || "Unknown"}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cityPct}%` }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 * ci }}
                            className="h-full rounded-full"
                            style={{ background: "var(--accent-cyan)" }}
                          />
                        </div>
                        <span className="text-[10px] w-8 text-right" style={{ color: "var(--text-secondary)" }}>{city.count || 0}</span>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
      <ModalSummary>
        <span>{sorted.length} {sorted.length === 1 ? "Country" : "Countries"}</span>
        <span>{totalCount.toLocaleString()} devices</span>
      </ModalSummary>
    </>
  )
}

function CityModal({ data, totalDevices }: { data: any[]; totalDevices?: number }) {
  const sorted = useMemo(() => [...data].sort((a, b) => (b.count || 0) - (a.count || 0)), [data])
  const totalCount = totalDevices ?? sorted.reduce((s, d) => s + (d.count || 0), 0)
  const uniqueCities = new Set(sorted.map((d) => d.city || d.name)).size

  return (
    <>
      <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-0.5">
        {sorted.map((item, i) => {
          const pct = totalCount > 0 ? ((item.count || 0) / totalCount) * 100 : 0
          return (
            <BarItem key={item.city || item.name || i} index={i}>
              <span className="text-xs font-medium w-4 shrink-0" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent-purple)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={CITY_ICON} />
              </svg>
              <span className="text-xs font-medium flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                {item.city || item.name || "Unknown"}
              </span>
              <AnimatedBar pct={pct} color="var(--accent-purple)" delay={0.08 * i} />
              <span className="text-xs font-semibold w-12 text-right" style={{ color: "var(--text-secondary)" }}>{item.count || 0}</span>
              <span className="text-[10px] w-10 text-right" style={{ color: "var(--text-muted)" }}>{pct.toFixed(1)}%</span>
            </BarItem>
          )
        })}
      </div>
      <ModalSummary>
        <span>{uniqueCities} {uniqueCities === 1 ? "City" : "Cities"}</span>
        <span>{totalCount.toLocaleString()} devices</span>
      </ModalSummary>
    </>
  )
}

function ISpModal({ data, extraData }: { data: any[]; extraData?: Record<string, any> }) {
  const sorted = useMemo(() => [...data].sort((a, b) => (b.count || 0) - (a.count || 0)), [data])
  const totalISPCount = sorted.length

  return (
    <>
      <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-2">
        {sorted.map((item, i) => {
          const online = item.online ?? extraData?.onlineBreakdown?.[item.isp || item.name]?.online ?? 0
          const offline = item.offline ?? extraData?.onlineBreakdown?.[item.isp || item.name]?.offline ?? 0
          const total = item.count || online + offline || 0
          const onlineRatio = total > 0 ? (online / total) * 100 : 0
          return (
            <BarItem key={item.isp || item.name || i} index={i}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--accent-orange)15" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent-orange)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ISP_ICON} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate max-w-[140px]" style={{ color: "var(--text-primary)" }}>
                    {item.isp || item.name || "Unknown"}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{total}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent-green)" }} />
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{online}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: "var(--bg-tertiary)" }} />
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{offline}</span>
                  </div>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${onlineRatio}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 * i }}
                      className="h-full rounded-full"
                      style={{ background: onlineRatio > 50 ? "var(--accent-green)" : "var(--accent-orange)" }}
                    />
                  </div>
                </div>
              </div>
            </BarItem>
          )
        })}
      </div>
      <ModalSummary>
        <span>{totalISPCount} {totalISPCount === 1 ? "ISP" : "ISPs"}</span>
      </ModalSummary>
    </>
  )
}

function VersionModal({ data, totalDevices }: { data: any[]; totalDevices?: number }) {
  const sorted = useMemo(() => [...data].sort((a, b) => (b.count || 0) - (a.count || 0)), [data])
  const totalCount = totalDevices ?? sorted.reduce((s, d) => s + (d.count || 0), 0)
  const mostUsed = sorted[0]
  const mostUsedPct = totalCount > 0 && mostUsed ? ((mostUsed.count || 0) / totalCount) * 100 : 0
  const versionCount = sorted.length

  return (
    <>
      {mostUsed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 p-4 rounded-xl text-center"
          style={{ background: "var(--accent-pink)10", border: "1px solid var(--accent-pink)20" }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Most Used Version</p>
          <p className="text-lg font-bold" style={{ color: "var(--accent-pink)" }}>{mostUsed.version || mostUsed.name || "Unknown"}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {mostUsed.count?.toLocaleString()} devices &middot; {mostUsedPct.toFixed(1)}%
          </p>
        </motion.div>
      )}
      <div className="max-h-[40vh] overflow-y-auto pr-1 space-y-0.5">
        {sorted.map((item, i) => {
          const pct = totalCount > 0 ? ((item.count || 0) / totalCount) * 100 : 0
          return (
            <BarItem key={item.version || item.name || i} index={i}>
              <span className="text-xs font-medium w-4 shrink-0" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
              <span className="text-xs font-medium flex-1 truncate" style={{ color: i === 0 ? "var(--accent-pink)" : "var(--text-primary)" }}>
                {item.version || item.name || "Unknown"}
              </span>
              <AnimatedBar pct={pct} color={i === 0 ? "var(--accent-pink)" : "var(--text-secondary)"} delay={0.06 * i} />
              <span className="text-xs font-semibold w-12 text-right" style={{ color: "var(--text-secondary)" }}>{item.count || 0}</span>
              <span className="text-[10px] w-10 text-right" style={{ color: "var(--text-muted)" }}>{pct.toFixed(1)}%</span>
            </BarItem>
          )
        })}
      </div>
      {sorted.length > 0 && (() => {
        const latestCount = sorted[0]?.count || 0
        const adoptionRate = totalCount > 0 ? (latestCount / totalCount) * 100 : 0
        return (
          <ModalSummary>
            <span>{versionCount} {versionCount === 1 ? "Version" : "Versions"}</span>
            <span>{totalCount.toLocaleString()} installs</span>
            <span>{adoptionRate.toFixed(0)}% adoption</span>
          </ModalSummary>
        )
      })()}
    </>
  )
}

function ConnectionModal({ data }: { data: any[] }) {
  const sorted = useMemo(() => [...data].sort((a, b) => (b.count || 0) - (a.count || 0)), [data])
  const totalCount = sorted.reduce((s, d) => s + (d.count || 0), 0)

  return (
    <>
      <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-1">
        {sorted.map((item, i) => {
          const cfg = CONNECTION_CONFIG[item.type] || { label: item.type || "Unknown", color: "var(--text-muted)", icon: WIFI_ICON }
          const pct = totalCount > 0 ? ((item.count || 0) / totalCount) * 100 : 0
          return (
            <BarItem key={item.type || i} index={i}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cfg.color}15` }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: cfg.color }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cfg.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{cfg.label}</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{item.count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AnimatedBar pct={pct} color={cfg.color} delay={0.08 * i} />
                  <span className="text-[10px] w-10 text-right" style={{ color: "var(--text-muted)" }}>{pct.toFixed(0)}%</span>
                </div>
              </div>
            </BarItem>
          )
        })}
      </div>
      <div className="flex items-center justify-center gap-4 pt-4 mt-4" style={{ borderTop: "1px solid var(--border)" }}>
        {sorted.map((item) => {
          const cfg = CONNECTION_CONFIG[item.type] || { label: item.type || "Unknown", color: "var(--text-muted)", icon: WIFI_ICON }
          const pct = totalCount > 0 ? (item.count / totalCount) * 100 : 0
          return (
            <div key={item.type} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{cfg.label} {pct.toFixed(0)}%</span>
            </div>
          )
        })}
      </div>
      <ModalSummary>
        <span>{sorted.length} {sorted.length === 1 ? "Type" : "Types"}</span>
        <span>{totalCount.toLocaleString()} connections</span>
      </ModalSummary>
    </>
  )
}

export default function AnalyticsModal({ open, onClose, type, title, data, extraData, totalDevices }: AnalyticsModalProps) {
  const accent = TYPE_ACCENTS[type] || "var(--accent)"

  const renderContent = () => {
    switch (type) {
      case "country":
        return <CountryModal data={data} extraData={extraData} totalDevices={totalDevices} />
      case "city":
        return <CityModal data={data} totalDevices={totalDevices} />
      case "isp":
        return <ISpModal data={data} extraData={extraData} />
      case "version":
        return <VersionModal data={data} totalDevices={totalDevices} />
      case "connection":
        return <ConnectionModal data={data} />
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-0 md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="pointer-events-auto w-full md:max-w-2xl md:mx-auto flex flex-col overflow-hidden md:rounded-2xl"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-2xl)",
                maxHeight: "100vh",
                height: "100%",
                borderTopLeftRadius: "var(--radius-xl)",
                borderTopRightRadius: "var(--radius-xl)",
              }}
            >
              <div className="h-1 shrink-0" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
              <div className="flex items-center justify-between p-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}15` }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: accent }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={TYPE_ICONS[type] || COUNTRY_ICON} />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{type.charAt(0).toUpperCase() + type.slice(1)} Analytics</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={X_ICON} />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-5">
                {renderContent()}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
