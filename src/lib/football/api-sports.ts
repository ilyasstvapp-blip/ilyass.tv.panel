const API_BASE = "https://v3.football.api-sports.io"

export interface ApiSportsFixture {
  fixture: {
    id: number
    date: string
    status: { short: string; long: string }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
  }
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
  goals: { home: number | null; away: number | null }
}

export interface ApiSportsLeague {
  league: {
    id: number
    name: string
    type: string
    logo: string
  }
  country: { name: string; code: string; flag: string }
}

export interface NormalizedFixture {
  home_team_name: string
  away_team_name: string
  home_team_logo: string | null
  away_team_logo: string | null
  match_time: string
  match_date: string
  league_name: string
  league_id: number
  league_logo: string | null
  country: string
  status: string
  fixture_id: number
}

export const DEFAULT_LEAGUES: { id: number; name: string }[] = [
  { id: 39, name: "Premier League" },
  { id: 140, name: "La Liga" },
  { id: 135, name: "Serie A" },
  { id: 78, name: "Bundesliga" },
  { id: 61, name: "Ligue 1" },
  { id: 2, name: "Champions League" },
  { id: 3, name: "Europa League" },
]

export function loadLeagueIds(enabledNames: string[]): number[] {
  return DEFAULT_LEAGUES.filter((l) => enabledNames.includes(l.name)).map((l) => l.id)
}

export function normalizeFixture(f: ApiSportsFixture): NormalizedFixture {
  return {
    home_team_name: f.teams.home.name,
    away_team_name: f.teams.away.name,
    home_team_logo: f.teams.home.logo || null,
    away_team_logo: f.teams.away.logo || null,
    match_time: f.fixture.date,
    match_date: f.fixture.date.slice(0, 10),
    league_name: f.league.name,
    league_id: f.league.id,
    league_logo: f.league.logo || null,
    country: f.league.country || "",
    status: f.fixture.status.short,
    fixture_id: f.fixture.id,
  }
}

export function normalizeFixtures(fixtures: ApiSportsFixture[]): NormalizedFixture[] {
  return fixtures.map(normalizeFixture)
}

// In-memory cache
const cache = new Map<string, { data: unknown; expiry: number }>()

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry || Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCache(key: string, data: unknown, ttlMs = 60000) {
  cache.set(key, { data, expiry: Date.now() + ttlMs })
}

export async function fetchFromApiSports(
  endpoint: string,
  apiKey: string,
  params: Record<string, string> = {},
  cacheTtl = 30000,
): Promise<unknown> {
  const qs = new URLSearchParams(params).toString()
  const cacheKey = `${endpoint}?${qs}`

  const cached = getCached<unknown>(cacheKey)
  if (cached) return cached

  const url = `${API_BASE}${endpoint}${qs ? `?${qs}` : ""}`
  const res = await fetch(url, {
    headers: {
      "x-apisports-key": apiKey,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    if (res.status === 403) throw new Error("Invalid API key or rate limit exceeded")
    if (res.status === 429) throw new Error("API rate limit reached. Try again later")
    throw new Error(`API-Football responded with ${res.status}`)
  }

  const data = await res.json()
  setCache(cacheKey, data, cacheTtl)
  return data
}

export async function fetchLeagues(apiKey: string): Promise<ApiSportsLeague[]> {
  const data = (await fetchFromApiSports("/leagues", apiKey, { current: "true" }, 300000)) as {
    response: ApiSportsLeague[]
  }
  return data?.response || []
}

export async function fetchFixtures(
  apiKey: string,
  params: { date?: string; league?: string; season?: string; live?: string },
): Promise<ApiSportsFixture[]> {
  const queryParams: Record<string, string> = {}
  if (params.date) queryParams.date = params.date
  if (params.league) queryParams.league = params.league
  if (params.season) queryParams.season = params.season
  if (params.live) queryParams.live = params.live

  const data = (await fetchFromApiSports("/fixtures", apiKey, queryParams, 30000)) as {
    response: ApiSportsFixture[]
  }
  return data?.response || []
}

export async function fetchLeaguesInfo(
  apiKey: string,
  leagueIds: number[],
): Promise<Map<number, ApiSportsLeague>> {
  const map = new Map<number, ApiSportsLeague>()
  for (const id of leagueIds) {
    try {
      const data = (await fetchFromApiSports("/leagues", apiKey, { id: String(id) }, 300000)) as {
        response: ApiSportsLeague[]
      }
      if (data?.response?.[0]) map.set(id, data.response[0])
    } catch {} // skip errors for individual leagues
  }
  return map
}
