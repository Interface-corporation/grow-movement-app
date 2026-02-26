
-- Create storage buckets for entrepreneur uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('pitch-decks', 'pitch-decks', false) ON CONFLICT (id) DO NOTHING;

-- Public read access for profile photos
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Anyone can upload profile photos (for public applications)
CREATE POLICY "Anyone can upload profile photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] IS NOT NULL);

-- Admins can manage all storage objects
CREATE POLICY "Admins can manage all storage"
ON storage.objects FOR ALL
USING (public.is_admin_or_staff());

-- Anyone can upload pitch decks (for public applications)
CREATE POLICY "Anyone can upload pitch decks"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pitch-decks' AND (storage.foldername(name))[1] IS NOT NULL);

-- Admins can read pitch decks
CREATE POLICY "Admins can view pitch decks"
ON storage.objects FOR SELECT
USING (bucket_id = 'pitch-decks' AND public.is_admin_or_staff());
