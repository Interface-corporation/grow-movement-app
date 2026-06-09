// Edge Function: request-vote-otp
// Sends a one-time code to the voter's email.
// Deploy: `supabase functions deploy request-vote-otp --no-verify-jwt`

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
    const { competition_id, email, voter_name } = await req.json();
    if (!competition_id || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Invalid request" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: comp } = await supabase
      .from("seed_fund_competitions")
      .select("id,status,title")
      .eq("id", competition_id)
      .maybeSingle();
    if (!comp) return json({ error: "Competition not found" }, 404);
    if (comp.status !== "active") return json({ error: "Voting is closed" }, 400);

    const { data: existing } = await supabase
      .from("seed_fund_votes")
      .select("id")
      .eq("competition_id", competition_id)
      .eq("voter_email", email.toLowerCase())
      .limit(1)
      .maybeSingle();
    if (existing) return json({ error: "This email has already voted." }, 409);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from("seed_fund_vote_otps")
      .delete().eq("email", email.toLowerCase()).eq("competition_id", competition_id).eq("consumed", false);

    // candidate_id is required by old schema (NOT NULL) — pick any candidate as placeholder
    const { data: anyCand } = await supabase
      .from("seed_fund_candidates").select("id").eq("competition_id", competition_id).limit(1).maybeSingle();

    const { error: insErr } = await supabase.from("seed_fund_vote_otps").insert({
      competition_id,
      candidate_id: anyCand?.id,
      email: email.toLowerCase(),
      voter_name: voter_name || null,
      code,
      expires_at: expiresAt,
    });
    if (insErr) return json({ error: insErr.message }, 500);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("VOTE_EMAIL_FROM") || "Grow Movement <onboarding@resend.dev>";
    if (resendKey) {
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
          <h2 style="margin:0 0 12px 0">Confirm your vote</h2>
          <p>Use the code below to verify your vote in <strong>${comp.title}</strong>. It expires in 10 minutes.</p>
          <div style="font-size:32px;letter-spacing:8px;font-weight:700;background:#f1f5f9;padding:18px;border-radius:12px;text-align:center;margin:24px 0">${code}</div>
          <p style="color:#64748b;font-size:13px">If you didn't request this, ignore this email. — Grow Movement</p>
        </div>`;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: email, subject: `Your Grow Seed Fund vote code: ${code}`, html }),
      });
      if (!r.ok) {
        console.error("Resend error", r.status, await r.text());
        return json({ error: "Could not send verification email." }, 502);
      }
      return json({ ok: true });
    }

    return json({ ok: true, dev_code: code, warning: "RESEND_API_KEY not set; returning code for testing." });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
