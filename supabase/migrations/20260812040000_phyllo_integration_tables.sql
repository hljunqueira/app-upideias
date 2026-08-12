-- Migration: P2.1 - Phyllo Social Integration & Webhook Log Tables
-- Version: 20260812040000
-- Description: Creates user_social_providers for mapping Supabase user_id to phyllo_user_id,
--              and webhook_event_logs for webhook idempotency and audit logs.

BEGIN;

-- 1. Create user_social_providers Table
CREATE TABLE IF NOT EXISTS user_social_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'phyllo',
    phyllo_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_social_providers_user_provider_key UNIQUE (user_id, provider)
);

-- 2. Create webhook_event_logs Table
CREATE TABLE IF NOT EXISTS webhook_event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL DEFAULT 'phyllo',
    provider_event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT webhook_event_logs_provider_event_key UNIQUE (provider, provider_event_id)
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_social_providers_phyllo_user_id ON user_social_providers(phyllo_user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_event_logs_event_type ON webhook_event_logs(provider, event_type);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE user_social_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_event_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Users can view own social provider mapping" ON user_social_providers;
CREATE POLICY "Users can view own social provider mapping" ON user_social_providers
    FOR SELECT USING (auth.uid() = user_id);

-- 6. Grants & Security Isolation
REVOKE ALL ON user_social_providers, webhook_event_logs FROM PUBLIC, anon;

-- authenticated users can only SELECT their own user_social_providers mapping
REVOKE ALL ON webhook_event_logs FROM authenticated;
REVOKE ALL ON user_social_providers FROM authenticated;
GRANT SELECT ON user_social_providers TO authenticated;

-- service_role has full access for backend and webhook handlers
GRANT ALL ON user_social_providers, webhook_event_logs TO service_role;

COMMIT;
