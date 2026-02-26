
-- ====== PHASE 1: ENUM + TABLES (no RLS yet) ======


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'app_role'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'program_admin', 'coach');
  END IF;
END
$$;
-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  coach_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- User roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL, program_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Activity log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL, entity_type TEXT, entity_id TEXT, details JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, content TEXT NOT NULL,
  excerpt TEXT, cover_image_url TEXT, published BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coaches
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT, phone TEXT, photo_url TEXT,
  organization TEXT, specialization TEXT, country TEXT, bio TEXT,
  status TEXT NOT NULL DEFAULT 'Pending', linkedin TEXT,
  preferred_client_type TEXT, experience TEXT, availability TEXT,
  preferred_communication TEXT, created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Programs
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'Active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entrepreneurs
CREATE TABLE IF NOT EXISTS public.entrepreneurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, business_name TEXT NOT NULL, country TEXT NOT NULL,
  sector TEXT NOT NULL, stage TEXT NOT NULL, gender TEXT NOT NULL,
  email TEXT, phone TEXT, photo_url TEXT, status TEXT NOT NULL DEFAULT 'Pending',
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  pitch_summary TEXT, business_description TEXT, funding_needs TEXT,
  coaching_needs TEXT, revenue TEXT, year_founded INTEGER, team_size INTEGER,
  next_of_kin TEXT, preferred_communication TEXT, education_background TEXT,
  about_entrepreneur TEXT, website TEXT, video_url TEXT,
  employees_fulltime INTEGER, employees_parttime INTEGER, impact TEXT,
  financials TEXT, financial_recording_method TEXT, products_services TEXT,
  market_size TEXT, competition TEXT, top_challenges TEXT, main_challenge TEXT,
  opportunities TEXT, industry_analysis TEXT, linkedin TEXT, pitch_deck_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Matching requests
CREATE TABLE IF NOT EXISTS public.matching_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT NOT NULL, requester_email TEXT NOT NULL,
  requester_role TEXT NOT NULL, requester_organization TEXT,
  entrepreneur_selections JSONB DEFAULT '[]'::jsonb,
  support_description TEXT, message TEXT, status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Matches
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrepreneur_id UUID NOT NULL REFERENCES public.entrepreneurs(id),
  coach_id UUID NOT NULL REFERENCES public.coaches(id),
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.matching_requests(id),
  status TEXT NOT NULL DEFAULT 'Active', notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Program coaches (many-to-many)
CREATE TABLE IF NOT EXISTS public.program_coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(program_id, coach_id)
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'Active',
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  entrepreneur_id UUID REFERENCES public.entrepreneurs(id) ON DELETE SET NULL,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE SET NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project track notes
CREATE TABLE  public.project_track_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resources
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT, file_url TEXT NOT NULL,
  file_type TEXT, category TEXT DEFAULT 'General',
  visibility TEXT NOT NULL DEFAULT 'public',
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FKs
-- Ensure column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coach_id UUID;

-- Add foreign key only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_coach_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_coach_id_fkey
    FOREIGN KEY (coach_id)
    REFERENCES public.coaches(id)
    ON DELETE SET NULL;
  END IF;
END
$$;
-- Ensure column exists
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS program_id UUID;

-- Add foreign key only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_program_id_fkey'
  ) THEN
    ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_program_id_fkey
    FOREIGN KEY (program_id)
    REFERENCES public.programs(id)
    ON DELETE SET NULL;
  END IF;
END
$$;
-- ====== PHASE 2: FUNCTIONS ======

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')) $$;

CREATE OR REPLACE FUNCTION public.check_signup_eligibility(check_email TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE coach_record RECORD; ent_record RECORD;
BEGIN
  SELECT id, name, status INTO coach_record FROM public.coaches WHERE LOWER(email) = LOWER(check_email) LIMIT 1;
  IF coach_record.id IS NOT NULL THEN
    IF coach_record.status IN ('Accepted', 'Matched', 'Unmatched', 'Alumni') THEN
      RETURN json_build_object('eligible', true, 'type', 'coach', 'name', coach_record.name, 'record_id', coach_record.id);
    ELSE
      RETURN json_build_object('eligible', false, 'reason', 'Your status is "' || coach_record.status || '". Only accepted applicants can sign up.');
    END IF;
  END IF;
  SELECT id, name, status INTO ent_record FROM public.entrepreneurs WHERE LOWER(email) = LOWER(check_email) LIMIT 1;
  IF ent_record.id IS NOT NULL THEN
    IF ent_record.status IN ('Admitted', 'Matched', 'Alumni') THEN
      RETURN json_build_object('eligible', true, 'type', 'entrepreneur', 'name', ent_record.name, 'record_id', ent_record.id);
    ELSE
      RETURN json_build_object('eligible', false, 'reason', 'Your status is "' || ent_record.status || '". Only admitted applicants can sign up.');
    END IF;
  END IF;
  RETURN json_build_object('eligible', false, 'reason', 'Email not found. Please apply first.');
END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE coach_record RECORD;
BEGIN
  SELECT id INTO coach_record FROM public.coaches WHERE LOWER(email) = LOWER(NEW.email) AND status IN ('Accepted', 'Matched', 'Unmatched', 'Alumni') LIMIT 1;
  IF coach_record.id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'coach') ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.profiles SET coach_id = coach_record.id WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END; $$;

-- ====== PHASE 3: TRIGGERS ======

-- Drop trigger if it already exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate it cleanly
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER on_profile_created_assign_role AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
-- Remove trigger if it already exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Recreate it cleanly
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Remove trigger if it already exists
DROP TRIGGER IF EXISTS update_coaches_updated_at ON public.coaches;
CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON public.coaches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Remove trigger if it already exists
DROP TRIGGER IF EXISTS update_entrepreneurs_updated_at ON public.entrepreneurs;
CREATE TRIGGER update_entrepreneurs_updated_at BEFORE UPDATE ON public.entrepreneurs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Remove trigger if it already exists
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====== PHASE 4: RLS ======

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "View own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view logs" ON public.activity_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert logs" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View published" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins manage posts" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage coaches" ON public.coaches FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "View coaches" ON public.coaches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Apply as coach" ON public.coaches FOR INSERT WITH CHECK (true);

ALTER TABLE public.entrepreneurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage entrepreneurs" ON public.entrepreneurs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Apply as entrepreneur" ON public.entrepreneurs FOR INSERT WITH CHECK (true);
CREATE POLICY "View admitted" ON public.entrepreneurs FOR SELECT USING (status IN ('Admitted', 'Matched', 'Alumni'));

ALTER TABLE public.matching_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage requests" ON public.matching_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Create requests" ON public.matching_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "View requests" ON public.matching_requests FOR SELECT TO authenticated USING (true);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage programs" ON public.programs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "PA view programs" ON public.programs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'program_admin' AND user_roles.program_id = programs.id)
);
CREATE POLICY "Coach view programs" ON public.programs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.program_coaches pc JOIN public.profiles p ON p.user_id = auth.uid() WHERE pc.program_id = programs.id AND pc.coach_id = p.coach_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage matches" ON public.matches FOR ALL USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS program_id UUID;
CREATE POLICY "PA manage matches" ON public.matches FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'program_admin' AND user_roles.program_id = matches.program_id)
);
CREATE POLICY "Coach view matches" ON public.matches FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND coach_id = matches.coach_id)
);

ALTER TABLE public.program_coaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage pc" ON public.program_coaches FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "PA view pc" ON public.program_coaches FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'program_admin' AND user_roles.program_id = program_coaches.program_id)
);
CREATE POLICY "Coach view pc" ON public.program_coaches FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND coach_id = program_coaches.coach_id)
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "PA manage projects" ON public.projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'program_admin' AND user_roles.program_id = projects.program_id)
);
CREATE POLICY "Coach view projects" ON public.projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND coach_id = projects.coach_id)
);

ALTER TABLE public.project_track_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage notes" ON public.project_track_notes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Author manage notes" ON public.project_track_notes FOR ALL USING (author_id = auth.uid());
CREATE POLICY "View accessible notes" ON public.project_track_notes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_track_notes.project_id AND (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'program_admin' AND user_roles.program_id = p.program_id) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND coach_id = p.coach_id)
  ))
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage resources" ON public.resources FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "PA manage program resources" ON public.resources FOR ALL USING (
  resources.visibility = 'private' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'program_admin' AND user_roles.program_id = resources.program_id)
);
CREATE POLICY "View public resources" ON public.resources FOR SELECT TO authenticated USING (resources.visibility = 'public');
CREATE POLICY "Coach view program resources" ON public.resources FOR SELECT USING (
  resources.visibility = 'private' AND
  EXISTS (SELECT 1 FROM public.program_coaches pc JOIN public.profiles p ON p.user_id = auth.uid() WHERE pc.program_id = resources.program_id AND pc.coach_id = p.coach_id)
);

-- ====== PHASE 5: STORAGE ======

-- ====== PHASE 5: STORAGE ======

INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Upload resources admin" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Upload resources pa" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resources' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'program_admin')
);
CREATE POLICY "View resource files" ON storage.objects FOR SELECT USING (bucket_id = 'resources');
CREATE POLICY "Upload avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Update avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "View avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
