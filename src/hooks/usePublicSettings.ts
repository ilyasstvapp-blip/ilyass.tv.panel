"use client"

import { useState, useEffect } from "react"
import { fetchSetting } from "@/lib/services/settings"

export interface AppCard {
  id: string
  name: string
  platform: string
  version: string
  apkUrl: string
  apkFile: string | null
  banner: string
  screenshots: string[]
  changelog: string
  description: string
}

export interface HomepageContent {
  title?: string
  subtitle?: string
  banner?: string
}

export interface FeatureItem {
  id: string
  title: string
  description: string
}

export interface FooterContent {
  description?: string
  email?: string
  social?: {
    telegram?: string
    whatsapp?: string
    website?: string
  }
}

interface PublicSettings {
  homePage: HomepageContent | null
  appCards: AppCard[]
  features: FeatureItem[]
  footerContent: FooterContent | null
  loading: boolean
  primaryApp: AppCard | null
}

export function usePublicSettings(): PublicSettings {
  const [homePage, setHomePage] = useState<HomepageContent | null>(null)
  const [appCards, setAppCards] = useState<AppCard[]>([])
  const [features, setFeatures] = useState<FeatureItem[]>([])
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [hp, cards, feats, footer] = await Promise.all([
          fetchSetting("homepage"),
          fetchSetting("app_cards"),
          fetchSetting("features"),
          fetchSetting("footer"),
        ])
        if (cancelled) return
        if (hp) setHomePage(hp as HomepageContent)
        if (Array.isArray(cards)) setAppCards(cards as AppCard[])
        if (Array.isArray(feats)) setFeatures(feats as FeatureItem[])
        if (footer) setFooterContent(footer as FooterContent)
      } catch {
        // silently fail — use defaults
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const primaryApp = appCards.find((c) => c.platform === "Android Mobile") || appCards[0] || null

  return { homePage, appCards, features, footerContent, loading, primaryApp }
}
