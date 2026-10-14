-- Claims are created by the server only after confirmed-email verification.
-- Stripe updates remain service_role operations. Keep existing ownership/data intact.
ALTER TABLE public.profiles ALTER COLUMN verified SET DEFAULT false;

-- Remove table and any pre-existing column grants; table revocation alone does not
-- remove explicit column privileges. PUBLIC grants are inherited by all clients.
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
DO $$
DECLARE columns_sql text;
BEGIN
  SELECT string_agg(quote_ident(attname), ', ') INTO columns_sql
  FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass
    AND attnum > 0 AND NOT attisdropped;
  EXECUTE format('REVOKE ALL (%s) ON TABLE public.profiles FROM PUBLIC, anon, authenticated', columns_sql);
END;
$$;
GRANT SELECT ON TABLE public.profiles TO anon, authenticated;
GRANT UPDATE (display_name) ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT
  TO authenticated USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

-- The existing timestamp trigger uses only built-in functions.
ALTER FUNCTION public.update_updated_at() SET search_path = pg_catalog;
