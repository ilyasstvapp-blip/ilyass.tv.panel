"use client"

import { createContext, useContext, useEffect } from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "light" })

export function ThemeProvider({
  theme,
  children,
}: {
  theme: Theme
  children: React.ReactNode
}) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    return () => {
      document.documentElement.removeAttribute("data-theme")
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
