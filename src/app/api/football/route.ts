import { NextResponse } from "next/server"
import { normalizeMatches } from "@/lib/football/normalizer"
import type { NormalizedMatch } from "@/lib/football/normalizer"
import { fetchFixtures, normalizeFixtures } from "@/lib/football/api-sports"
import type { NormalizedFixture } from "@/lib/football/api-sports"
import { createClient } from "@supabase/supabase-js"

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

function fixtureToMatch(f: NormalizedFixture): NormalizedMatch {
  return {
    team1_name: f.home_team_name,
    team2_name: f.away_team_name,
    team1_logo: f.home_team_logo,
    team2_logo: f.away_team_logo,
    league: f.league_name,
    country: f.country,
    match_time: f.match_time,
    commentator: "",
    channel_name: "",
    status: f.status,
    raw: {} as Record<string, unknown>,
  }
}

async function getApiSportsKey(): Promise<string | null> {
  try {
    const { data } = await supabase.from("settings").select("value").eq("key", "api_sports_key").single()
    return (data?.value as string) || null
  } catch { return null }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10)
    const league = searchParams.get("league")
    const apiUrl = searchParams.get("api_url")
    const source = searchParams.get("source") || "yallashoottt"

    // ── API-Sports mode ──
    if (source === "api-sports") {
      const apiKey = await getApiSportsKey()
      if (!apiKey) {
        return NextResponse.json(
          { error: "API-Sports key not configured. Add it in Settings.", matches: [], total: 0 },
          { status: 400 },
        )
      }

      const fetchParams: { date?: string; league?: string } = {}
      if (date) fetchParams.date = date
      const enabledLeagues = searchParams.get("enabled_leagues")
      let allFixtures: Awaited<ReturnType<typeof fetchFixtures>> = []

      if (enabledLeagues) {
        const leagueIds = enabledLeagues.split(",").filter(Boolean)
        const results = await Promise.allSettled(
          leagueIds.map((id) => fetchFixtures(apiKey, { date, league: id })),
        )
        for (const r of results) {
          if (r.status === "fulfilled") allFixtures.push(...r.value)
        }
      } else {
        allFixtures = await fetchFixtures(apiKey, fetchParams)
      }

      // Deduplicate by fixture ID
      const seen = new Set<number>()
      const unique = allFixtures.filter((f) => {
        if (seen.has(f.fixture.id)) return false
        seen.add(f.fixture.id)
        return true
      })

      // Sort by league then time
      unique.sort((a, b) => a.league.name.localeCompare(b.league.name) || a.fixture.date.localeCompare(b.fixture.date))

      const normalized = normalizeFixtures(unique)
      const matches = normalized.map(fixtureToMatch)

      return NextResponse.json({
        matches,
        total: matches.length,
        source: "api-sports",
        date,
      })
    }

    // ── Legacy / Custom URL mode ──
    let url: string
    if (apiUrl) {
      url = apiUrl
        .replace(/\{date\}/g, encodeURIComponent(date))
        .replace(/\{league\}/g, league ? encodeURIComponent(league) : "")
    } else {
      url = `https://yallashoottt.online/index.php?ajax_live_matches=${encodeURIComponent(date)}`
      if (league) url += `&league=${encodeURIComponent(league)}`
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json, text/plain, */*",
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`API responded with ${res.status}`)

    const contentType = res.headers.get("content-type") || ""
    let raw: unknown
    if (contentType.includes("application/json")) {
      raw = await res.json()
    } else {
      const text = await res.text()
      try { raw = JSON.parse(text) } catch { throw new Error("Response is not valid JSON") }
    }

    const matches = normalizeMatches(raw)

    return NextResponse.json({
      matches,
      total: matches.length,
      source: apiUrl || "yallashoottt.online",
      date,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch matches"
    const isAbort = e instanceof DOMException && e.name === "AbortError"
    return NextResponse.json(
      { error: isAbort ? "Request timed out" : message, matches: [], total: 0 },
      { status: isAbort ? 504 : 502 },
    )
  }
}
