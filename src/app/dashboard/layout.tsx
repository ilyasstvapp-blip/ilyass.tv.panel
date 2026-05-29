import Sidebar from "@/components/dashboard/Sidebar"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { SettingsProvider } from "@/contexts/SettingsContext"

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme="dark">
      <SettingsProvider>
        <div
          data-theme="dark"
          className="min-h-screen flex overflow-x-hidden"
          style={{ background: "var(--bg-primary)" }}
        >
          <Sidebar />
          <div className="flex-1 min-h-screen flex flex-col overflow-x-hidden"
            style={{ paddingLeft: "0" }}
          >
            <div className="flex-1 flex flex-col xl:ml-[260px] overflow-x-hidden">
              {children}
            </div>
          </div>
        </div>
      </SettingsProvider>
    </ThemeProvider>
  )
}
