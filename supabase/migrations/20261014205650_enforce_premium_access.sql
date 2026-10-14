-- Public eligibility contains no private profile/email/billing fields.
CREATE TABLE public.premium_entitlements (
  program_number text PRIMARY KEY REFERENCES public.profiles(program_number) ON DELETE CASCADE,
  enabled boolean NOT NULL
);
ALTER TABLE public.premium_entitlements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.premium_entitlements FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.premium_entitlements TO anon, authenticated;
GRANT ALL ON public.premium_entitlements TO service_role;
CREATE POLICY "Public premium eligibility" ON public.premium_entitlements FOR SELECT TO anon, authenticated USING (enabled);

CREATE SCHEMA IF NOT EXISTS oph_private;
REVOKE ALL ON SCHEMA oph_private FROM PUBLIC, anon, authenticated;
CREATE FUNCTION oph_private.sync_premium_entitlement() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> NEW.id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  INSERT INTO public.premium_entitlements(program_number, enabled)
    VALUES (NEW.program_number, NEW.verified AND NEW.subscription_status IN ('active','past_due'))
    ON CONFLICT(program_number) DO UPDATE SET enabled = EXCLUDED.enabled;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION oph_private.sync_premium_entitlement() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER profiles_premium_entitlement AFTER INSERT OR UPDATE OF verified, subscription_status ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION oph_private.sync_premium_entitlement();
INSERT INTO public.premium_entitlements(program_number, enabled)
  SELECT program_number, verified AND subscription_status IN ('active','past_due') FROM public.profiles;

-- Preserve owner SELECT/DELETE policies for private drafts and cleanup.
DROP POLICY "Anyone can read published listings" ON public.premium_listings;
CREATE POLICY "Anyone can read published listings" ON public.premium_listings FOR SELECT TO anon, authenticated
  USING (published AND EXISTS (SELECT 1 FROM public.premium_entitlements e WHERE e.program_number = premium_listings.program_number AND e.enabled));
DROP POLICY "Anyone can read published jobs" ON public.daycare_jobs;
CREATE POLICY "Anyone can read published jobs" ON public.daycare_jobs FOR SELECT TO anon, authenticated
  USING (published AND EXISTS (SELECT 1 FROM public.premium_entitlements e WHERE e.program_number = daycare_jobs.program_number AND e.enabled));

DROP POLICY "Owners can insert own listing" ON public.premium_listings;
DROP POLICY "Owners can update own listing" ON public.premium_listings;
CREATE POLICY "Owners can insert own listing" ON public.premium_listings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = premium_listings.program_number AND p.verified AND p.subscription_status IN ('active','past_due')));
CREATE POLICY "Owners can update own listing" ON public.premium_listings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = premium_listings.program_number AND p.verified AND p.subscription_status IN ('active','past_due')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = premium_listings.program_number AND p.verified AND p.subscription_status IN ('active','past_due')));
DROP POLICY "Owners can insert own jobs" ON public.daycare_jobs;
DROP POLICY "Owners can update own jobs" ON public.daycare_jobs;
CREATE POLICY "Owners can insert own jobs" ON public.daycare_jobs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = daycare_jobs.program_number AND p.verified AND p.subscription_status IN ('active','past_due')));
CREATE POLICY "Owners can update own jobs" ON public.daycare_jobs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = daycare_jobs.program_number AND p.verified AND p.subscription_status IN ('active','past_due')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = daycare_jobs.program_number AND p.verified AND p.subscription_status IN ('active','past_due')));

-- Bucket stays public for existing image URLs; writes are scoped and paid.
CREATE POLICY "Listing owners can read image metadata" ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id = 'listings' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = (storage.foldername(name))[1]));
CREATE POLICY "Premium owners can upload images" ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (bucket_id = 'listings' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = (storage.foldername(name))[1] AND p.verified AND p.subscription_status IN ('active','past_due')));
CREATE POLICY "Premium owners can update images" ON storage.objects FOR UPDATE TO authenticated
 USING (bucket_id = 'listings' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = (storage.foldername(name))[1] AND p.verified AND p.subscription_status IN ('active','past_due')))
 WITH CHECK (bucket_id = 'listings' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = (storage.foldername(name))[1] AND p.verified AND p.subscription_status IN ('active','past_due')));
CREATE POLICY "Listing owners can clean up images" ON storage.objects FOR DELETE TO authenticated
 USING (bucket_id = 'listings' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.program_number = (storage.foldername(name))[1]));
