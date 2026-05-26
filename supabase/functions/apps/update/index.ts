import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts"
import { corsHeaders, handleCors } from "../../_shared/cors.ts"
import { verifyAdmin } from "../../_shared/auth.ts"
import { getServiceClient } from "../../_shared/supabase.ts"

const schema = z.object({
  type: z.enum(["popup", "maintenance", "social_popup"]),
  enabled: z.boolean().optional(),
  title: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  button_text: z.string().max(100).optional(),
  button_action: z.string().max(50).optional(),
  update_url: z.string().optional().nullable(),
  force_update: z.boolean().optional(),
  end_time: z.string().datetime().optional().nullable(),
  closable: z.boolean().optional(),
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

    const { type, ...updates } = parsed.data
    const supabase = getServiceClient()

    const { data, error: dbError } = await supabase
      .from("app_systems")
      .update(updates)
      .eq("type", type)
      .select()
      .single()

    if (dbError) return new Response(JSON.stringify({ error: dbError.message }), { status: 400, headers: corsHeaders })

    return new Response(JSON.stringify({ data }), { status: 200, headers: corsHeaders })
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders })
  }
})
