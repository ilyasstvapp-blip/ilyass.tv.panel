import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const deviceType = searchParams.get("deviceType")
    const banned = searchParams.get("banned")
    const activeToday = searchParams.get("activeToday")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")

    let query = supabase.from("device_sessions").select("*", { count: "exact" })

    if (search) {
      query = query.or(`device_name.ilike.%${search}%,device_id.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`)
    }

    if (banned === "true") query = query.eq("is_banned", true)
    if (banned === "false") query = query.eq("is_banned", false)

    if (deviceType === "tv") query = query.eq("is_tv", true)
    else if (deviceType === "tablet") query = query.eq("is_tablet", true)
    else if (deviceType === "phone") query = query.eq("is_tv", false).eq("is_tablet", false)

    const from = (page - 1) * pageSize
    const { data, error, count } = await query.order("first_seen", { ascending: false }).range(from, from + pageSize - 1)
    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ data: [], count: 0 })
    }

    const deviceIds = data.map(d => d.device_id)

    const [presenceResult, statusResult] = await Promise.all([
      supabase.from("device_presence").select("*").in("device_id", deviceIds),
      supabase.from("device_presence_status").select("*").in("device_id", deviceIds),
    ])

    const presenceMap = new Map((presenceResult.data || []).map(p => [p.device_id, p]))
    const statusMap = new Map((statusResult.data || []).map(s => [s.device_id, s]))

    let enriched = data.map(d => ({
      ...d,
      presence: presenceMap.get(d.device_id) || null,
      presence_status: statusMap.get(d.device_id) || null,
      realtime_online: statusMap.get(d.device_id)?.realtime_online ?? false,
      total_opens: presenceMap.get(d.device_id)?.total_opens ?? 0,
      last_open_at: presenceMap.get(d.device_id)?.last_open_at ?? d.last_seen,
      last_seen_at: presenceMap.get(d.device_id)?.last_seen_at ?? d.last_seen,
    }))

    const rawCount = count ?? 0

    if (status === "online") enriched = enriched.filter(d => d.realtime_online)
    else if (status === "offline") enriched = enriched.filter(d => !d.realtime_online)

    if (activeToday === "true") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      enriched = enriched.filter(d => {
        const ls = d.last_seen_at || d.last_seen
        return ls && new Date(ls) >= today
      })
    }

    const hasInMemoryFilter = !!(status || activeToday === "true")
    return NextResponse.json({
      data: enriched,
      count: hasInMemoryFilter ? enriched.length : rawCount,
      totalCount: rawCount,
      displayedCount: enriched.length,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch device sessions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "ban") {
      const { data, error } = await supabase.from("device_sessions").update({ is_banned: true }).eq("id", body.id).select().single()
      if (error) throw error
      return NextResponse.json({ data })
    }

    if (action === "unban") {
      const { data, error } = await supabase.from("device_sessions").update({ is_banned: false }).eq("id", body.id).select().single()
      if (error) throw error
      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Operation failed" }, { status: 500 })
  }
}
