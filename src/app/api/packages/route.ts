import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const activeOnly = searchParams.get("activeOnly")
    const sortBy = searchParams.get("sortBy") || "sort_order"
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    let query = supabase.from("packages").select("*", { count: "exact" })
    if (search) query = query.ilike("name", `%${search}%`)
    if (activeOnly === "true") query = query.eq("is_active", true)

    const from = (page - 1) * pageSize
    const { data, error, count } = await query.order(sortBy, { ascending: sortOrder === "asc" }).range(from, from + pageSize - 1)
    if (error) throw error

    // Optionally include channel counts per package
    const includeChannelCounts = searchParams.get("includeChannelCounts") === "true"
    let channelCounts: Record<string, number> = {}
    if (includeChannelCounts && data?.length) {
      const { data: channels } = await supabase
        .from("channels")
        .select("package_id")
        .in("package_id", data.map((p) => p.id))
      if (channels) {
        for (const ch of channels) {
          channelCounts[ch.package_id] = (channelCounts[ch.package_id] || 0) + 1
        }
      }
    }

    return NextResponse.json({ data, count, channelCounts: includeChannelCounts ? channelCounts : undefined })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "create") {
      const { data, error } = await supabase.from("packages").insert({
        name: body.name, sort_order: body.sort_order ?? 0,
      }).select().single()
      if (error) throw error
      return NextResponse.json({ data }, { status: 201 })
    }

    if (action === "update") {
      const updates: Record<string, unknown> = {}
      if (body.name !== undefined) updates.name = body.name
      if (body.sort_order !== undefined) updates.sort_order = body.sort_order
      if (body.is_active !== undefined) updates.is_active = body.is_active
      const { data, error } = await supabase.from("packages").update(updates).eq("id", body.id).select().single()
      if (error) throw error
      return NextResponse.json({ data })
    }

    if (action === "delete") {
      const { error } = await supabase.from("packages").delete().eq("id", body.id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === "reorder") {
      const { items } = body
      if (!Array.isArray(items)) return NextResponse.json({ error: "items array required" }, { status: 400 })
      for (const item of items) {
        const { error } = await supabase.from("packages").update({ sort_order: item.sort_order }).eq("id", item.id)
        if (error) throw error
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Operation failed" }, { status: 500 })
  }
}
