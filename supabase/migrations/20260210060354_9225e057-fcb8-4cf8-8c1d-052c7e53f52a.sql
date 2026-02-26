
-- 1. Create role enum
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

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Entrepreneurs table (full schema for DB-driven profiles)
CREATE TABLE public.entrepreneurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  business_name TEXT NOT NULL,
  country TEXT NOT NULL,
  sector TEXT NOT NULL,
  stage TEXT NOT NULL,
  gender TEXT NOT NULL,
  pitch_summary TEXT,
  business_description TEXT,
  funding_needs TEXT,
  coaching_needs TEXT,
  revenue TEXT,
  year_founded INTEGER,
  team_size INTEGER,
  status TEXT NOT NULL DEFAULT 'In Training',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.entrepreneurs ENABLE ROW LEVEL SECURITY;

-- 5. Coaches table
CREATE TABLE public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  organization TEXT,
  specialization TEXT,
  country TEXT,
  bio TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

-- 6. Matching requests (from public visitors)
CREATE TABLE public.matching_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_organization TEXT,
  requester_role TEXT NOT NULL,
  message TEXT,
  support_description TEXT,
  entrepreneur_selections JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matching_requests ENABLE ROW LEVEL SECURITY;

-- 7. Matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrepreneur_id UUID REFERENCES public.entrepreneurs(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.matching_requests(id) ON DELETE SET NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 8. Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 9. Activity log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- 10. Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
  )
$$;

-- 11. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_entrepreneurs_updated_at BEFORE UPDATE ON public.entrepreneurs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON public.coaches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_matching_requests_updated_at BEFORE UPDATE ON public.matching_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. RLS Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin_or_staff());

-- User roles (only admins manage)
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- Entrepreneurs (public read, admin write)
CREATE POLICY "Anyone can view entrepreneurs" ON public.entrepreneurs FOR SELECT USING (true);
CREATE POLICY "Admins can insert entrepreneurs" ON public.entrepreneurs FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins can update entrepreneurs" ON public.entrepreneurs FOR UPDATE TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admins can delete entrepreneurs" ON public.entrepreneurs FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Coaches (admin only)
CREATE POLICY "Admins can view coaches" ON public.coaches FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admins can insert coaches" ON public.coaches FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins can update coaches" ON public.coaches FOR UPDATE TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admins can delete coaches" ON public.coaches FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Matching requests (anyone can insert, admins can read/manage)
CREATE POLICY "Anyone can submit matching request" ON public.matching_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view matching requests" ON public.matching_requests FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admins can update matching requests" ON public.matching_requests FOR UPDATE TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admins can delete matching requests" ON public.matching_requests FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Matches (admin only)
CREATE POLICY "Admins can manage matches" ON public.matches FOR ALL TO authenticated USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- Blog posts (public read published, admin full access)
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all blog posts" ON public.blog_posts FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admins can insert blog posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins can update blog posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admins can delete blog posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Activity log (admin only)
CREATE POLICY "Admins can manage activity log" ON public.activity_log FOR ALL TO authenticated USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());
