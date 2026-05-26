export type RiskLevel = "low" | "medium" | "high" | "critical";
export type PolicyAction = "monitor" | "warn" | "block";
export type MemberRole = "owner" | "admin" | "member" | "viewer" | "employee";
export type AiToolCategory =
  | "llm"
  | "image-gen"
  | "code"
  | "search"
  | "writing"
  | "ml-platform"
  | "productivity";
export type EventType = "visit" | "paste" | "upload" | "download";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  plan: "free" | "pro" | "enterprise";
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  current_org_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
  profile?: Profile;
}

export interface AiTool {
  id: string;
  name: string;
  domains: string[];
  category: AiToolCategory;
  default_risk: RiskLevel;
  icon_url: string | null;
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  org_id: string;
  user_id: string;
  ai_tool_id: string | null;
  url: string;
  page_title: string | null;
  duration_secs: number | null;
  event_type: EventType;
  metadata: Record<string, unknown>;
  created_at: string;
  ai_tool?: AiTool;
  profile?: Profile;
}

export interface Policy {
  id: string;
  org_id: string;
  ai_tool_id: string | null;
  category: AiToolCategory | null;
  action: PolicyAction;
  reason: string | null;
  enabled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  ai_tool?: AiTool;
}

export interface ExtensionToken {
  id: string;
  org_id: string;
  user_id: string;
  token: string;
  device_info: Record<string, unknown>;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
}

export interface EnrollmentLink {
  id: string;
  org_id: string;
  code: string;
  label: string | null;
  created_by: string;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EnrollmentInvite {
  id: string;
  org_id: string;
  email: string;
  enrollment_link_id: string | null;
  status: "pending" | "completed" | "expired";
  completed_at: string | null;
  created_by: string;
  created_at: string;
}

export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "acknowledged" | "resolved" | "dismissed";
export type AlertRuleType = "tool_blocked" | "high_risk_visit" | "threshold";

export interface AlertRuleCondition {
  type: AlertRuleType;
  ai_tool_id?: string;
  category?: AiToolCategory;
  threshold_count?: number;
  threshold_window_minutes?: number;
}

export interface AlertRule {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  condition: AlertRuleCondition;
  severity: AlertSeverity;
  enabled: boolean;
  notify_email: boolean;
  notify_dashboard: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  org_id: string;
  rule_id: string | null;
  title: string;
  description: string | null;
  severity: AlertSeverity;
  status: AlertStatus;
  source_event_id: string | null;
  source_user_id: string | null;
  ai_tool_id: string | null;
  metadata: Record<string, unknown>;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  ai_tool?: AiTool;
  profile?: Profile;
  rule?: AlertRule;
}
