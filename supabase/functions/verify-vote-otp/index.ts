// Edge Function: verify-vote-otp
// Verifies the 6-digit OTP and casts a ballot (1 or more candidates) atomically.
// Deploy: `supabase functions deploy verify-vote-otp --no-verify-jwt`

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
    const { competition_id, email, code, candidate_ids } = await req.json();
    if (!competition_id || !email || !code || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return json({ error: "Invalid request" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: otp } = await supabase
      .from("seed_fund_vote_otps")
      .select("*")
      .eq("competition_id", competition_id)
      .eq("email", email.toLowerCase())
      .eq("consumed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otp) return json({ error: "No active code. Please request a new one." }, 400);
    if (new Date(otp.expires_at).getTime() < Date.now())
      return json({ error: "Code expired. Please request a new one." }, 400);
    if (otp.attempts >= 5) return json({ error: "Too many attempts." }, 429);

    if (otp.code !== String(code).trim()) {
      await supabase.from("seed_fund_vote_otps").update({ attempts: otp.attempts + 1 }).eq("id", otp.id);
      return json({ error: "Incorrect code." }, 400);
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip") || null;

    const { data: ballot, error: rpcErr } = await supabase.rpc("cast_seed_fund_ballot", {
      _competition_id: competition_id,
      _voter_email: email,
      _voter_name: otp.voter_name,
      _candidate_ids: candidate_ids,
      _auth_method: "otp",
      _voter_ip: ip,
    });
    if (rpcErr) return json({ error: rpcErr.message }, 400);

    await supabase.from("seed_fund_vote_otps").update({ consumed: true }).eq("id", otp.id);

    return json({ ok: true, vote_token: ballot?.[0]?.vote_token });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
