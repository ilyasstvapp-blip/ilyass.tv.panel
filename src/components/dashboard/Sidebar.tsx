"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const navGroups = [
  {
    label: "Main",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
      },
      {
        label: "Packages",
        href: "/dashboard/packages",
        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      },
      {
        label: "Channels",
        href: "/dashboard/channels",
        icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Live Events",
        href: "/dashboard/events",
        icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
      },
      {
        label: "Auto Import",
        href: "/dashboard/live-events-import",
        icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L5 8m4-4v12",
      },
      {
        label: "App Systems",
        href: "/dashboard/apps",
        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      },
      {
        label: "IPTV Ordering",
        href: "/dashboard/iptv-order",
        icon: "M4 6h16M4 12h16M4 18h16",
      },
    ],
  },
  {
    label: "Device Intelligence",
    items: [
      {
        label: "Intelligence Center",
        href: "/dashboard/device-intelligence",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      },
      {
        label: "Device Sessions",
        href: "/dashboard/devices",
        icon: "M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      },
    ],
  },
]

const sidebarStyle: Record<string, React.CSSProperties> = {
  container: {
    background: "linear-gradient(180deg, #08082a 0%, #0a0a30 40%, #0c0c34 100%)",
    borderRight: "1px solid rgba(34,211,238,0.08)",
    boxShadow: "4px 0 24px rgba(0,0,0,0.3), inset -1px 0 0 rgba(34,211,238,0.04)",
  },
}

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(v => !v)
    window.addEventListener("toggle-sidebar", handler)
    return () => window.removeEventListener("toggle-sidebar", handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />

      {/* Desktop sidebar (1200px+) */}
      <aside
        className="sidebar-desktop flex-col"
        style={{
          ...sidebarStyle.container,
          width: collapsed ? "72px" : "260px",
          position: "fixed",
          left: 0, top: 0, bottom: 0,
          zIndex: 40,
          transition: "width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      >
        <SidebarInner collapsed={collapsed} pathname={pathname} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-14 transition-all duration-200 group"
          style={{
            color: "var(--text-muted)",
            borderTop: "1px solid rgba(34,211,238,0.06)",
            background: "rgba(8,8,42,0.4)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <svg
              className={`w-[18px] h-[18px] transition-all duration-300 ${collapsed ? "" : "rotate-180"} group-hover:text-accent`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </div>
        </button>
      </aside>

      {/* Tablet / Mobile drawer */}
      <aside
        className={`sidebar-drawer flex-col ${open ? "open" : ""}`}
        style={sidebarStyle.container}
      >
        <SidebarInner collapsed={false} pathname={pathname} />
      </aside>
    </>
  )
}

function SidebarInner({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-3 px-5 h-[68px] shrink-0"
        style={{
          borderBottom: "1px solid rgba(34,211,238,0.08)",
          background: "rgba(8,8,42,0.6)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #22d3ee, #6366f1)",
            boxShadow: "0 2px 12px rgba(34,211,238,0.25)",
          }}
        >
          <div className="absolute inset-0 bg-white/10" />
          IT
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            ILYASS{" "}
            <span style={{ color: "var(--accent)", textShadow: "0 0 12px rgba(34,211,238,0.3)" }}>
              TV
            </span>
          </motion.span>
        )}
      </div>

      <nav className="flex-1 p-3 overflow-y-auto space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && <p className="sidebar-section-label">{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                    style={{
                      color: isActive ? "var(--accent-light)" : "rgba(200,200,230,0.55)",
                    }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                        style={{
                          background: "linear-gradient(180deg, #22d3ee, #6366f1)",
                          boxShadow: "0 0 8px rgba(34,211,238,0.4)",
                        }}
                      />
                    )}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(99,102,241,0.08))"
                          : "rgba(255,255,255,0.03)",
                        border: isActive
                          ? "1px solid rgba(34,211,238,0.15)"
                          : "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <svg
                        className="w-[18px] h-[18px]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{
                          color: isActive ? "var(--accent)" : "rgba(200,200,230,0.4)",
                          filter: isActive ? "drop-shadow(0 0 4px rgba(34,211,238,0.3))" : "none",
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    {!collapsed && <span className="truncate tracking-wide">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
