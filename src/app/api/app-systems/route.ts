import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let query = supabase.from("app_systems").select("*")
    if (type) query = query.eq("type", type)

    const { data, error } = await query.order("type", { ascending: true })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch app systems" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "update") {
      const updates: Record<string, unknown> = {}
      if (body.enabled !== undefined) updates.enabled = body.enabled
      if (body.title !== undefined) updates.title = body.title
      if (body.message !== undefined) updates.message = body.message
      if (body.button_text !== undefined) updates.button_text = body.button_text
      if (body.button_action !== undefined) updates.button_action = body.button_action
      if (body.update_url !== undefined) updates.update_url = body.update_url
      if (body.app_version !== undefined) updates.app_version = body.app_version
      if (body.latest_version !== undefined) updates.latest_version = body.latest_version
      if (body.force_update !== undefined) updates.force_update = body.force_update
      if (body.end_time !== undefined) updates.end_time = body.end_time
      if (body.closable !== undefined) updates.closable = body.closable

      const { data, error } = await supabase.from("app_systems").update(updates).eq("type", body.type).select().single()
      if (error) throw error
      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Operation failed" }, { status: 500 })
  }
}
