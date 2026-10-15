-- This optional dashboard-installed helper is an internal DDL event trigger.
-- Preserve its definition, trigger registration and explicit server grants.
-- Fresh local stacks may not have installed the helper.
DO $$
DECLARE
  helper regprocedure := to_regprocedure('public.rls_auto_enable()');
BEGIN
  IF helper IS NULL THEN
    RETURN;
  END IF;
  IF (SELECT prorettype FROM pg_proc WHERE oid = helper) <> 'pg_catalog.event_trigger'::regtype THEN
    RAISE EXCEPTION 'Expected public.rls_auto_enable() to return event_trigger';
  END IF;
  REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
END;
$$;
