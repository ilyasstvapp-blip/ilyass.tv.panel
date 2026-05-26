"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div
      data-theme="dark"
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        <div className="card p-8" style={{ background: "var(--surface)" }}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4"
              style={{ background: "var(--accent-gradient)" }}>
              IT
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Admin Login
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Sign in to manage ILYASS TV
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ilyasstv.com"
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {error && (
              <p className="text-sm px-4 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "var(--error)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 gradient-btn"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            &larr; Back to homepage
          </a>
        </p>
      </div>
    </div>
  )
}
