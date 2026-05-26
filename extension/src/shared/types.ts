export type RiskLevel = "low" | "medium" | "high" | "critical";
export type PolicyAction = "monitor" | "warn" | "block";
export type AiToolCategory =
  | "llm"
  | "image-gen"
  | "code"
  | "search"
  | "writing"
  | "ml-platform"
  | "productivity";
export type EventType = "visit" | "paste" | "upload" | "download";

export interface AiTool {
  id: string;
  name: string;
  domains: string[];
  category: AiToolCategory;
  default_risk: RiskLevel;
  icon_url: string | null;
}

export interface Policy {
  id: string;
  org_id: string;
  ai_tool_id: string | null;
  category: AiToolCategory | null;
  action: PolicyAction;
  reason: string | null;
  enabled: boolean;
  ai_tool?: AiTool;
}

export interface DlpResult {
  patterns_detected: string[];
  pattern_counts: Record<string, number>;
  risk_score: number;
  content_length: number;
  flagged: boolean;
}

export interface ActivityReportEvent {
  ai_tool_id: string;
  url: string;
  page_title?: string;
  duration_secs?: number;
  event_type: EventType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface QueuedEvent extends ActivityReportEvent {
  _queued_at: number;
}

export interface CachedPolicies {
  policies: Policy[];
  ai_tools: AiTool[];
  access_overrides?: string[]; // tool IDs with approved temporary access
  fetched_at: number;
}

export interface TokenInfo {
  token: string;
  org_id: string;
  user_id: string;
}

export interface BrowserExtensionInfo {
  extension_id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  install_type: string;
  permissions: string[];
  host_permissions: string[];
  homepage_url?: string;
  update_url?: string;
  risk_level: string;
  risk_score: number;
  risk_reasons: string[];
}

export type MessageType =
  | { type: "GET_STATUS" }
  | { type: "LOGIN"; token: string }
  | { type: "LOGOUT" }
  | { type: "TOGGLE_MONITORING"; enabled: boolean }
  | { type: "CHECK_URL"; url: string }
  | { type: "LOG_EVENT"; event: ActivityReportEvent }
  | { type: "POLICY_ACTION"; action: PolicyAction; toolName: string };

export interface StatusResponse {
  authenticated: boolean;
  monitoring: boolean;
  org_id?: string;
  queueSize: number;
  lastFlush?: number;
}
