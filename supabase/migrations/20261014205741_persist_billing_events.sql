ALTER TABLE public.profiles ADD COLUMN billing_event_created bigint NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN billing_event_priority smallint NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN billing_event_subscription_id text;
CREATE TABLE public.billing_event_receipts (
  event_id text PRIMARY KEY,
  customer_id text NOT NULL,
  event_created bigint NOT NULL,
  outcome text NOT NULL
);
ALTER TABLE public.billing_event_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.billing_event_receipts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.billing_event_receipts TO service_role;

CREATE FUNCTION public.apply_billing_event(p_event_id text, p_event_type text, p_created bigint, p_customer_id text, p_subscription_id text)
RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE p public.profiles%ROWTYPE; priority smallint; next_status public.subscription_status; outcome text;
BEGIN
  IF p_event_id IS NULL OR p_created IS NULL OR p_created < 0 OR p_customer_id IS NULL OR p_subscription_id IS NULL THEN
    RAISE EXCEPTION 'Invalid billing event';
  END IF;
  CASE p_event_type
    WHEN 'checkout.session.completed' THEN priority := 10; next_status := 'active';
    WHEN 'invoice.payment_succeeded' THEN priority := 20; next_status := 'active';
    WHEN 'invoice.payment_failed' THEN priority := 30; next_status := 'past_due';
    WHEN 'customer.subscription.deleted' THEN priority := 40; next_status := 'cancelled';
    ELSE RAISE EXCEPTION 'Unsupported billing event';
  END CASE;
  -- The owner row serializes all events for this customer. The receipt and profile
  -- update share one transaction, so failed persistence cannot poison deduplication.
  SELECT * INTO STRICT p FROM public.profiles WHERE stripe_customer_id = p_customer_id FOR UPDATE;
  IF EXISTS (SELECT 1 FROM public.billing_event_receipts WHERE event_id = p_event_id) THEN RETURN 'duplicate'; END IF;
  outcome := 'applied';
  IF p_created < p.billing_event_created THEN outcome := 'stale';
  ELSIF p_event_type <> 'checkout.session.completed' AND
    COALESCE(p.subscription_id, p.billing_event_subscription_id) IS NOT NULL AND
    p_subscription_id <> COALESCE(p.subscription_id, p.billing_event_subscription_id) THEN outcome := 'subscription_mismatch';
  ELSIF p.subscription_status = 'cancelled' AND (p_event_type <> 'checkout.session.completed' OR p_subscription_id = p.billing_event_subscription_id) THEN outcome := 'stale';
  ELSIF p_created = p.billing_event_created AND priority <= p.billing_event_priority AND
    NOT (p_event_type = 'checkout.session.completed' AND p_subscription_id IS DISTINCT FROM p.billing_event_subscription_id) THEN outcome := 'stale';
  END IF;
  IF outcome = 'applied' THEN
    UPDATE public.profiles SET subscription_status = next_status,
      subscription_id = CASE WHEN next_status = 'cancelled' THEN NULL ELSE p_subscription_id END,
      billing_event_created = p_created, billing_event_priority = priority,
      billing_event_subscription_id = p_subscription_id WHERE id = p.id;
  END IF;
  INSERT INTO public.billing_event_receipts VALUES(p_event_id,p_customer_id,p_created,outcome);
  RETURN outcome;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_billing_event(text,text,bigint,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_billing_event(text,text,bigint,text,text) TO service_role;
CREATE INDEX profiles_stripe_customer_lookup ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
