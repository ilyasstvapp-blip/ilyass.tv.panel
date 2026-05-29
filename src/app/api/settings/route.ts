import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")
    let query = supabase.from("settings").select("key, value")
    if (key) query = query.eq("key", key)

    const { data, error } = await query
    if (error) throw error

    if (key) {
      const row = data?.[0]
      return NextResponse.json({ value: row?.value ?? null })
    }
    const result: Record<string, unknown> = {}
    for (const row of data || []) result[row.key] = row.value
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { key, value } = body
    if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 })

    const { error } = await supabase.from("settings").upsert({ key, value }, { onConflict: "key" })
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to save setting" }, { status: 500 })
  }
}
