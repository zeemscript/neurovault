-- Identity Protection: Discovered Corporate and Personal SaaS Identities
-- Phase 1: Database table for tracking SaaS identities discovered via Chrome extension

CREATE TABLE saas_identities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name      TEXT NOT NULL,
  app_id        TEXT NOT NULL,
  email         TEXT NOT NULL,
  identity_type TEXT NOT NULL CHECK (identity_type IN ('corporate', 'personal')),
  status        TEXT NOT NULL DEFAULT 'secure' CHECK (status IN ('secure', 'warn', 'breached')),
  mfa_enabled   BOOLEAN DEFAULT true,
  sso_connected BOOLEAN DEFAULT false,
  last_active   TIMESTAMPTZ DEFAULT now(),
  details       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexing for quick lookups
CREATE INDEX idx_saas_identities_org ON saas_identities(org_id);
CREATE INDEX idx_saas_identities_user ON saas_identities(user_id);
CREATE INDEX idx_saas_identities_app ON saas_identities(app_id);
CREATE INDEX idx_saas_identities_email ON saas_identities(email);

-- Enable RLS
ALTER TABLE saas_identities ENABLE ROW LEVEL SECURITY;

-- Policies for saas_identities
CREATE POLICY "Members can read org saas_identities"
  ON saas_identities FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage saas_identities"
  ON saas_identities FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "System can insert saas_identities"
  ON saas_identities FOR INSERT
  WITH CHECK (true);
