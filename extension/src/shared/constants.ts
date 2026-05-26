// Default API base URL — users can configure this in the popup
export const DEFAULT_API_BASE = "http://localhost:3000";

// Alarm names
export const ALARM_FLUSH_EVENTS = "flush-events";
export const ALARM_REFRESH_POLICIES = "refresh-policies";
export const ALARM_HEARTBEAT = "heartbeat";

// Intervals (in minutes for chrome.alarms)
export const FLUSH_INTERVAL_MINUTES = 1;
export const POLICY_REFRESH_INTERVAL_MINUTES = 5;
export const HEARTBEAT_INTERVAL_MINUTES = 2;

// Queue limits
export const MAX_QUEUE_SIZE = 500;

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: "nv_token",
  TOKEN_INFO: "nv_token_info",
  API_BASE: "nv_api_base",
  CACHED_POLICIES: "nv_cached_policies",
  EVENT_QUEUE: "nv_event_queue",
  MONITORING_ENABLED: "nv_monitoring_enabled",
  LAST_FLUSH: "nv_last_flush",
} as const;
