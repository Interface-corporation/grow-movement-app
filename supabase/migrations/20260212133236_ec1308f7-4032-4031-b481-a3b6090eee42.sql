
-- ============================================
-- 1. FIX ALL RLS POLICIES (restrictive → permissive)
-- ============================================

-- ACTIVITY_LOG
DROP POLICY IF EXISTS "Admins can manage activity log" ON public.activity_log;
CREATE POLICY "Admins can manage activity log" ON public.activity_log FOR ALL TO authenticated USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- BLOG_POSTS
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can view all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);

-- COACHES
DROP POLICY IF EXISTS "Admins can delete coaches" ON public.coaches;
DROP POLICY IF EXISTS "Admins can insert coaches" ON public.coaches;
DROP POLICY IF EXISTS "Admins can update coaches" ON public.coaches;
DROP POLICY IF EXISTS "Admins can view coaches" ON public.coaches;
CREATE POLICY "Admins can manage coaches" ON public.coaches FOR ALL TO authenticated USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- ENTREPRENEURS
DROP POLICY IF EXISTS "Admins can delete entrepreneurs" ON public.entrepreneurs;
DROP POLICY IF EXISTS "Admins can insert entrepreneurs" ON public.entrepreneurs;
DROP POLICY IF EXISTS "Admins can update entrepreneurs" ON public.entrepreneurs;
DROP POLICY IF EXISTS "Anyone can view entrepreneurs" ON public.entrepreneurs;
CREATE POLICY "Admins can manage entrepreneurs" ON public.entrepreneurs FOR ALL TO authenticated USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());
CREATE POLICY "Anyone can view entrepreneurs" ON public.entrepreneurs FOR SELECT TO anon, authenticated USING (true);

-- MATCHES
DROP POLICY IF EXISTS "Admins can manage matches" ON public.matches;
CREATE POLICY "Admins can manage matches" ON public.matches FOR ALL TO authenticated USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- MATCHING_REQUESTS
DROP POLICY IF EXISTS "Admins can delete matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Admins can update matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Admins can view matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Anyone can submit matching request" ON public.matching_requests;
CREATE POLICY "Admins can manage matching requests" ON public.matching_requests FOR ALL TO authenticated USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());
CREATE POLICY "Anyone can submit matching request" ON public.matching_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

-- PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (is_admin_or_staff());
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- USER_ROLES
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- ============================================
-- 2. ADD NEW COLUMNS TO ENTREPRENEURS (from Excel matching template)
-- ============================================
ALTER TABLE public.entrepreneurs
  ADD COLUMN IF NOT EXISTS education_background text,
  ADD COLUMN IF NOT EXISTS about_entrepreneur text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS employees_fulltime integer,
  ADD COLUMN IF NOT EXISTS employees_parttime integer,
  ADD COLUMN IF NOT EXISTS impact text,
  ADD COLUMN IF NOT EXISTS financials text,
  ADD COLUMN IF NOT EXISTS financial_recording_method text,
  ADD COLUMN IF NOT EXISTS products_services text,
  ADD COLUMN IF NOT EXISTS market_size text,
  ADD COLUMN IF NOT EXISTS competition text,
  ADD COLUMN IF NOT EXISTS top_challenges text,
  ADD COLUMN IF NOT EXISTS main_challenge text,
  ADD COLUMN IF NOT EXISTS opportunities text,
  ADD COLUMN IF NOT EXISTS industry_analysis text,
  ADD COLUMN IF NOT EXISTS next_of_kin text,
  ADD COLUMN IF NOT EXISTS preferred_communication text,
  ADD COLUMN IF NOT EXISTS linkedin text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text;

-- ============================================
-- 3. ADD NEW COLUMNS TO COACHES
-- ============================================
ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS linkedin text,
  ADD COLUMN IF NOT EXISTS preferred_client_type text,
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS preferred_communication text;

-- ============================================
-- 4. RE-CREATE TRIGGER for new user profile creation (if missing)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
