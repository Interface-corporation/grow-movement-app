
-- Allow anyone to submit an entrepreneur application (status = 'Pending')
CREATE POLICY "Anyone can apply as entrepreneur"
ON public.entrepreneurs
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'Pending');
