-- Phase 3: Alerts & Analytics tables

-- Alert rules: configurable conditions that trigger alerts
CREATE TABLE alert_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  condition     JSONB NOT NULL,
  -- condition format: { "type": "tool_blocked"|"high_risk_visit"|"threshold", "ai_tool_id"?: str, "category"?: str, "threshold_count"?: int, "threshold_window_minutes"?: int }
  severity      TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  enabled       BOOLEAN DEFAULT true,
  notify_email  BOOLEAN DEFAULT true,
  notify_dashboard BOOLEAN DEFAULT true,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Alerts: triggered instances of alert rules
CREATE TABLE alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rule_id       UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  severity      TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  source_event_id UUID REFERENCES activity_events(id) ON DELETE SET NULL,
  source_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ai_tool_id    TEXT REFERENCES ai_tools(id),
  metadata      JSONB DEFAULT '{}',
  resolved_by   UUID REFERENCES auth.users(id),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_alerts_org_status ON alerts(org_id, status, created_at DESC);
CREATE INDEX idx_alerts_org_severity ON alerts(org_id, severity, created_at DESC);
CREATE INDEX idx_alert_rules_org ON alert_rules(org_id);

-----------------------------------------------------------
-- RLS for alert tables
-----------------------------------------------------------

ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read org alert rules"
  ON alert_rules FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage alert rules"
  ON alert_rules FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Members can read org alerts"
  ON alerts FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update alert status"
  ON alerts FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "System can insert alerts"
  ON alerts FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-----------------------------------------------------------
-- Function: auto-generate alerts on activity_events insert
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION check_alert_rules()
RETURNS TRIGGER AS $$
DECLARE
  rule RECORD;
  tool_name TEXT;
BEGIN
  -- Get the AI tool name
  SELECT name INTO tool_name FROM ai_tools WHERE id = NEW.ai_tool_id;

  -- Check each enabled rule for this org
  FOR rule IN
    SELECT * FROM alert_rules
    WHERE org_id = NEW.org_id AND enabled = true
  LOOP
    -- Check blocked tool access
    IF (rule.condition->>'type') = 'tool_blocked' THEN
      IF EXISTS (
        SELECT 1 FROM policies
        WHERE org_id = NEW.org_id
          AND (ai_tool_id = NEW.ai_tool_id OR ai_tool_id IS NULL)
          AND action = 'block'
          AND enabled = true
      ) THEN
        INSERT INTO alerts (org_id, rule_id, title, description, severity, source_event_id, source_user_id, ai_tool_id)
        VALUES (
          NEW.org_id,
          rule.id,
          'Blocked tool accessed: ' || COALESCE(tool_name, NEW.ai_tool_id),
          'A user attempted to access a blocked AI tool.',
          rule.severity,
          NEW.id,
          NEW.user_id,
          NEW.ai_tool_id
        );
      END IF;
    END IF;

    -- Check high-risk visits
    IF (rule.condition->>'type') = 'high_risk_visit' THEN
      IF EXISTS (
        SELECT 1 FROM ai_tools
        WHERE id = NEW.ai_tool_id AND default_risk IN ('high', 'critical')
      ) THEN
        INSERT INTO alerts (org_id, rule_id, title, description, severity, source_event_id, source_user_id, ai_tool_id)
        VALUES (
          NEW.org_id,
          rule.id,
          'High-risk AI tool accessed: ' || COALESCE(tool_name, NEW.ai_tool_id),
          'A user accessed an AI tool classified as high risk.',
          rule.severity,
          NEW.id,
          NEW.user_id,
          NEW.ai_tool_id
        );
      END IF;
    END IF;

    -- Check threshold (N visits in M minutes)
    IF (rule.condition->>'type') = 'threshold' THEN
      DECLARE
        threshold_count INT := COALESCE((rule.condition->>'threshold_count')::INT, 10);
        window_minutes INT := COALESCE((rule.condition->>'threshold_window_minutes')::INT, 60);
        recent_count INT;
      BEGIN
        SELECT COUNT(*) INTO recent_count
        FROM activity_events
        WHERE org_id = NEW.org_id
          AND user_id = NEW.user_id
          AND created_at >= NOW() - (window_minutes || ' minutes')::INTERVAL;

        IF recent_count >= threshold_count THEN
          -- Avoid duplicate threshold alerts within the window
          IF NOT EXISTS (
            SELECT 1 FROM alerts
            WHERE org_id = NEW.org_id
              AND rule_id = rule.id
              AND source_user_id = NEW.user_id
              AND created_at >= NOW() - (window_minutes || ' minutes')::INTERVAL
          ) THEN
            INSERT INTO alerts (org_id, rule_id, title, description, severity, source_event_id, source_user_id, ai_tool_id)
            VALUES (
              NEW.org_id,
              rule.id,
              'High activity threshold exceeded',
              'User exceeded ' || threshold_count || ' events in ' || window_minutes || ' minutes.',
              rule.severity,
              NEW.id,
              NEW.user_id,
              NEW.ai_tool_id
            );
          END IF;
        END IF;
      END;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_activity_event_check_alerts
  AFTER INSERT ON activity_events
  FOR EACH ROW EXECUTE FUNCTION check_alert_rules();
