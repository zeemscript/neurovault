-- Active sessions: tracks which AI tools are currently open in user browsers
-- Updated by the extension on each heartbeat (every flush cycle ~1min)

CREATE TABLE active_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_tool_id    TEXT NOT NULL REFERENCES ai_tools(id),
  tab_url       TEXT,
  page_title    TEXT,
  started_at    TIMESTAMPTZ DEFAULT now(),
  last_heartbeat TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_active_sessions_org ON active_sessions(org_id);
CREATE INDEX idx_active_sessions_user ON active_sessions(user_id);

ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read org sessions"
  ON active_sessions FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "System can manage sessions"
  ON active_sessions FOR ALL
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE active_sessions;
