-- =========================================================
-- PUBLIC TESTIMONIALS
-- 1. Adds an is_published flag to project_impact_cases so an
--    admin/coach can decide what appears on /testimonials.
-- 2. Creates a read-only public view joining the case study
--    with the entrepreneur / coach / project details.
-- Safe to run multiple times.
-- =========================================================

ALTER TABLE public.project_impact_cases
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_project_impact_cases_published
  ON public.project_impact_cases(is_published);

-- Coaches may also manage the impact case studies of their own projects
DROP POLICY IF EXISTS "impact_cases_coach_all" ON public.project_impact_cases;
CREATE POLICY "impact_cases_coach_all" ON public.project_impact_cases
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.profiles pr ON pr.coach_id = p.coach_id
      WHERE p.id = project_impact_cases.project_id
        AND pr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.profiles pr ON pr.coach_id = p.coach_id
      WHERE p.id = project_impact_cases.project_id
        AND pr.user_id = auth.uid()
    )
  );


-- ── Public view ───────────────────────────────────────────
DROP VIEW IF EXISTS public.public_testimonials;
CREATE VIEW public.public_testimonials AS
SELECT
  ic.id,
  ic.title,
  ic.entrepreneur_review,
  ic.coach_review,
  ic.video_url,
  ic.created_at,
  p.id                AS project_id,
  p.name              AS project_name,
  e.id                AS entrepreneur_id,
  e.name              AS entrepreneur_name,
  e.business_name     AS business_name,
  e.country           AS country,
  e.sector            AS sector,
  e.photo_url         AS entrepreneur_photo_url,
  c.name              AS coach_name,
  c.organization      AS coach_organization,
  c.photo_url         AS coach_photo_url
FROM public.project_impact_cases ic
JOIN public.projects p       ON p.id = ic.project_id
LEFT JOIN public.entrepreneurs e ON e.id = p.entrepreneur_id
LEFT JOIN public.coaches c       ON c.id = p.coach_id
WHERE ic.is_published = true;

-- The view runs with the owner's rights so anonymous visitors can read
-- ONLY published case studies (underlying tables stay protected by RLS).
ALTER VIEW public.public_testimonials SET (security_invoker = off);

GRANT SELECT ON public.public_testimonials TO anon, authenticated;
