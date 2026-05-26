-- Safe Browsing: Browser Extension Monitoring
-- Tracks installed browser extensions across org members with risk assessment

CREATE TABLE browser_extensions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  extension_id    TEXT NOT NULL,
  name            TEXT NOT NULL,
  version         TEXT,
  description     TEXT,
  enabled         BOOLEAN DEFAULT true,
  install_type    TEXT CHECK (install_type IN ('admin', 'development', 'normal', 'sideload', 'other')),
  risk_level      TEXT DEFAULT 'unknown' CHECK (risk_level IN ('safe', 'low', 'medium', 'high', 'critical', 'unknown')),
  risk_reasons    TEXT[] DEFAULT '{}',
  risk_score      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'new' CHECK (status IN ('new', 'allowed', 'blocked', 'monitored')),
  permissions     TEXT[] DEFAULT '{}',
  host_permissions TEXT[] DEFAULT '{}',
  homepage_url    TEXT,
  update_url      TEXT,
  first_seen      TIMESTAMPTZ DEFAULT now(),
  last_seen       TIMESTAMPTZ DEFAULT now(),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id, extension_id)
);

CREATE INDEX idx_browser_ext_org ON browser_extensions(org_id);
CREATE INDEX idx_browser_ext_user ON browser_extensions(user_id);
CREATE INDEX idx_browser_ext_risk ON browser_extensions(org_id, risk_level);
CREATE INDEX idx_browser_ext_status ON browser_extensions(org_id, status);

ALTER TABLE browser_extensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read org browser extensions"
  ON browser_extensions FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage browser extensions"
  ON browser_extensions FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "System can insert browser extensions"
  ON browser_extensions FOR INSERT
  WITH CHECK (true);
