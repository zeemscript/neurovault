import { AiTool } from "../shared/types";
import { isMonitoringEnabled } from "../shared/storage";
import { addEvent } from "./activity-tracker";
import { evaluateUrl, getAiTools, matchUrl } from "./policy-engine";

interface TabVisit {
  tool: AiTool;
  url: string;
  title?: string;
  startTime: number;
}

// Track active AI tool tabs (persists until tab is closed or navigates away)
const openAiTabs = new Map<number, TabVisit>();

// Track which tab+url combos we've already logged a visit for (dedup)
const loggedVisits = new Set<string>();

export function initTabMonitor(): void {
  // Scan all existing tabs on startup (catches tabs open before extension loaded)
  scanExistingTabs();

  // Monitor tab URL changes
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
      if (changeInfo.status !== "complete" || !tab.url) return;
      if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) return;

      const enabled = await isMonitoringEnabled();
      if (!enabled) return;

      await handleTabUrl(tabId, tab.url, tab.title);
    } catch {
      // Tab may have been closed during processing
    }
  });

  // Monitor tab activation — only update badge, don't re-log visits
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (!tab?.url) return;
      if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) return;

      // Just update the badge for the active tab
      const existing = openAiTabs.get(activeInfo.tabId);
      if (existing) {
        const { action } = await evaluateUrl(tab.url);
        updateBadge(activeInfo.tabId, existing.tool, action);
      } else {
        updateBadge(activeInfo.tabId, null);
      }
    } catch {
      // Tab may have been closed
    }
  });

  // Clean up when tab is closed
  chrome.tabs.onRemoved.addListener((tabId) => {
    finalizeAndRemoveTab(tabId);
  });

  // When all windows lose focus, finalize duration tracking (but keep tabs in openAiTabs)
  chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      // Don't remove from openAiTabs — tabs are still open
    }
  });
}

async function handleTabUrl(tabId: number, url: string, title?: string): Promise<void> {
  const tools = await getAiTools();
  const tool = matchUrl(url, tools);

  if (!tool) {
    // Not an AI tool — remove from openAiTabs if was tracked
    finalizeAndRemoveTab(tabId);
    updateBadge(tabId, null);
    return;
  }

  // Check if already tracking this exact tool on this tab
  const existing = openAiTabs.get(tabId);
  if (existing && existing.tool.id === tool.id) {
    // Same tool, same tab — just update title if changed, don't re-log
    if (title && title !== existing.title) {
      existing.title = title;
    }
    return;
  }

  // If navigating to a different AI tool on same tab, finalize old one
  if (existing) {
    finalizeAndRemoveTab(tabId);
  }

  // Start tracking
  openAiTabs.set(tabId, { tool, url, title, startTime: Date.now() });

  // Log visit only once per tab+tool combo (dedup key)
  const dedupKey = `${tabId}:${tool.id}`;
  if (!loggedVisits.has(dedupKey)) {
    loggedVisits.add(dedupKey);
    await addEvent({
      ai_tool_id: tool.id,
      url,
      page_title: title,
      event_type: "visit",
      timestamp: new Date().toISOString(),
    });
  }

  // Evaluate policy
  const { action, policy } = await evaluateUrl(url);
  updateBadge(tabId, tool, action);

  if (action === "warn") {
    chrome.tabs.sendMessage(tabId, {
      type: "POLICY_ACTION",
      action: "warn",
      toolName: tool.name,
      reason: policy?.reason ?? `${tool.name} usage is flagged by your organization`,
    }).catch(() => {});
  } else if (action === "block") {
    openAiTabs.delete(tabId);
    loggedVisits.delete(dedupKey);

    // Log a block event
    await addEvent({
      ai_tool_id: tool.id,
      url,
      page_title: title,
      event_type: "visit",
      timestamp: new Date().toISOString(),
    });

    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL(
        `src/blocked/blocked.html?tool=${encodeURIComponent(tool.name)}&toolId=${encodeURIComponent(tool.id)}&reason=${encodeURIComponent(
          policy?.reason ?? "This AI tool is blocked by your organization policy"
        )}`
      ),
    }).catch(() => {});
  }
}

function finalizeAndRemoveTab(tabId: number): void {
  const visit = openAiTabs.get(tabId);
  if (!visit) return;

  openAiTabs.delete(tabId);
  loggedVisits.delete(`${tabId}:${visit.tool.id}`);

  // Log duration as metadata (update event not needed — the visit event is already logged)
  const durationSecs = Math.round((Date.now() - visit.startTime) / 1000);
  if (durationSecs > 5) {
    addEvent({
      ai_tool_id: visit.tool.id,
      url: visit.url,
      page_title: visit.title,
      duration_secs: durationSecs,
      event_type: "visit",
      timestamp: new Date(visit.startTime).toISOString(),
    });
  }
}

/**
 * Scan all existing tabs to detect AI tools already open.
 * This runs on extension startup/reload so we don't miss tabs.
 */
async function scanExistingTabs(): Promise<void> {
  try {
    const enabled = await isMonitoringEnabled();
    if (!enabled) return;

    const tabs = await chrome.tabs.query({});
    const tools = await getAiTools();

    for (const tab of tabs) {
      if (!tab.id || !tab.url) continue;
      if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) continue;

      const tool = matchUrl(tab.url, tools);
      if (tool) {
        openAiTabs.set(tab.id, {
          tool,
          url: tab.url,
          title: tab.title,
          startTime: Date.now(),
        });
        updateBadge(tab.id, tool);
      }
    }

    console.log(`[NeuroVault] Scanned ${tabs.length} tabs, found ${openAiTabs.size} AI tools`);
  } catch {
    // Tab scanning can fail on restricted pages
  }
}

/**
 * Returns the list of currently open AI tool tabs (for heartbeat).
 */
export function getActiveTabVisits(): {
  ai_tool_id: string;
  url: string;
  title?: string;
  started_at: string;
}[] {
  return Array.from(openAiTabs.values()).map((v) => ({
    ai_tool_id: v.tool.id,
    url: v.url,
    title: v.title,
    started_at: new Date(v.startTime).toISOString(),
  }));
}

function updateBadge(tabId: number, tool: AiTool | null, action?: string): void {
  try {
    if (tool) {
      const badgeText = action === "warn" ? "!" : action === "block" ? "X" : "AI";
      const color = action === "warn" ? "#f59e0b" : action === "block" ? "#ef4444" : "#3b82f6";
      chrome.action.setBadgeText({ text: badgeText, tabId });
      chrome.action.setBadgeBackgroundColor({ color, tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId });
    }
  } catch {
    // Tab may no longer exist
  }
}
