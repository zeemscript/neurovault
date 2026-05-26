-- Access request system: users can request temporary access to blocked tools
-- Admins can grant/deny with optional time limits

CREATE TABLE access_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_tool_id    TEXT NOT NULL REFERENCES ai_tools(id),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  reason        TEXT,
  admin_note    TEXT,
  granted_by    UUID REFERENCES auth.users(id),
  granted_at    TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_access_requests_org ON access_requests(org_id, status, created_at DESC);
CREATE INDEX idx_access_requests_user ON access_requests(user_id, ai_tool_id, status);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read org access requests"
  ON access_requests FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "System can manage access requests"
  ON access_requests FOR ALL
  WITH CHECK (true);

-- Enable realtime for access requests
ALTER PUBLICATION supabase_realtime ADD TABLE access_requests;
