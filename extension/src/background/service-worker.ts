import { ActivityReportEvent, StatusResponse } from "../shared/types";
import {
  ALARM_FLUSH_EVENTS,
  ALARM_REFRESH_POLICIES,
  ALARM_HEARTBEAT,
  FLUSH_INTERVAL_MINUTES,
  POLICY_REFRESH_INTERVAL_MINUTES,
  HEARTBEAT_INTERVAL_MINUTES,
} from "../shared/constants";
import {
  getToken,
  setTokenInfo,
  clearToken,
  isMonitoringEnabled,
  setMonitoringEnabled,
  getLastFlush,
} from "../shared/storage";
import { addEvent, flush, getQueueSize } from "./activity-tracker";
import { evaluateUrl, refreshPolicies } from "./policy-engine";
import { initTabMonitor, getActiveTabVisits } from "./tab-monitor";
import { requestAccess, sendHeartbeat } from "../shared/api-client";

// Initialize tab monitoring
initTabMonitor();

// Extension install handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[NeuroVault] Extension installed");
  }
  // Re-setup alarms on install/update in case they were cleared
  initIfAuthenticated();
});

// Extension startup — load policies if authenticated
chrome.runtime.onStartup.addListener(() => {
  initIfAuthenticated();
});

// Also run on service worker wake (MV3 can terminate and restart)
initIfAuthenticated();

async function initIfAuthenticated(): Promise<void> {
  const token = await getToken();
  if (token) {
    setupAlarms();
    // Refresh policies in background, don't block startup
    refreshPolicies().catch(() => {});
  }
}

// Alarm handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const token = await getToken();
  if (!token) return;

  switch (alarm.name) {
    case ALARM_FLUSH_EVENTS:
      await flush();
      break;
    case ALARM_REFRESH_POLICIES:
      await refreshPolicies();
      break;
    case ALARM_HEARTBEAT:
      try {
        const activeTabs = getActiveTabVisits();
        await sendHeartbeat(activeTabs);
      } catch {
        // Heartbeat is non-critical
      }
      break;
  }
});

// Message handler for popup and content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err) => sendResponse({ error: err.message }));
  return true; // Keep message channel open for async response
});

async function handleMessage(message: {
  type: string;
  [key: string]: unknown;
}) {
  switch (message.type) {
    case "GET_STATUS": {
      const [token, monitoring, queueSize, lastFlush] = await Promise.all([
        getToken(),
        isMonitoringEnabled(),
        getQueueSize(),
        getLastFlush(),
      ]);

      const status: StatusResponse = {
        authenticated: !!token,
        monitoring,
        queueSize,
        lastFlush: lastFlush ?? undefined,
      };
      return status;
    }

    case "LOGIN": {
      const token = message.token as string;
      if (!token) throw new Error("Token is required");

      await setTokenInfo({
        token,
        org_id: "",
        user_id: "",
      });

      // Verify token by fetching policies
      try {
        await refreshPolicies();
        setupAlarms();
        return { success: true };
      } catch {
        await clearToken();
        throw new Error("Invalid token - could not connect to NeuroVault");
      }
    }

    case "LOGOUT": {
      await clearToken();
      await chrome.alarms.clearAll();
      return { success: true };
    }

    case "TOGGLE_MONITORING": {
      const enabled = message.enabled as boolean;
      await setMonitoringEnabled(enabled);
      return { success: true, monitoring: enabled };
    }

    case "REFRESH_POLICIES": {
      await refreshPolicies();
      return { success: true };
    }

    case "CHECK_URL": {
      const url = message.url as string;
      if (!url) return { action: "monitor", tool: null };

      const result = await evaluateUrl(url);
      return {
        action: result.action,
        tool: result.tool
          ? { id: result.tool.id, name: result.tool.name, category: result.tool.category }
          : null,
      };
    }

    case "REQUEST_ACCESS": {
      const reqToolId = message.tool_id as string;
      if (!reqToolId) return { error: "No tool ID" };

      try {
        await requestAccess(reqToolId);
        return { success: true };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Failed to send request" };
      }
    }

    case "LOG_EVENT": {
      const event = message.event as ActivityReportEvent;
      // Resolve ai_tool_id from URL if empty
      if (!event.ai_tool_id) {
        const { tool } = await evaluateUrl(event.url);
        if (tool) event.ai_tool_id = tool.id;
      }
      if (event.ai_tool_id) {
        await addEvent(event);
      }
      return { success: true };
    }

    default:
      return { error: `Unknown message type: ${message.type}` };
  }
}

function setupAlarms(): void {
  // chrome.alarms requires delayInMinutes or when, plus periodInMinutes
  chrome.alarms.create(ALARM_FLUSH_EVENTS, {
    delayInMinutes: FLUSH_INTERVAL_MINUTES,
    periodInMinutes: FLUSH_INTERVAL_MINUTES,
  });
  chrome.alarms.create(ALARM_REFRESH_POLICIES, {
    delayInMinutes: POLICY_REFRESH_INTERVAL_MINUTES,
    periodInMinutes: POLICY_REFRESH_INTERVAL_MINUTES,
  });
  chrome.alarms.create(ALARM_HEARTBEAT, {
    delayInMinutes: HEARTBEAT_INTERVAL_MINUTES,
    periodInMinutes: HEARTBEAT_INTERVAL_MINUTES,
  });
}
