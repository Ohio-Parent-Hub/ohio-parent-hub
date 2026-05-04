-- Migration 003: Jobs Hub foundation
-- Adds provider job postings for premium daycare owners.

CREATE TABLE daycare_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_number TEXT NOT NULL REFERENCES profiles(program_number) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  job_url TEXT,
  application_email_mode TEXT NOT NULL DEFAULT 'default'
    CHECK (application_email_mode IN ('default', 'custom')),
  application_email_custom TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER daycare_jobs_updated_at
  BEFORE UPDATE ON daycare_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE daycare_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published jobs"
  ON daycare_jobs FOR SELECT
  USING (published = true);

CREATE POLICY "Owners can read own jobs"
  ON daycare_jobs FOR SELECT
  USING (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert own jobs"
  ON daycare_jobs FOR INSERT
  WITH CHECK (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own jobs"
  ON daycare_jobs FOR UPDATE
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

CREATE POLICY "Owners can delete own jobs"
  ON daycare_jobs FOR DELETE
  USING (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );

CREATE INDEX idx_daycare_jobs_program_number ON daycare_jobs(program_number);
CREATE INDEX idx_daycare_jobs_published ON daycare_jobs(published) WHERE published = true;
CREATE INDEX idx_daycare_jobs_created_at ON daycare_jobs(created_at DESC);
