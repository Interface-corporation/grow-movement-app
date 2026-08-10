-- =========================================================
-- IMPACT CASE STUDY — BRIEF PROJECT DESCRIPTION
-- Adds a short project brief shown only inside the public
-- testimonial modal (hidden on the card).
-- Safe to run multiple times.
-- =========================================================

ALTER TABLE public.project_impact_cases
  ADD COLUMN IF NOT EXISTS project_brief TEXT;

-- ── Recreate the public view with the brief column ────────
DROP VIEW IF EXISTS public.public_testimonials;
CREATE VIEW public.public_testimonials AS
SELECT
  ic.id,
  ic.title,
  ic.project_brief,
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
