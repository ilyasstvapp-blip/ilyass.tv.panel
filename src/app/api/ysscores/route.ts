import { NextResponse } from "next/server"

const BASE = "https://api-ar.ysscores.com/api/matches"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const matchId = searchParams.get("matchId")

    if (date) {
      const res = await fetch(`${BASE}/matches_date_get/${date}/null/null/null`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      })
      if (!res.ok) throw new Error(`YSScores API error: ${res.status}`)
      const json = await res.json()
      const matches = (json.data || []).map((m: Record<string, unknown>) => {
        const homeTeam = m.home_team as Record<string, string> | undefined
        const awayTeam = m.away_team as Record<string, string> | undefined
        const championship = m.championship as Record<string, string> | undefined
        return {
          match_id: m.match_id,
          league: championship?.title || "",
          league_image: championship?.image || "",
          home_team: homeTeam?.title || "",
          home_logo: homeTeam?.image || "",
          away_team: awayTeam?.title || "",
          away_logo: awayTeam?.image || "",
          match_date: m.match_date,
          match_time: m.match_time,
          match_timestamp: m.match_timestamp,
          live: m.live,
          status: m.status,
          home_scores: m.home_scores,
          away_scores: m.away_scores,
          channel_commm: m.channel_commm || [],
        }
      })
      return NextResponse.json({ matches })
    }

    if (matchId) {
      const res = await fetch(`${BASE}/match_info/${matchId}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      })
      if (!res.ok) throw new Error(`YSScores API error: ${res.status}`)
      const json = await res.json()
      const d = json.data as Record<string, unknown> | undefined
      if (!d) return NextResponse.json({ error: "Match not found" }, { status: 404 })

      const homeTeam = d.home_team as Record<string, string> | undefined
      const awayTeam = d.away_team as Record<string, string> | undefined
      const championship = d.championship as Record<string, string> | undefined
      const channelComms = (d.channel_commm as Array<Record<string, unknown>>) || []

      const firstChannel = channelComms.length > 0
        ? { channel_name: channelComms[0].channel_name as string || "", commentator_name: channelComms[0].commentator_name as string || "" }
        : { channel_name: "", commentator_name: "" }

      return NextResponse.json({
        match: {
          match_id: d.match_id,
          league: championship?.title || "",
          league_image: championship?.image || "",
          home_team: homeTeam?.title || "",
          home_full_title: homeTeam?.full_title || "",
          home_logo: homeTeam?.image || "",
          away_team: awayTeam?.title || "",
          away_full_title: awayTeam?.full_title || "",
          away_logo: awayTeam?.image || "",
          match_date: d.match_date,
          match_time: d.match_time,
          match_timestamp: d.match_timestamp,
          stadium: d.Stadium || "",
          referee: (d.referees as Record<string, string> | undefined)?.title || "",
          round: d.round || "",
          channel_name: firstChannel.channel_name,
          commentator: firstChannel.commentator_name,
          channels: channelComms.map((c: Record<string, unknown>) => ({
            channel_name: c.channel_name as string || "",
            commentator_name: c.commentator_name as string || "",
          })),
        },
      })
    }

    return NextResponse.json({ error: "Provide date or matchId" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch" }, { status: 500 })
  }
}
