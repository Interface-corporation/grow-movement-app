// Edge Function: generate-promo-codes
// Admin-only: generates N unique single-use promo codes for a competition.
// Returns the codes (so admin can download them as CSV).
// Deploy: `supabase functions deploy generate-promo-codes`

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: claims.claims.sub, _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const { competition_id, count } = await req.json();
    if (!competition_id || !count || count < 1 || count > 5000) return json({ error: "Invalid request" }, 400);

    const { data: codes, error } = await admin.rpc("generate_promo_codes", {
      _competition_id: competition_id, _count: count,
    });
    if (error) return json({ error: error.message }, 500);

    return json({ ok: true, codes });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
