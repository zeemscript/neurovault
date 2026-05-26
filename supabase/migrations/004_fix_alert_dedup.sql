-- Fix: Add dedup to all alert rule types (not just threshold)
-- Prevents duplicate alerts for the same user+tool within a 10-minute window

CREATE OR REPLACE FUNCTION check_alert_rules()
RETURNS TRIGGER AS $$
DECLARE
  rule RECORD;
  tool_name TEXT;
  dedup_window INTERVAL;
BEGIN
  -- Get the AI tool name
  SELECT name INTO tool_name FROM ai_tools WHERE id = NEW.ai_tool_id;

  -- Check each enabled rule for this org
  FOR rule IN
    SELECT * FROM alert_rules
    WHERE org_id = NEW.org_id AND enabled = true
  LOOP
    -- Default dedup window: 10 minutes (prevents alert spam)
    dedup_window := '10 minutes'::INTERVAL;

    -- Skip if a similar alert already exists within the dedup window
    IF EXISTS (
      SELECT 1 FROM alerts
      WHERE org_id = NEW.org_id
        AND rule_id = rule.id
        AND source_user_id = NEW.user_id
        AND COALESCE(ai_tool_id, '') = COALESCE(NEW.ai_tool_id, '')
        AND created_at >= NOW() - dedup_window
    ) THEN
      CONTINUE;
    END IF;

    -- Check blocked tool access
    IF (rule.condition->>'type') = 'tool_blocked' THEN
      IF EXISTS (
        SELECT 1 FROM policies
        WHERE org_id = NEW.org_id
          AND (ai_tool_id = NEW.ai_tool_id OR (ai_tool_id IS NULL AND category = (SELECT category FROM ai_tools WHERE id = NEW.ai_tool_id)))
          AND action = 'block'
          AND enabled = true
      ) THEN
        INSERT INTO alerts (org_id, rule_id, title, description, severity, source_event_id, source_user_id, ai_tool_id)
        VALUES (
          NEW.org_id, rule.id,
          'Blocked tool accessed: ' || COALESCE(tool_name, NEW.ai_tool_id),
          'A user attempted to access a blocked AI tool.',
          rule.severity, NEW.id, NEW.user_id, NEW.ai_tool_id
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
          NEW.org_id, rule.id,
          'High-risk AI tool accessed: ' || COALESCE(tool_name, NEW.ai_tool_id),
          'A user accessed an AI tool classified as high risk.',
          rule.severity, NEW.id, NEW.user_id, NEW.ai_tool_id
        );
      END IF;
    END IF;

    -- Check threshold
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
          INSERT INTO alerts (org_id, rule_id, title, description, severity, source_event_id, source_user_id, ai_tool_id)
          VALUES (
            NEW.org_id, rule.id,
            'High activity threshold exceeded',
            'User exceeded ' || threshold_count || ' events in ' || window_minutes || ' minutes.',
            rule.severity, NEW.id, NEW.user_id, NEW.ai_tool_id
          );
        END IF;
      END;
    END IF;

  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
