-- =========================================================
-- GROW WOMEN SEED FUND — Competition, Candidates & Voting
-- Run this in your Supabase SQL editor (you use your own backend).
-- Safe to run multiple times.
-- =========================================================

-- 1) COMPETITIONS ------------------------------------------
CREATE TABLE IF NOT EXISTS public.seed_fund_competitions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  edition      TEXT,
  description  TEXT,
  event_date   TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'draft', -- draft | active | ended
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 2) CANDIDATES --------------------------------------------
CREATE TABLE IF NOT EXISTS public.seed_fund_candidates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  UUID NOT NULL REFERENCES public.seed_fund_competitions(id) ON DELETE CASCADE,
  entrepreneur_id UUID NOT NULL REFERENCES public.entrepreneurs(id) ON DELETE CASCADE,
  display_order   INT  DEFAULT 0,
  pitch_video_url TEXT,
  raising_for     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (competition_id, entrepreneur_id)
);

-- 3) VOTES (one per email per competition) -----------------
CREATE TABLE IF NOT EXISTS public.seed_fund_votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  UUID NOT NULL REFERENCES public.seed_fund_competitions(id) ON DELETE CASCADE,
  candidate_id    UUID NOT NULL REFERENCES public.seed_fund_candidates(id) ON DELETE CASCADE,
  voter_email     TEXT NOT NULL,
  voter_name      TEXT,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (competition_id, voter_email)
);
CREATE INDEX IF NOT EXISTS idx_seed_votes_candidate ON public.seed_fund_votes(candidate_id);

-- 4) OTP VERIFICATION --------------------------------------
CREATE TABLE IF NOT EXISTS public.seed_fund_vote_otps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  UUID NOT NULL REFERENCES public.seed_fund_competitions(id) ON DELETE CASCADE,
  candidate_id    UUID NOT NULL REFERENCES public.seed_fund_candidates(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  voter_name      TEXT,
  code            TEXT NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  consumed        BOOLEAN NOT NULL DEFAULT false,
  attempts        INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seed_otps_lookup ON public.seed_fund_vote_otps(email, code);

-- 5) GRANTS ------------------------------------------------
GRANT SELECT ON public.seed_fund_competitions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seed_fund_competitions TO authenticated;
GRANT ALL ON public.seed_fund_competitions TO service_role;

GRANT SELECT ON public.seed_fund_candidates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seed_fund_candidates TO authenticated;
GRANT ALL ON public.seed_fund_candidates TO service_role;

GRANT SELECT ON public.seed_fund_votes TO authenticated;
GRANT ALL ON public.seed_fund_votes TO service_role;

GRANT ALL ON public.seed_fund_vote_otps TO service_role;

-- 6) RLS ---------------------------------------------------
ALTER TABLE public.seed_fund_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_fund_candidates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_fund_votes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_fund_vote_otps    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competitions_public_read" ON public.seed_fund_competitions;
CREATE POLICY "competitions_public_read" ON public.seed_fund_competitions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "candidates_public_read" ON public.seed_fund_candidates;
CREATE POLICY "candidates_public_read" ON public.seed_fund_candidates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "competitions_admin_all" ON public.seed_fund_competitions;
CREATE POLICY "competitions_admin_all" ON public.seed_fund_competitions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "candidates_admin_all" ON public.seed_fund_candidates;
CREATE POLICY "candidates_admin_all" ON public.seed_fund_candidates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "votes_admin_read" ON public.seed_fund_votes;
CREATE POLICY "votes_admin_read" ON public.seed_fund_votes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7) PUBLIC RPC: vote tallies ------------------------------
CREATE OR REPLACE FUNCTION public.get_seed_fund_vote_counts(_competition_id UUID)
RETURNS TABLE(candidate_id UUID, votes BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT candidate_id, COUNT(*)::BIGINT AS votes
  FROM public.seed_fund_votes
  WHERE competition_id = _competition_id
  GROUP BY candidate_id;
$$;
GRANT EXECUTE ON FUNCTION public.get_seed_fund_vote_counts(UUID) TO anon, authenticated;

-- 8) updated_at trigger
DROP TRIGGER IF EXISTS update_seed_fund_competitions_updated_at ON public.seed_fund_competitions;
CREATE TRIGGER update_seed_fund_competitions_updated_at
BEFORE UPDATE ON public.seed_fund_competitions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
