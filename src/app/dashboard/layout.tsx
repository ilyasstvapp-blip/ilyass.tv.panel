import Sidebar from "@/components/dashboard/Sidebar"
import { ThemeProvider } from "@/contexts/ThemeContext"

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme="dark">
      <div
        data-theme="dark"
        className="min-h-screen flex"
        style={{ background: "var(--bg-primary)" }}
      >
        <Sidebar />
        <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
          {children}
        </div>
      </div>
    </ThemeProvider>
  )
}
