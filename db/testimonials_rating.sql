-- =========================================================
-- TESTIMONIAL RATINGS
-- Adds a 1-5 star rating to impact case studies and exposes
-- it on the public_testimonials view.
-- Safe to run multiple times.
-- =========================================================

ALTER TABLE public.project_impact_cases
  ADD COLUMN IF NOT EXISTS rating SMALLINT;

ALTER TABLE public.project_impact_cases
  DROP CONSTRAINT IF EXISTS project_impact_cases_rating_check;
ALTER TABLE public.project_impact_cases
  ADD CONSTRAINT project_impact_cases_rating_check
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- ── Recreate the public view with the rating column ───────
DROP VIEW IF EXISTS public.public_testimonials;
CREATE VIEW public.public_testimonials AS
SELECT
  ic.id,
  ic.title,
  ic.entrepreneur_review,
  ic.coach_review,
  ic.video_url,
  ic.rating,
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
JOIN public.projects p           ON p.id = ic.project_id
LEFT JOIN public.entrepreneurs e ON e.id = p.entrepreneur_id
LEFT JOIN public.coaches c       ON c.id = p.coach_id
WHERE ic.is_published = true;

ALTER VIEW public.public_testimonials SET (security_invoker = off);

GRANT SELECT ON public.public_testimonials TO anon, authenticated;
