-- Migration: P2.1 - Social Agnostic Schema Evolution
-- Version: 20260812000000
-- Description: Evolves legacy instagram_* tables to platform-agnostic social_* tables,
--              creates social_connection_credentials table with strict RLS and grants,
--              and creates social_audience_snapshots table.

BEGIN;

-- 1. Create Social Platform Enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'social_platform') THEN
        CREATE TYPE social_platform AS ENUM ('instagram', 'tiktok', 'youtube', 'linkedin', 'x');
    END IF;
END $$;

-- 2. Rename Legacy Tables
ALTER TABLE IF EXISTS instagram_accounts RENAME TO social_accounts;
ALTER TABLE IF EXISTS instagram_daily_metrics RENAME TO social_account_metrics;
ALTER TABLE IF EXISTS instagram_media RENAME TO social_content;
ALTER TABLE IF EXISTS instagram_media_metrics RENAME TO social_content_metrics;

-- 3. Update social_accounts Table
ALTER TABLE social_accounts
    ADD COLUMN IF NOT EXISTS platform social_platform NOT NULL DEFAULT 'instagram',
    ADD COLUMN IF NOT EXISTS external_account_id VARCHAR(255);

-- Make legacy instagram_user_id optional for multi-platform compatibility
ALTER TABLE social_accounts 
    ALTER COLUMN instagram_user_id DROP NOT NULL;

-- Populate external_account_id from legacy instagram_user_id if present
UPDATE social_accounts 
SET external_account_id = instagram_user_id 
WHERE external_account_id IS NULL AND instagram_user_id IS NOT NULL;

-- For any remaining null external_account_id, assign a placeholder UUID/id
UPDATE social_accounts
SET external_account_id = id::text
WHERE external_account_id IS NULL;

-- Make external_account_id NOT NULL
ALTER TABLE social_accounts 
    ALTER COLUMN external_account_id SET NOT NULL;

-- Add Unique constraint on (platform, external_account_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'social_accounts_platform_external_id_key'
    ) THEN
        ALTER TABLE social_accounts 
            ADD CONSTRAINT social_accounts_platform_external_id_key UNIQUE (platform, external_account_id);
    END IF;
END $$;

-- Drop obsolete legacy token columns from social_accounts (credentials moved to server-only table)
ALTER TABLE social_accounts DROP COLUMN IF EXISTS access_token;
ALTER TABLE social_accounts DROP COLUMN IF EXISTS token_expires_at;

-- 4. Update social_account_metrics Table
ALTER TABLE social_account_metrics 
    ADD COLUMN IF NOT EXISTS platform social_platform NOT NULL DEFAULT 'instagram';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'social_account_metrics' AND column_name = 'instagram_account_id'
    ) THEN
        ALTER TABLE social_account_metrics RENAME COLUMN instagram_account_id TO account_id;
    END IF;
END $$;

-- 5. Update social_content Table
ALTER TABLE social_content 
    ADD COLUMN IF NOT EXISTS platform social_platform NOT NULL DEFAULT 'instagram',
    ADD COLUMN IF NOT EXISTS external_content_id VARCHAR(255);

-- Make legacy instagram_media_id optional for multi-platform compatibility
ALTER TABLE social_content 
    ALTER COLUMN instagram_media_id DROP NOT NULL;

UPDATE social_content 
SET external_content_id = instagram_media_id 
WHERE external_content_id IS NULL AND instagram_media_id IS NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'social_content' AND column_name = 'instagram_account_id'
    ) THEN
        ALTER TABLE social_content RENAME COLUMN instagram_account_id TO account_id;
    END IF;
END $$;

-- 6. Update social_content_metrics Table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'social_content_metrics' AND column_name = 'instagram_media_id'
    ) THEN
        ALTER TABLE social_content_metrics RENAME COLUMN instagram_media_id TO content_id;
    END IF;
END $$;

-- 7. Create social_audience_snapshots Table
CREATE TABLE IF NOT EXISTS social_audience_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    platform social_platform NOT NULL DEFAULT 'instagram',
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    age_distribution JSONB DEFAULT '{}'::jsonb,
    gender_distribution JSONB DEFAULT '{}'::jsonb,
    top_cities JSONB DEFAULT '{}'::jsonb,
    top_countries JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT social_audience_snapshots_account_date_key UNIQUE (account_id, snapshot_date)
);

-- 8. Create Server-Only social_connection_credentials Table
CREATE TABLE IF NOT EXISTS social_connection_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL UNIQUE REFERENCES social_accounts(id) ON DELETE CASCADE,
    platform social_platform NOT NULL DEFAULT 'instagram',
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Update plan_limits Table for Social Agnostic Limits
ALTER TABLE plan_limits 
    ADD COLUMN IF NOT EXISTS max_social_accounts INT NOT NULL DEFAULT 1;

UPDATE plan_limits 
SET max_social_accounts = max_instagram_accounts 
WHERE max_instagram_accounts IS NOT NULL;

-- 10. Enable Row Level Security (RLS) on all social tables
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_account_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_audience_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connection_credentials ENABLE ROW LEVEL SECURITY;

-- 11. Drop legacy policies and recreate strict policies
DROP POLICY IF EXISTS "Users can view own instagram accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can view own social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can insert own social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can update own social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can delete own social accounts" ON social_accounts;

CREATE POLICY "Users can view own social accounts" ON social_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social accounts" ON social_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts" ON social_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts" ON social_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Read-only RLS policies for synced analytics tables (authenticated users can only SELECT)
DROP POLICY IF EXISTS "Users can view metrics of own accounts" ON social_account_metrics;
CREATE POLICY "Users can view metrics of own accounts" ON social_account_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_accounts 
            WHERE social_accounts.id = social_account_metrics.account_id 
              AND social_accounts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view content of own accounts" ON social_content;
CREATE POLICY "Users can view content of own accounts" ON social_content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_accounts 
            WHERE social_accounts.id = social_content.account_id 
              AND social_accounts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view content metrics of own accounts" ON social_content_metrics;
CREATE POLICY "Users can view content metrics of own accounts" ON social_content_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_content
            JOIN social_accounts ON social_accounts.id = social_content.account_id
            WHERE social_content.id = social_content_metrics.content_id 
              AND social_accounts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view audience of own accounts" ON social_audience_snapshots;
CREATE POLICY "Users can view audience of own accounts" ON social_audience_snapshots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_accounts 
            WHERE social_accounts.id = social_audience_snapshots.account_id 
              AND social_accounts.user_id = auth.uid()
        )
    );

-- STRICT SECURITY FOR social_connection_credentials:
-- NO policies created for anon or authenticated roles!
-- RLS remains ENABLED so all public Data API calls are blocked by default.

-- 12. Revoke and Grant Explicit SQL Privileges

-- Revoke all privileges on credentials table from public/anon/authenticated
REVOKE ALL ON social_connection_credentials FROM PUBLIC, anon, authenticated;
GRANT ALL ON social_connection_credentials TO service_role;

-- Public Analytics Tables Privileges:
-- anon: NO privileges
REVOKE ALL ON social_accounts, social_account_metrics, social_content, social_content_metrics, social_audience_snapshots FROM anon;

-- authenticated: SELECT only on synced metrics/content/audience, CRUD on social_accounts
REVOKE ALL ON social_account_metrics, social_content, social_content_metrics, social_audience_snapshots FROM authenticated;
GRANT SELECT ON social_account_metrics, social_content, social_content_metrics, social_audience_snapshots TO authenticated;

REVOKE ALL ON social_accounts FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_accounts TO authenticated;

-- service_role: FULL access for backend workers
GRANT ALL ON social_accounts, social_account_metrics, social_content, social_content_metrics, social_audience_snapshots TO service_role;

COMMIT;
