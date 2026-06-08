import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const league = searchParams.get("league")
    const sortBy = searchParams.get("sortBy") || "match_time"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    let query = supabase.from("live_events").select("*", { count: "exact" })
    if (search) query = query.or(`team1_name.ilike.%${search}%,team2_name.ilike.%${search}%,league.ilike.%${search}%`)
    if (league) query = query.eq("league", league)

    const from = (page - 1) * pageSize
    const { data, error, count } = await query.order(sortBy, { ascending: sortOrder === "asc" }).range(from, from + pageSize - 1)
    if (error) throw error
    return NextResponse.json({ data, count })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "create") {
      if (body.match_id) {
        const { data: existing } = await supabase.from("live_events").select("id").eq("match_id", body.match_id).maybeSingle()
        if (existing) return NextResponse.json({ error: "Duplicate match_id" }, { status: 409 })
      }
      const { data, error } = await supabase.from("live_events").insert({
        team1_name: body.team1_name, team2_name: body.team2_name,
        team1_logo: body.team1_logo ?? null, team2_logo: body.team2_logo ?? null,
        match_time: body.match_time, league: body.league, commentator: body.commentator,
        channel_key: body.channel_key, channel_name: body.channel_name,
        sort_order: body.sort_order ?? 0,
        match_id: body.match_id ?? null,
        is_live: body.is_live ?? false,
        event_status: body.event_status ?? "UPCOMING",
        package_id: body.package_id ?? null,
      }).select().single()
      if (error) throw error
      return NextResponse.json({ data }, { status: 201 })
    }

    if (action === "update") {
      const updates: Record<string, unknown> = {}
      if (body.team1_name !== undefined) updates.team1_name = body.team1_name
      if (body.team2_name !== undefined) updates.team2_name = body.team2_name
      if (body.team1_logo !== undefined) updates.team1_logo = body.team1_logo
      if (body.team2_logo !== undefined) updates.team2_logo = body.team2_logo
      if (body.match_time !== undefined) updates.match_time = body.match_time
      if (body.league !== undefined) updates.league = body.league
      if (body.commentator !== undefined) updates.commentator = body.commentator
      if (body.channel_key !== undefined) updates.channel_key = body.channel_key
      if (body.channel_name !== undefined) updates.channel_name = body.channel_name
      if (body.sort_order !== undefined) updates.sort_order = body.sort_order
      if (body.match_id !== undefined) updates.match_id = body.match_id
      if (body.is_live !== undefined) updates.is_live = body.is_live
      if (body.event_status !== undefined) updates.event_status = body.event_status
      if (body.package_id !== undefined) updates.package_id = body.package_id
      const { data, error } = await supabase.from("live_events").update(updates).eq("id", body.id).select().single()
      if (error) throw error
      return NextResponse.json({ data })
    }

    if (action === "delete") {
      const { error } = await supabase.from("live_events").delete().eq("id", body.id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Operation failed" }, { status: 500 })
  }
}
