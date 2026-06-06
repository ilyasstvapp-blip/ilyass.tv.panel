"use client"

import { motion } from "framer-motion"

export default function DevicesByLocation({ countries, cities, loading, onCountryClick, onCityClick }: {
  countries: Array<{ country: string; count: number; country_code: string | null }> | null
  cities: Array<{ city: string; count: number }> | null
  loading: boolean
  onCountryClick?: () => void
  onCityClick?: () => void
}) {
  const maxCountry = countries && countries.length > 0 ? Math.max(...countries.map(c => c.count)) : 1
  const maxCity = cities && cities.length > 0 ? Math.max(...cities.map(c => c.count)) : 1

  function LocationBar({ name, count, max, color }: { name: string; count: number; max: number; color: string }) {
    const pct = max > 0 ? (count / max) * 100 : 0
    return (
      <div className="flex items-center gap-3 py-1.5">
        <span className="text-xs truncate flex-1" style={{ color: "var(--text-primary)" }}>{name}</span>
        <div className="flex-1 h-2 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full" style={{ background: color }} />
        </div>
        <span className="text-xs font-medium w-10 text-right" style={{ color: "var(--text-secondary)" }}>{count}</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div onClick={onCountryClick}
        className="p-5 transition-all duration-200 hover:-translate-y-0.5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", cursor: onCountryClick ? "pointer" : "default" }}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span className="w-1 h-4 rounded-full" style={{ background: "var(--gradient-purple)" }} />
          Top Countries
        </h3>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 w-16 rounded" style={{ background: "var(--bg-tertiary)" }} />
                <div className="flex-1 h-2 rounded" style={{ background: "var(--bg-tertiary)" }} />
                <div className="h-3 w-6 rounded" style={{ background: "var(--bg-tertiary)" }} />
              </div>
            ))}
          </div>
        ) : countries && countries.length > 0 ? (
          <div className="space-y-1">
            {countries.slice(0, 5).map((c) => (
              <LocationBar key={c.country} name={c.country} count={c.count} max={maxCountry} color="var(--accent-cyan)" />
            ))}
            {countries.length > 5 && (
              <p className="text-[10px] pt-2 text-center" style={{ color: "var(--text-muted)" }}>
                +{countries.length - 5} more countries &mdash; click to view all
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>No country data</p>
        )}
      </div>
      <div onClick={onCityClick}
        className="p-5 transition-all duration-200 hover:-translate-y-0.5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", cursor: onCityClick ? "pointer" : "default" }}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span className="w-1 h-4 rounded-full" style={{ background: "var(--gradient-orange)" }} />
          Top Cities
        </h3>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 w-16 rounded" style={{ background: "var(--bg-tertiary)" }} />
                <div className="flex-1 h-2 rounded" style={{ background: "var(--bg-tertiary)" }} />
                <div className="h-3 w-6 rounded" style={{ background: "var(--bg-tertiary)" }} />
              </div>
            ))}
          </div>
        ) : cities && cities.length > 0 ? (
          <div className="space-y-1">
            {cities.slice(0, 5).map((c) => (
              <LocationBar key={c.city} name={c.city} count={c.count} max={maxCity} color="var(--accent-orange)" />
            ))}
            {cities.length > 5 && (
              <p className="text-[10px] pt-2 text-center" style={{ color: "var(--text-muted)" }}>
                +{cities.length - 5} more cities &mdash; click to view all
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>No city data</p>
        )}
      </div>
    </div>
  )
}
