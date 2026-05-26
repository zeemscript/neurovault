-- Employee Onboarding: enrollment links + invite tracking

-- 1. Extend org_members role to include 'employee'
ALTER TABLE org_members DROP CONSTRAINT org_members_role_check;
ALTER TABLE org_members ADD CONSTRAINT org_members_role_check
  CHECK (role IN ('owner', 'admin', 'member', 'viewer', 'employee'));

-- 2. Enrollment links (shareable URLs for employee self-enrollment)
CREATE TABLE enrollment_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code          TEXT UNIQUE NOT NULL,
  label         TEXT,
  created_by    UUID NOT NULL REFERENCES auth.users(id),
  max_uses      INTEGER,
  used_count    INTEGER DEFAULT 0,
  expires_at    TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_enrollment_links_code ON enrollment_links(code) WHERE is_active = true;
CREATE INDEX idx_enrollment_links_org ON enrollment_links(org_id);

ALTER TABLE enrollment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage enrollment links"
  ON enrollment_links FOR ALL
  USING (org_id IN (
    SELECT org_id FROM org_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Allow public reads by code (for enrollment page validation)
CREATE POLICY "Public can read active links by code"
  ON enrollment_links FOR SELECT
  USING (is_active = true);

-- 3. Enrollment invites (per-email tracking)
CREATE TABLE enrollment_invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  enrollment_link_id UUID REFERENCES enrollment_links(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'completed', 'expired')),
  completed_at  TIMESTAMPTZ,
  created_by    UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, email)
);

CREATE INDEX idx_enrollment_invites_org ON enrollment_invites(org_id, status);

ALTER TABLE enrollment_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage enrollment invites"
  ON enrollment_invites FOR ALL
  USING (org_id IN (
    SELECT org_id FROM org_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Allow system inserts (via admin client)
CREATE POLICY "System can insert invites"
  ON enrollment_invites FOR INSERT
  WITH CHECK (true);
