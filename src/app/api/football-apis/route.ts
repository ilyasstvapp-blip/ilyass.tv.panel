import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("football_apis")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch APIs", data: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "create") {
      const { api_name, api_url, api_type } = body
      if (!api_name || !api_url) {
        return NextResponse.json({ error: "api_name and api_url are required" }, { status: 400 })
      }
      const { data, error } = await supabase
        .from("football_apis")
        .insert({ api_name, api_url, api_type: api_type || "direct" })
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ data }, { status: 201 })
    }

    if (action === "update") {
      const { id, api_name, api_url, api_type } = body
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
      const updates: Record<string, unknown> = {}
      if (api_name !== undefined) updates.api_name = api_name
      if (api_url !== undefined) updates.api_url = api_url
      if (api_type !== undefined) updates.api_type = api_type
      const { data, error } = await supabase.from("football_apis").update(updates).eq("id", id).select().single()
      if (error) throw error
      return NextResponse.json({ data })
    }

    if (action === "activate") {
      const { id } = body
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
      await supabase.from("football_apis").update({ active: false }).neq("id", id)
      const { data, error } = await supabase.from("football_apis").update({ active: true }).eq("id", id).select().single()
      if (error) throw error
      return NextResponse.json({ data })
    }

    if (action === "deactivate") {
      const { id } = body
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
      const { data, error } = await supabase.from("football_apis").update({ active: false }).eq("id", id).select().single()
      if (error) throw error
      return NextResponse.json({ data })
    }

    if (action === "delete") {
      const { id } = body
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
      const { error } = await supabase.from("football_apis").delete().eq("id", id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Operation failed" }, { status: 500 })
  }
}
