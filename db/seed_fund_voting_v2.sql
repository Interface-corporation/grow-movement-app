-- =========================================================
-- GROW WOMEN SEED FUND — Flexible Voting Auth (v2)
-- Run this AFTER db/seed_fund.sql, in your Supabase SQL editor.
-- Safe to run multiple times.
-- =========================================================

-- 1) Extend competitions with auth method & max selections -
ALTER TABLE public.seed_fund_competitions
  ADD COLUMN IF NOT EXISTS auth_method     TEXT NOT NULL DEFAULT 'otp'
    CHECK (auth_method IN ('otp','private_code','public_code')),
  ADD COLUMN IF NOT EXISTS max_selections  INT  NOT NULL DEFAULT 1
    CHECK (max_selections >= 1 AND max_selections <= 50),
  ADD COLUMN IF NOT EXISTS public_code     TEXT;

-- 2) Extend votes for ballot grouping ----------------------
ALTER TABLE public.seed_fund_votes
  ADD COLUMN IF NOT EXISTS vote_token  UUID,
  ADD COLUMN IF NOT EXISTS auth_method TEXT;

-- Remove old single-vote-per-competition constraint (we now allow N selections per ballot)
ALTER TABLE public.seed_fund_votes DROP CONSTRAINT IF EXISTS seed_fund_votes_competition_id_voter_email_key;
-- Each (competition, voter, candidate) must still be unique
CREATE UNIQUE INDEX IF NOT EXISTS uq_seed_votes_ballot
  ON public.seed_fund_votes (competition_id, voter_email, candidate_id);

-- 3) Promo codes (private = one-time; public uses competitions.public_code)
CREATE TABLE IF NOT EXISTS public.seed_fund_promo_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  UUID NOT NULL REFERENCES public.seed_fund_competitions(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  used_by_email   TEXT,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (competition_id, code)
);
CREATE INDEX IF NOT EXISTS idx_promo_codes_lookup ON public.seed_fund_promo_codes(competition_id, code);

GRANT ALL ON public.seed_fund_promo_codes TO service_role;
GRANT SELECT ON public.seed_fund_promo_codes TO authenticated;
ALTER TABLE public.seed_fund_promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promo_admin_all" ON public.seed_fund_promo_codes;
CREATE POLICY "promo_admin_all" ON public.seed_fund_promo_codes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Audit log ---------------------------------------------
CREATE TABLE IF NOT EXISTS public.seed_fund_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  UUID NOT NULL REFERENCES public.seed_fund_competitions(id) ON DELETE CASCADE,
  voter_email     TEXT NOT NULL,
  voter_name      TEXT,
  voter_ip        TEXT,
  candidate_ids   UUID[] NOT NULL,
  vote_token      UUID NOT NULL,
  auth_method     TEXT NOT NULL,
  submitted_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_comp ON public.seed_fund_audit_log(competition_id, submitted_at DESC);

GRANT ALL ON public.seed_fund_audit_log TO service_role;
GRANT SELECT ON public.seed_fund_audit_log TO authenticated;
ALTER TABLE public.seed_fund_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_admin_read" ON public.seed_fund_audit_log;
CREATE POLICY "audit_admin_read" ON public.seed_fund_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5) Allow public INSERT on votes ONLY via service_role (edge function does it)
-- (No anon write policy intentionally; edge functions use service_role and bypass RLS.)

-- 6) RPC: cast a complete ballot atomically ----------------
-- Validates competition status, max selections, no double vote.
-- Inserts one row per candidate sharing the same vote_token, plus the audit log.
CREATE OR REPLACE FUNCTION public.cast_seed_fund_ballot(
  _competition_id UUID,
  _voter_email    TEXT,
  _voter_name     TEXT,
  _candidate_ids  UUID[],
  _auth_method    TEXT,
  _voter_ip       TEXT DEFAULT NULL
)
RETURNS TABLE(vote_token UUID, recorded INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _comp RECORD;
  _email TEXT := lower(trim(_voter_email));
  _token UUID := gen_random_uuid();
  _n INT;
BEGIN
  SELECT id, status, max_selections INTO _comp
  FROM public.seed_fund_competitions WHERE id = _competition_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Competition not found' USING ERRCODE = 'P0001'; END IF;
  IF _comp.status <> 'active' THEN RAISE EXCEPTION 'Voting is closed' USING ERRCODE = 'P0002'; END IF;

  -- exact selection count enforcement
  _n := COALESCE(array_length(_candidate_ids, 1), 0);
  IF _n <> _comp.max_selections THEN
    RAISE EXCEPTION 'You must select exactly % candidate(s)', _comp.max_selections USING ERRCODE = 'P0003';
  END IF;

  -- already voted?
  IF EXISTS (
    SELECT 1 FROM public.seed_fund_votes
    WHERE competition_id = _competition_id AND voter_email = _email
  ) THEN
    RAISE EXCEPTION 'This email has already voted in this competition' USING ERRCODE = 'P0004';
  END IF;

  -- ensure all candidate ids belong to this competition
  IF (
    SELECT COUNT(*) FROM public.seed_fund_candidates
    WHERE id = ANY(_candidate_ids) AND competition_id = _competition_id
  ) <> _n THEN
    RAISE EXCEPTION 'Invalid candidate selection' USING ERRCODE = 'P0005';
  END IF;

  -- insert ballot
  INSERT INTO public.seed_fund_votes
    (competition_id, candidate_id, voter_email, voter_name, ip_address, vote_token, auth_method)
  SELECT _competition_id, c, _email, _voter_name, _voter_ip, _token, _auth_method
  FROM unnest(_candidate_ids) c;

  -- audit
  INSERT INTO public.seed_fund_audit_log
    (competition_id, voter_email, voter_name, voter_ip, candidate_ids, vote_token, auth_method)
  VALUES (_competition_id, _email, _voter_name, _voter_ip, _candidate_ids, _token, _auth_method);

  RETURN QUERY SELECT _token, _n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cast_seed_fund_ballot(UUID, TEXT, TEXT, UUID[], TEXT, TEXT)
  TO service_role;

-- 7) RPC: bulk generate promo codes (admin only, called from admin via edge function)
CREATE OR REPLACE FUNCTION public.generate_promo_codes(
  _competition_id UUID, _count INT
)
RETURNS SETOF TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i INT;
  _code TEXT;
BEGIN
  IF _count < 1 OR _count > 5000 THEN RAISE EXCEPTION 'count out of range'; END IF;
  FOR i IN 1.._count LOOP
    LOOP
      _code := upper(encode(gen_random_bytes(6), 'hex'));
      _code := substr(_code, 1, 4) || '-' || substr(_code, 5, 4) || '-' || substr(_code, 9, 4);
      BEGIN
        INSERT INTO public.seed_fund_promo_codes (competition_id, code) VALUES (_competition_id, _code);
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        -- collision, retry
      END;
    END LOOP;
    RETURN NEXT _code;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_promo_codes(UUID, INT) TO service_role;

-- 8) Realtime: enable replication for live admin dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.seed_fund_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seed_fund_audit_log;

-- 9) Contact enquiries table (for new contact form) --------
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  organisation TEXT,
  interest     TEXT,
  message      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);
GRANT INSERT ON public.contact_enquiries TO anon, authenticated;
GRANT ALL    ON public.contact_enquiries TO service_role;
GRANT SELECT ON public.contact_enquiries TO authenticated;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "enquiries_public_insert" ON public.contact_enquiries;
CREATE POLICY "enquiries_public_insert" ON public.contact_enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "enquiries_admin_read" ON public.contact_enquiries;
CREATE POLICY "enquiries_admin_read" ON public.contact_enquiries
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
