"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/packages": "Packages",
  "/dashboard/channels": "Channels",
  "/dashboard/events": "Live Events",
  "/dashboard/apps": "App Systems",
  "/dashboard/devices": "Device Sessions",
  "/dashboard/settings": "Settings",
}

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Packages", href: "/dashboard/packages" },
  { label: "Channels", href: "/dashboard/channels" },
  { label: "Live Events", href: "/dashboard/events" },
  { label: "App Systems", href: "/dashboard/apps" },
  { label: "Device Sessions", href: "/dashboard/devices" },
  { label: "Settings", href: "/dashboard/settings" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-primary)" }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {titles[pathname] || "Dashboard"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ background: "var(--accent-gradient)" }}
            >
              A
            </div>
            <span className="hidden sm:inline" style={{ color: "var(--text-secondary)" }}>
              Admin
            </span>
          </div>

          <button
            onClick={signOut}
            className="text-sm flex items-center gap-1 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--error)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden p-4"
          style={{
            background: "var(--bg-secondary)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: active ? "var(--accent-subtle)" : "transparent",
                    color: active ? "var(--accent-light)" : "var(--text-muted)",
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
