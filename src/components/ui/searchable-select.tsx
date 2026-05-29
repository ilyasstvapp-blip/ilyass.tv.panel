"use client"

import { useState, useRef, useEffect } from "react"

interface Option {
  value: string
  label: string
  subtitle?: string
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found",
  className = "",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = options.filter(
    (o) => !search || o.label.toLowerCase().includes(search.toLowerCase()) || o.subtitle?.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
        style={{
          background: "var(--bg-secondary)",
          border: open ? "1px solid var(--accent)" : "1px solid var(--border)",
          color: selected ? "var(--text-primary)" : "var(--text-muted)",
        }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden shadow-2xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            maxHeight: "280px",
          }}
        >
          <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-xs text-center" style={{ color: "var(--text-muted)" }}>
                {emptyMessage}
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm transition-all flex items-center justify-between"
                  style={{
                    background: opt.value === value ? "rgba(34,211,238,0.08)" : "transparent",
                    color: opt.value === value ? "var(--accent)" : "var(--text-primary)",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <span className="block truncate">{opt.label}</span>
                    {opt.subtitle && (
                      <span className="block text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                        {opt.subtitle}
                      </span>
                    )}
                  </div>
                  {opt.value === value && (
                    <svg className="w-4 h-4 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
