-- Allow coaches to cancel their own matching requests (update status to 'cancelled' only)
CREATE POLICY "Requester can cancel own request"
ON public.matching_requests
FOR UPDATE
USING (
  requester_email = (SELECT LOWER(email) FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  status = 'cancelled'
  AND requester_email = (SELECT LOWER(email) FROM auth.users WHERE id = auth.uid())
);