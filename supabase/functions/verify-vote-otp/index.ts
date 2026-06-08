// Edge Function: verify-vote-otp
// Deploy: `supabase functions deploy verify-vote-otp --no-verify-jwt`

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  console.log("RESEND_API_KEY exists:", !!Deno.env.get("RESEND_API_KEY"));
  console.log("VOTE_EMAIL_FROM:", Deno.env.get("VOTE_EMAIL_FROM"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { competition_id, email, code } = await req.json();
    if (!competition_id || !email || !code) return json({ error: "Invalid request" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
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
      await supabase
        .from("seed_fund_vote_otps")
        .update({ attempts: otp.attempts + 1 })
        .eq("id", otp.id);
      return json({ error: "Incorrect code." }, 400);
    }

    // Already voted check (extra safety)
    const { data: existing } = await supabase
      .from("seed_fund_votes")
      .select("id")
      .eq("competition_id", competition_id)
      .eq("voter_email", email.toLowerCase())
      .maybeSingle();
    if (existing) {
      await supabase.from("seed_fund_vote_otps").update({ consumed: true }).eq("id", otp.id);
      return json({ error: "This email has already voted." }, 409);
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      null;

    const { error: voteErr } = await supabase.from("seed_fund_votes").insert({
      competition_id,
      candidate_id: otp.candidate_id,
      voter_email: email.toLowerCase(),
      voter_name: otp.voter_name,
      ip_address: ip,
    });
    if (voteErr) return json({ error: voteErr.message }, 500);

    await supabase.from("seed_fund_vote_otps").update({ consumed: true }).eq("id", otp.id);

    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
