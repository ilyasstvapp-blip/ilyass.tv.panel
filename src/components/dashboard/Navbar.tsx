"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/packages": "Packages",
  "/dashboard/channels": "Channels",
  "/dashboard/events": "Live Events",
  "/dashboard/apps": "App Systems",
  "/dashboard/devices": "Device Sessions",
  "/dashboard/settings": "Settings",
  "/dashboard/iptv-order": "IPTV Ordering",
}

export default function Navbar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent("toggle-sidebar"))
  }

  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 xl:px-8">
        <div className="flex items-center gap-4">
          {/* Visible below 1200px (tablet + mobile) */}
          <button
            onClick={toggleSidebar}
            className="xl:hidden p-2.5 rounded-xl transition-all duration-200 hover:bg-surface-hover"
            style={{ color: "var(--text-primary)" }}
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {titles[pathname] || "Dashboard"}
            </h1>
            <p className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
              ILYASS TV Control Panel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl"
            style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)" }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ background: "var(--accent-gradient)" }}
            >
              A
            </div>
            <span className="text-sm font-medium hidden sm:inline" style={{ color: "var(--text-secondary)" }}>
              Admin
            </span>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
            style={{ color: "var(--text-muted)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
