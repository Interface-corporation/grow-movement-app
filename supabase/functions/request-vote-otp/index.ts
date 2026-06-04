// Edge Function: request-vote-otp
// Deploy this to YOUR Supabase project: `supabase functions deploy request-vote-otp --no-verify-jwt`
// Required secrets in your Supabase project:
//   SUPABASE_URL              (auto)
//   SUPABASE_SERVICE_ROLE_KEY (auto)
//   RESEND_API_KEY            (https://resend.com — for sending the OTP email)
//   VOTE_EMAIL_FROM           (e.g. "Grow Movement <noreply@yourdomain.com>")  optional
//
// If RESEND_API_KEY is missing the function still stores the OTP (useful for local dev)
// and returns it in the response so you can test the flow.

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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { competition_id, candidate_id, email, voter_name } = await req.json();

    if (!competition_id || !candidate_id || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Invalid request" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check competition is active
    const { data: comp } = await supabase
      .from("seed_fund_competitions")
      .select("id,status,title")
      .eq("id", competition_id)
      .maybeSingle();
    if (!comp) return json({ error: "Competition not found" }, 404);
    if (comp.status !== "active") return json({ error: "Voting is closed" }, 400);

    // Already voted?
    const { data: existing } = await supabase
      .from("seed_fund_votes")
      .select("id")
      .eq("competition_id", competition_id)
      .eq("voter_email", email.toLowerCase())
      .maybeSingle();
    if (existing) return json({ error: "This email has already voted in this competition." }, 409);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Clean previous unconsumed otps for this email/competition
    await supabase
      .from("seed_fund_vote_otps")
      .delete()
      .eq("email", email.toLowerCase())
      .eq("competition_id", competition_id)
      .eq("consumed", false);

    const { error: insErr } = await supabase.from("seed_fund_vote_otps").insert({
      competition_id,
      candidate_id,
      email: email.toLowerCase(),
      voter_name: voter_name || null,
      code,
      expires_at: expiresAt,
    });
    if (insErr) return json({ error: insErr.message }, 500);

    // Send email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("VOTE_EMAIL_FROM") || "Grow Movement <onboarding@resend.dev>";
    if (resendKey) {
      const subject = `Your Grow Seed Fund vote code: ${code}`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
          <h2 style="margin:0 0 12px 0;color:#0f172a">Confirm your vote</h2>
          <p>Thanks for voting in <strong>${comp.title}</strong>. Use the code below to verify your vote. It expires in 10 minutes.</p>
          <div style="font-size:32px;letter-spacing:8px;font-weight:700;background:#f1f5f9;padding:18px;border-radius:12px;text-align:center;margin:24px 0">${code}</div>
          <p style="color:#64748b;font-size:13px">If you didn't request this, ignore this email.</p>
          <p style="color:#64748b;font-size:13px">— Grow Movement</p>
        </div>`;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: email, subject, html }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error("Resend error", r.status, t);
        return json({ error: "Could not send verification email." }, 502);
      }
      return json({ ok: true });
    }

    // Dev fallback (no email provider configured)
    return json({ ok: true, dev_code: code, warning: "RESEND_API_KEY not set; returning code for testing." });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
