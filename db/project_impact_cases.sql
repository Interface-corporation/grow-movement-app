-- =========================================================
-- PROJECT IMPACT CASE STUDIES
-- Stores an entrepreneur review, a coach review and a video
-- testimonial link for a project (shown in the project modal
-- under /admin/programs/:id ).
-- Safe to run multiple times.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.project_impact_cases (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title                TEXT,
  entrepreneur_review  TEXT,
  coach_review         TEXT,
  video_url            TEXT,
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_impact_cases_project
  ON public.project_impact_cases(project_id);

-- GRANTS ---------------------------------------------------
GRANT SELECT ON public.project_impact_cases TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.project_impact_cases TO authenticated;
GRANT ALL ON public.project_impact_cases TO service_role;

-- RLS ------------------------------------------------------
ALTER TABLE public.project_impact_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "impact_cases_read" ON public.project_impact_cases;
CREATE POLICY "impact_cases_read" ON public.project_impact_cases
  FOR SELECT USING (true);

-- Admins / staff: full control
DROP POLICY IF EXISTS "impact_cases_admin_all" ON public.project_impact_cases;
CREATE POLICY "impact_cases_admin_all" ON public.project_impact_cases
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Program admins: only for projects inside their own program
DROP POLICY IF EXISTS "impact_cases_program_admin_all" ON public.project_impact_cases;
CREATE POLICY "impact_cases_program_admin_all" ON public.project_impact_cases
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.user_roles ur ON ur.program_id = p.program_id
      WHERE p.id = project_impact_cases.project_id
        AND ur.user_id = auth.uid()
        AND ur.role = 'program_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.user_roles ur ON ur.program_id = p.program_id
      WHERE p.id = project_impact_cases.project_id
        AND ur.user_id = auth.uid()
        AND ur.role = 'program_admin'
    )
  );

-- updated_at trigger
DROP TRIGGER IF EXISTS update_project_impact_cases_updated_at ON public.project_impact_cases;
CREATE TRIGGER update_project_impact_cases_updated_at
BEFORE UPDATE ON public.project_impact_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
