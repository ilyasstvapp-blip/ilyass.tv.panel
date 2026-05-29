import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const packageId = searchParams.get("packageId")
    const activeOnly = searchParams.get("activeOnly")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    let query = supabase.from("channels").select("*", { count: "exact" })
    if (search) query = query.ilike("name", `%${search}%`)
    if (packageId) query = query.eq("package_id", packageId)
    if (activeOnly === "true") query = query.eq("is_active", true)

    const from = (page - 1) * pageSize
    const { data, error, count } = await query.order(sortBy, { ascending: sortOrder === "asc" }).range(from, from + pageSize - 1)
    if (error) throw error
    return NextResponse.json({ data, count })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch channels" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "create") {
      const { data, error } = await supabase.from("channels").insert({
        package_id: body.package_id, channel_key: body.channel_key, name: body.name,
        logo: body.logo ?? "", servers: body.servers ?? [],
        sort_order: body.sort_order ?? 0,
      }).select().single()
      if (error) throw error
      return NextResponse.json({ data }, { status: 201 })
    }

    if (action === "update") {
      const updates: Record<string, unknown> = {}
      if (body.package_id !== undefined) updates.package_id = body.package_id
      if (body.channel_key !== undefined) updates.channel_key = body.channel_key
      if (body.name !== undefined) updates.name = body.name
      if (body.logo !== undefined) updates.logo = body.logo
      if (body.servers !== undefined) updates.servers = body.servers
      if (body.is_active !== undefined) updates.is_active = body.is_active
      if (body.sort_order !== undefined) updates.sort_order = body.sort_order
      const { data, error } = await supabase.from("channels").update(updates).eq("id", body.id).select().single()
      if (error) throw error
      return NextResponse.json({ data })
    }

    if (action === "delete") {
      const { error } = await supabase.from("channels").delete().eq("id", body.id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Operation failed" }, { status: 500 })
  }
}
