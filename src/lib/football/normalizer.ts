export interface NormalizedMatch {
  team1_name: string
  team2_name: string
  team1_logo: string | null
  team2_logo: string | null
  league: string
  country: string
  match_time: string | null
  commentator: string
  channel_name: string
  status: string
  raw: Record<string, unknown>
}

function pick<T>(obj: Record<string, unknown>, keys: string[], fallback: T): T {
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null && v !== "") return v as T
  }
  return fallback
}

function pickStr(obj: Record<string, unknown>, keys: string[], fallback = ""): string {
  const v = pick<string>(obj, keys, fallback)
  return typeof v === "string" ? v.trim() : String(v ?? fallback)
}

function pickLogo(obj: Record<string, unknown>, keys: string[]): string | null {
  const v = pick<string>(obj, keys, "")
  if (!v || typeof v !== "string") return null
  const trimmed = v.trim()
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null
  try { new URL(trimmed); return trimmed } catch { return trimmed }
}

export function normalizeMatch(raw: Record<string, unknown>): NormalizedMatch {
  const team1 = pickStr(raw, ["team1", "homeTeam", "home_team", "home", "team1_name", "home_name", "localteam_name", "localTeam", "local"])
  const team2 = pickStr(raw, ["team2", "awayTeam", "away_team", "away", "team2_name", "away_name", "visitorteam_name", "visitorTeam", "visitor"])
  const logo1 = pickLogo(raw, ["team1_logo", "homeLogo", "home_logo", "team1_logo_url", "homeTeamLogo", "home_team_logo", "localteam_logo"])
  const logo2 = pickLogo(raw, ["team2_logo", "awayLogo", "away_logo", "team2_logo_url", "awayTeamLogo", "away_team_logo", "visitorteam_logo"])
  const league = pickStr(raw, ["league", "competition", "tournament", "league_name", "competition_name", "tournament_name", "leagueName", "competitionName"])
  const country = pickStr(raw, ["country", "country_name", "countryName"])
  const matchTime = pickStr(raw, ["date", "match_time", "kickoff", "time", "start_time", "startTime", "matchTime", "event_date", "eventDate", "event_time", "eventTime"]) || null
  const commentator = pickStr(raw, ["commentator", "commentators", "caster", "casters"])
  const channel = pickStr(raw, ["channel_name", "channel", "broadcaster", "tv_channel", "tvChannel", "stream_channel", "streamChannel"])
  const status = pickStr(raw, ["status", "match_status", "state", "matchState", "event_status", "eventStatus"])

  return {
    team1_name: team1 || "Unknown Team",
    team2_name: team2 || "Unknown Team",
    team1_logo: logo1,
    team2_logo: logo2,
    league: league || "Unknown League",
    country,
    match_time: matchTime,
    commentator,
    channel_name: channel,
    status,
    raw,
  }
}

export function normalizeMatches(data: unknown): NormalizedMatch[] {
  if (!data) return []
  if (Array.isArray(data)) {
    return data.map((m) => normalizeMatch(typeof m === "object" && m ? (m as Record<string, unknown>) : {}))
  }
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>
    if (obj.matches && Array.isArray(obj.matches)) {
      return normalizeMatches(obj.matches)
    }
    if (obj.data && Array.isArray(obj.data)) {
      return normalizeMatches(obj.data)
    }
    if (obj.result && Array.isArray(obj.result)) {
      return normalizeMatches(obj.result)
    }
    if (obj.events && Array.isArray(obj.events)) {
      return normalizeMatches(obj.events)
    }
    if (obj.response && Array.isArray(obj.response)) {
      return normalizeMatches(obj.response)
    }
    const values = Object.values(obj)
    if (values.length > 0 && typeof values[0] === "object") {
      return normalizeMatches(values)
    }
  }
  return []
}
