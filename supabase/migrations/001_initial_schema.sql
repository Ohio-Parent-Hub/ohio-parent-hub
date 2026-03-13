-- Ohio Parent Hub: Initial schema migration
-- Tables: profiles, premium_listings, claim_requests
-- Run this in Supabase SQL Editor or via management API

-- ============================================================
-- Custom ENUM types
-- ============================================================
CREATE TYPE claim_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE claim_method AS ENUM ('email_match', 'manual_review');
CREATE TYPE subscription_status AS ENUM ('none', 'active', 'past_due', 'cancelled');
CREATE TYPE claim_request_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- profiles (daycare owner accounts)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  program_number TEXT UNIQUE NOT NULL,
  claim_status claim_status NOT NULL DEFAULT 'pending',
  claim_method claim_method,
  stripe_customer_id TEXT,
  subscription_status subscription_status NOT NULL DEFAULT 'none',
  subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- premium_listings (owner-submitted content)
-- ============================================================
CREATE TABLE premium_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_number TEXT UNIQUE NOT NULL REFERENCES profiles(program_number) ON DELETE CASCADE,
  hours JSONB,
  pricing JSONB,
  amenities JSONB,
  custom_faqs JSONB,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  photos TEXT[] DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- claim_requests (manual verification queue)
-- ============================================================
CREATE TABLE claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_number TEXT NOT NULL,
  email TEXT NOT NULL,
  requester_name TEXT,
  proof_description TEXT,
  status claim_request_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================================
-- updated_at auto-trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER premium_listings_updated_at
  BEFORE UPDATE ON premium_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security policies
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- premium_listings
ALTER TABLE premium_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published listings"
  ON premium_listings FOR SELECT
  USING (published = true);

CREATE POLICY "Owners can read own listing"
  ON premium_listings FOR SELECT
  USING (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert own listing"
  ON premium_listings FOR INSERT
  WITH CHECK (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own listing"
  ON premium_listings FOR UPDATE
  USING (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete own listing"
  ON premium_listings FOR DELETE
  USING (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );

-- claim_requests
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert claim requests"
  ON claim_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own claim requests"
  ON claim_requests FOR SELECT
  USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Admin operations on claim_requests use service_role key (bypasses RLS)

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_profiles_program_number ON profiles(program_number);
CREATE INDEX idx_premium_listings_program_number ON premium_listings(program_number);
CREATE INDEX idx_premium_listings_published ON premium_listings(published) WHERE published = true;
CREATE INDEX idx_claim_requests_program_number ON claim_requests(program_number);
CREATE INDEX idx_claim_requests_status ON claim_requests(status) WHERE status = 'pending';
