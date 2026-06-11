// Edge Function: cast-code-vote
// Casts a ballot using either a public or private promo code (no OTP).
// Deploy: `supabase functions deploy cast-code-vote --no-verify-jwt`

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
    let payload: any = {};
    try { payload = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
    const { competition_id, email, voter_name, code, candidate_ids } = payload || {};
    if (!competition_id || !code || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return json({ error: "Invalid request: competition_id, code and candidate_ids required" }, 400);
    }
    // email is only required for private_code; public_code voting is anonymous
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Invalid email" }, 400);
    }



    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: comp } = await supabase
      .from("seed_fund_competitions")
      .select("id,status,auth_method,public_code,max_selections")
      .eq("id", competition_id)
      .maybeSingle();
    if (!comp) return json({ error: "Competition not found" }, 404);
    if (comp.status !== "active") return json({ error: "Voting is closed" }, 400);

    const submittedCode = String(code).trim().toUpperCase();

    if (comp.auth_method === "public_code") {
      if (!comp.public_code || submittedCode !== comp.public_code.toUpperCase()) {
        return json({ error: "Invalid code." }, 400);
      }
    } else if (comp.auth_method === "private_code") {
      if (!email) return json({ error: "Email is required for private-code voting." }, 400);
      const { data: promo } = await supabase
        .from("seed_fund_promo_codes")
        .select("*")
        .eq("competition_id", competition_id)
        .eq("code", submittedCode)
        .maybeSingle();
      if (!promo) return json({ error: "Invalid code." }, 400);
      if (promo.used_at) return json({ error: "This code has already been used." }, 409);
      const { error: useErr } = await supabase
        .from("seed_fund_promo_codes")
        .update({ used_by_email: email.toLowerCase(), used_at: new Date().toISOString() })
        .eq("id", promo.id)
        .is("used_at", null);
      if (useErr) return json({ error: "Could not lock code." }, 500);
    } else {
      return json({ error: "This competition uses email OTP voting." }, 400);
    }

    // Public-code votes are anonymous — synthesise a unique pseudo-email so the
    // one-ballot-per-voter constraint (voter_email) still works.
    const effectiveEmail = email
      ? String(email).toLowerCase()
      : `anon+${crypto.randomUUID()}@public.vote`;



    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip") || null;

    const { data: ballot, error: rpcErr } = await supabase.rpc("cast_seed_fund_ballot", {
      _competition_id: competition_id,
      _voter_email: effectiveEmail,
      _voter_name: voter_name || null,
      _candidate_ids: candidate_ids,
      _auth_method: comp.auth_method,
      _voter_ip: ip,
    });
    if (rpcErr) {
      // refund private code if vote insert failed
      if (comp.auth_method === "private_code") {
        await supabase.from("seed_fund_promo_codes")
          .update({ used_by_email: null, used_at: null })
          .eq("competition_id", competition_id).eq("code", submittedCode);
      }
      return json({ error: rpcErr.message }, 400);
    }

    return json({ ok: true, vote_token: ballot?.[0]?.vote_token });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
