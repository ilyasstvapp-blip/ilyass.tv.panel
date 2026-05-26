import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")

    let query = supabase.from("device_sessions").select("*", { count: "exact" })
    if (search) query = query.ilike("device_name", `%${search}%`)

    const from = (page - 1) * pageSize
    const { data, error, count } = await query.order("last_seen", { ascending: false }).range(from, from + pageSize - 1)
    if (error) throw error
    return NextResponse.json({ data, count })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch device sessions" }, { status: 500 })
  }
}
