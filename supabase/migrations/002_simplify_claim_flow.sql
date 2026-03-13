-- Migration 002: Simplify claim flow
-- Drop manual review queue (claim_requests table)
-- Simplify enums — every account is auto-verified via email match

-- Drop the claim_requests table and its enum
DROP TABLE IF EXISTS claim_requests;
DROP TYPE IF EXISTS claim_request_status;

-- Remove unused claim_method enum (only email match is supported)
-- First remove the column from profiles, then drop the type
ALTER TABLE profiles DROP COLUMN IF EXISTS claim_method;
DROP TYPE IF EXISTS claim_method;

-- Simplify claim_status: drop 'pending' and 'rejected', only 'verified' remains.
-- Since every account is auto-verified, change column to a simple boolean default true
-- and drop the enum.
ALTER TABLE profiles DROP COLUMN IF EXISTS claim_status;
DROP TYPE IF EXISTS claim_status;

-- Add a simpler verified flag (always true for accounts created via claim flow)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT true;
