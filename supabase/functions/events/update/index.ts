import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts"
import { corsHeaders, handleCors } from "../../_shared/cors.ts"
import { verifyAdmin } from "../../_shared/auth.ts"
import { getServiceClient } from "../../_shared/supabase.ts"

const schema = z.object({
  id: z.string().uuid(),
  team1_name: z.string().min(1).max(100).optional(),
  team1_logo: z.string().optional().nullable(),
  team2_name: z.string().min(1).max(100).optional(),
  team2_logo: z.string().optional().nullable(),
  match_time: z.string().datetime().optional(),
  league: z.string().min(1).max(100).optional(),
  commentator: z.string().min(1).max(100).optional(),
  channel_key: z.string().min(1).optional(),
  channel_name: z.string().min(1).max(200).optional(),
})

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const { error } = await verifyAdmin(req)
    if (error) return new Response(JSON.stringify({ error }), { status: 401, headers: corsHeaders })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues }), { status: 400, headers: corsHeaders })
    }

    const { id, ...updates } = parsed.data
    const supabase = getServiceClient()
    const { data, error: dbError } = await supabase
      .from("live_events")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (dbError) return new Response(JSON.stringify({ error: dbError.message }), { status: 400, headers: corsHeaders })

    return new Response(JSON.stringify({ data }), { status: 200, headers: corsHeaders })
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders })
  }
})
