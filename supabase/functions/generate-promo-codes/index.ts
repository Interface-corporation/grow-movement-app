// Edge Function: generate-promo-codes
// Admin-only: generates N unique single-use promo codes for a competition.
// Deploy: `supabase functions deploy generate-promo-codes`

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.replace("Bearer ", "").trim();

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Validate the caller's JWT and get their user id
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: userData.user.id, _role: "admin",
    });
    if (roleErr) return json({ error: roleErr.message }, 500);
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    let body: any = {};
    try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
    const { competition_id, count } = body || {};
    if (!competition_id || !count || count < 1 || count > 5000) {
      return json({ error: "Invalid request: competition_id and count (1–5000) required" }, 400);
    }

    const { data: codes, error } = await admin.rpc("generate_promo_codes", {
      _competition_id: competition_id, _count: count,
    });
    if (error) return json({ error: error.message }, 500);

    return json({ ok: true, codes });
  } catch (e) {
    console.error("generate-promo-codes error", e);
    return json({ error: (e as Error)?.message || "Internal error" }, 500);
  }
});
