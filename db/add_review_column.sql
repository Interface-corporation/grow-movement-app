-- Adds an optional `review` text field used by the Seed Fund Alumni testimonial cards.
-- Run once in the Supabase SQL editor. Safe to re-run.
ALTER TABLE public.entrepreneurs
  ADD COLUMN IF NOT EXISTS review text;

COMMENT ON COLUMN public.entrepreneurs.review IS
  'Short testimonial/review shown on the Seed Fund Alumni cards on the public Seed Fund page.';
