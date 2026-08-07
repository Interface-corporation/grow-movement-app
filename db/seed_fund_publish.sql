-- =========================================================
-- SEED FUND: publish control
-- Lets an admin choose exactly which competition appears on the
-- public Seed Fund page, independent of its draft/active/ended status.
-- Safe to run multiple times.
-- =========================================================

ALTER TABLE public.seed_fund_competitions
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.seed_fund_competitions.is_published IS
  'When true this competition is the one shown publicly. Only one row should be true at a time.';

-- Ensure at most one published competition
CREATE UNIQUE INDEX IF NOT EXISTS uniq_seed_fund_published
  ON public.seed_fund_competitions ((is_published))
  WHERE is_published;

-- Backfill: publish the most relevant existing competition if none is published yet.
UPDATE public.seed_fund_competitions
SET is_published = true
WHERE id = (
  SELECT id FROM public.seed_fund_competitions
  WHERE status IN ('active', 'ended')
  ORDER BY (status = 'active') DESC, event_date DESC NULLS LAST, created_at DESC
  LIMIT 1
)
AND NOT EXISTS (SELECT 1 FROM public.seed_fund_competitions WHERE is_published);

-- Publishing helper: publishes one competition and unpublishes all others atomically.
CREATE OR REPLACE FUNCTION public.publish_seed_fund_competition(_competition_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')) THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  UPDATE public.seed_fund_competitions SET is_published = false WHERE is_published;

  IF _competition_id IS NOT NULL THEN
    UPDATE public.seed_fund_competitions SET is_published = true WHERE id = _competition_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_seed_fund_competition(UUID) TO authenticated;
