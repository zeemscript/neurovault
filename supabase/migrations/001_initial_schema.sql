-- NeuroVault Initial Schema
-- Phase 1: Foundation tables

-- Organizations
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  domain        TEXT,
  plan          TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Profiles (mirrors auth.users with app-specific fields)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  current_org_id UUID REFERENCES organizations(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Organization members
CREATE TABLE org_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Phase 2: Shadow AI Detection tables

-- Known AI tools registry
CREATE TABLE ai_tools (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  domains       TEXT[] NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('llm', 'image-gen', 'code', 'search', 'writing', 'ml-platform', 'productivity')),
  default_risk  TEXT DEFAULT 'medium' CHECK (default_risk IN ('low', 'medium', 'high', 'critical')),
  icon_url      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Activity events (high-write table)
CREATE TABLE activity_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_tool_id    TEXT REFERENCES ai_tools(id),
  url           TEXT NOT NULL,
  page_title    TEXT,
  duration_secs INTEGER,
  event_type    TEXT DEFAULT 'visit' CHECK (event_type IN ('visit', 'paste', 'upload', 'download')),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_activity_org_created ON activity_events(org_id, created_at DESC);
CREATE INDEX idx_activity_org_tool ON activity_events(org_id, ai_tool_id);
CREATE INDEX idx_activity_user ON activity_events(user_id, created_at DESC);

-- Policies
CREATE TABLE policies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ai_tool_id    TEXT REFERENCES ai_tools(id),
  category      TEXT CHECK (category IN ('llm', 'image-gen', 'code', 'search', 'writing', 'ml-platform', 'productivity')),
  action        TEXT NOT NULL DEFAULT 'monitor' CHECK (action IN ('monitor', 'warn', 'block')),
  reason        TEXT,
  enabled       BOOLEAN DEFAULT true,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Extension tokens
CREATE TABLE extension_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token         TEXT UNIQUE NOT NULL,
  device_info   JSONB DEFAULT '{}',
  is_active     BOOLEAN DEFAULT true,
  last_seen_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-----------------------------------------------------------
-- Row Level Security
-----------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_tokens ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Organizations: members can read their org
CREATE POLICY "Members can read their org"
  ON organizations FOR SELECT
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Owners/admins can update org"
  ON organizations FOR UPDATE
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Org members: members can read their org's members
CREATE POLICY "Members can read org members"
  ON org_members FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage org members"
  ON org_members FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- AI tools: readable by all authenticated users
CREATE POLICY "Authenticated users can read ai_tools"
  ON ai_tools FOR SELECT USING (auth.uid() IS NOT NULL);

-- Activity events: org members can read their org's events
CREATE POLICY "Members can read org activity"
  ON activity_events FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Members can insert activity"
  ON activity_events FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Policies: org members can read, admins can manage
CREATE POLICY "Members can read org policies"
  ON policies FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage policies"
  ON policies FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Extension tokens: users can manage their own
CREATE POLICY "Users can read own tokens"
  ON extension_tokens FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users can manage own tokens"
  ON extension_tokens FOR ALL
  USING (user_id = auth.uid());

-----------------------------------------------------------
-- Trigger: auto-create profile on user signup
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-----------------------------------------------------------
-- Seed: Known AI tools
-----------------------------------------------------------

INSERT INTO ai_tools (id, name, domains, category, default_risk) VALUES
  ('chatgpt', 'ChatGPT', ARRAY['chat.openai.com', 'chatgpt.com'], 'llm', 'medium'),
  ('claude', 'Claude', ARRAY['claude.ai'], 'llm', 'medium'),
  ('gemini', 'Gemini', ARRAY['gemini.google.com', 'bard.google.com'], 'llm', 'medium'),
  ('midjourney', 'Midjourney', ARRAY['midjourney.com'], 'image-gen', 'medium'),
  ('copilot', 'GitHub Copilot', ARRAY['github.com/copilot', 'copilot.microsoft.com'], 'code', 'low'),
  ('perplexity', 'Perplexity', ARRAY['perplexity.ai'], 'search', 'low'),
  ('huggingface', 'Hugging Face', ARRAY['huggingface.co'], 'ml-platform', 'medium'),
  ('replicate', 'Replicate', ARRAY['replicate.com'], 'ml-platform', 'medium'),
  ('stability', 'Stability AI', ARRAY['stability.ai'], 'image-gen', 'medium'),
  ('jasper', 'Jasper', ARRAY['jasper.ai'], 'writing', 'low'),
  ('writesonic', 'Writesonic', ARRAY['writesonic.com'], 'writing', 'low'),
  ('copy-ai', 'Copy.ai', ARRAY['copy.ai'], 'writing', 'low'),
  ('notion-ai', 'Notion AI', ARRAY['notion.so'], 'productivity', 'low');
