import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!

export async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid authorization header", user: null }
  }

  const token = authHeader.replace("Bearer ", "")
  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return { error: "Unauthorized", user: null }
  }

  return { error: null, user: data.user }
}
