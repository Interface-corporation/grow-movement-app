-- Project Sessions table for structured tracking
CREATE TABLE IF NOT EXISTS public.project_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  session_name text NOT NULL,
  session_description text,
  outcome text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Session Comments table
CREATE TABLE IF NOT EXISTS public.session_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.project_sessions(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_sessions
CREATE POLICY "Authenticated users can view project sessions"
  ON public.project_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert project sessions"
  ON public.project_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update project sessions"
  ON public.project_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete project sessions"
  ON public.project_sessions FOR DELETE TO authenticated USING (true);

-- RLS policies for session_comments
CREATE POLICY "Authenticated users can view session comments"
  ON public.session_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert session comments"
  ON public.session_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete session comments"
  ON public.session_comments FOR DELETE TO authenticated USING (true);
