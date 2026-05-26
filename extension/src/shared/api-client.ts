import { ActivityReportEvent, AiTool, BrowserExtensionInfo, CachedPolicies, Policy } from "./types";
import { getApiBase, getToken } from "./storage";

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const [baseUrl, token] = await Promise.all([getApiBase(), getToken()]);

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchPolicies(): Promise<{
  policies: Policy[];
  ai_tools: AiTool[];
}> {
  return apiRequest("/api/extension/policies");
}

export async function reportEvents(
  events: ActivityReportEvent[]
): Promise<{ received: number }> {
  return apiRequest("/api/extension/report", {
    method: "POST",
    body: JSON.stringify({ events }),
  });
}

export async function requestAccess(aiToolId: string): Promise<void> {
  await apiRequest("/api/extension/request-access", {
    method: "POST",
    body: JSON.stringify({ ai_tool_id: aiToolId }),
  });
}

export async function sendHeartbeat(
  activeTabs: { ai_tool_id: string; url: string; title?: string; started_at: string }[]
): Promise<void> {
  await apiRequest("/api/extension/heartbeat", {
    method: "POST",
    body: JSON.stringify({ active_tabs: activeTabs }),
  });
}

export async function reportBrowserExtensions(
  extensions: BrowserExtensionInfo[]
): Promise<{ received: number }> {
  return apiRequest("/api/extension/report-extensions", {
    method: "POST",
    body: JSON.stringify({ extensions }),
  });
}

export async function fetchAndCachePolicies(): Promise<CachedPolicies> {
  const data = await fetchPolicies();
  return {
    ...data,
    fetched_at: Date.now(),
  };
}
