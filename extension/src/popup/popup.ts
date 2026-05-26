import { StatusResponse } from "../shared/types";
import { getApiBase, setApiBase } from "../shared/storage";

// DOM elements
const loginView = document.getElementById("loginView")!;
const dashboardView = document.getElementById("dashboardView")!;
const blockedView = document.getElementById("blockedView")!;
const statusDot = document.getElementById("statusDot")!;
const tokenInput = document.getElementById("tokenInput") as HTMLInputElement;
const apiBaseInput = document.getElementById("apiBase") as HTMLInputElement;
const connectBtn = document.getElementById("connectBtn") as HTMLButtonElement;
const connectText = document.getElementById("connectText")!;
const connectSpinner = document.getElementById("connectSpinner")!;
const loginError = document.getElementById("loginError")!;
const disconnectBtn = document.getElementById("disconnectBtn")!;
const monitoringToggle = document.getElementById(
  "monitoringToggle"
) as HTMLInputElement;
const currentToolBadge = document.getElementById("currentToolBadge")!;
const currentToolInfo = document.getElementById("currentToolInfo")!;
const currentToolIcon = document.getElementById("currentToolIcon") as HTMLImageElement;
const currentToolName = document.getElementById("currentToolName")!;
const currentToolCategory = document.getElementById("currentToolCategory")!;
const currentToolPolicy = document.getElementById("currentToolPolicy")!;
const queueCount = document.getElementById("queueCount")!;
const lastFlushText = document.getElementById("lastFlushText")!;

// Check if this is a blocked page redirect
function checkBlockedPage(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get("blocked") === "true") {
    const tool = params.get("tool") ?? "Unknown AI Tool";
    const reason =
      params.get("reason") ?? "This tool is blocked by your organization";
    document.getElementById("blockedTool")!.textContent = tool;
    document.getElementById("blockedReason")!.textContent = reason;
    loginView.classList.add("hidden");
    dashboardView.classList.add("hidden");
    blockedView.classList.remove("hidden");
    return true;
  }
  return false;
}

async function init(): Promise<void> {
  if (checkBlockedPage()) return;

  // Load saved API base
  const savedBase = await getApiBase();
  apiBaseInput.value = savedBase;

  // Get current status from service worker
  try {
    const status = await sendMessage<StatusResponse>({ type: "GET_STATUS" });
    if (status?.authenticated) {
      showDashboard(status);
    } else {
      showLogin();
    }
  } catch {
    showLogin();
  }
}

function showLogin(): void {
  loginView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
  blockedView.classList.add("hidden");
  statusDot.classList.remove("online");
  statusDot.classList.add("offline");
  statusDot.title = "Disconnected";
}

function showDashboard(status: StatusResponse): void {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  blockedView.classList.add("hidden");
  statusDot.classList.remove("offline");
  statusDot.classList.add("online");
  statusDot.title = "Connected";

  monitoringToggle.checked = status.monitoring;
  queueCount.textContent = `${status.queueSize} events`;

  if (status.lastFlush) {
    lastFlushText.textContent = `Last sync: ${formatTimeAgo(status.lastFlush)}`;
  }

  // Check current tab for AI tools
  checkCurrentTab();
}

async function checkCurrentTab(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.url) return;

    // Skip chrome:// and extension pages
    if (
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://")
    ) {
      return;
    }

    const result = await sendMessage<{
      action: string;
      tool: { id: string; name: string; category: string } | null;
    }>({ type: "CHECK_URL", url: tab.url });

    if (result?.tool) {
      currentToolBadge.textContent = result.tool.name;
      currentToolBadge.className = `badge badge-${
        result.action === "warn"
          ? "warn"
          : result.action === "block"
            ? "block"
            : "detected"
      }`;
      currentToolInfo.classList.remove("hidden");
      currentToolName.textContent = result.tool.name;
      currentToolCategory.textContent = formatCategory(result.tool.category);
      currentToolPolicy.textContent = formatAction(result.action);

      // Set favicon
      const domain = getDomainForTool(result.tool.id);
      currentToolIcon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      currentToolIcon.alt = result.tool.name;
    } else {
      currentToolBadge.textContent = "No AI tool detected";
      currentToolBadge.className = "badge badge-none";
      currentToolInfo.classList.add("hidden");
    }
  } catch {
    // Tab query can fail on restricted pages
  }
}

// Event listeners
connectBtn.addEventListener("click", async () => {
  const token = tokenInput.value.trim();
  const apiBase = apiBaseInput.value.trim();

  if (!token) {
    showError("Please enter your extension token");
    return;
  }

  if (!token.startsWith("nv_")) {
    showError("Invalid token format. Tokens start with 'nv_'");
    return;
  }

  if (apiBase) {
    await setApiBase(apiBase);
  }

  setLoading(true);
  hideError();

  try {
    const result = await sendMessage<{ success?: boolean; error?: string }>({
      type: "LOGIN",
      token,
    });

    if (result?.error) {
      showError(result.error);
    } else {
      const status = await sendMessage<StatusResponse>({ type: "GET_STATUS" });
      showDashboard(status);
    }
  } catch {
    showError("Connection failed. Check your server URL and token.");
  } finally {
    setLoading(false);
  }
});

disconnectBtn.addEventListener("click", async () => {
  await sendMessage({ type: "LOGOUT" });
  showLogin();
  tokenInput.value = "";
});

monitoringToggle.addEventListener("change", async () => {
  await sendMessage({
    type: "TOGGLE_MONITORING",
    enabled: monitoringToggle.checked,
  });
});

// Allow Enter key to submit token
tokenInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    connectBtn.click();
  }
});

// Helpers
function sendMessage<T>(message: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

function showError(msg: string): void {
  loginError.textContent = msg;
  loginError.classList.remove("hidden");
}

function hideError(): void {
  loginError.classList.add("hidden");
}

function setLoading(loading: boolean): void {
  connectBtn.disabled = loading;
  connectText.classList.toggle("hidden", loading);
  connectSpinner.classList.toggle("hidden", !loading);
}

function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    llm: "LLM / Chat",
    "image-gen": "Image Generation",
    code: "Code Assistant",
    search: "AI Search",
    writing: "AI Writing",
    "ml-platform": "ML Platform",
    productivity: "Productivity",
  };
  return labels[category] ?? category;
}

function formatAction(action: string): string {
  const labels: Record<string, string> = {
    monitor: "Monitored",
    warn: "Warning",
    block: "Blocked",
  };
  return labels[action] ?? action;
}

function getDomainForTool(toolId: string): string {
  const map: Record<string, string> = {
    chatgpt: "chat.openai.com", claude: "claude.ai", gemini: "gemini.google.com",
    midjourney: "midjourney.com", copilot: "github.com", perplexity: "perplexity.ai",
    huggingface: "huggingface.co", replicate: "replicate.com", stability: "stability.ai",
    jasper: "jasper.ai", writesonic: "writesonic.com", "copy-ai": "copy.ai",
    "notion-ai": "notion.so", cursor: "cursor.com", v0: "v0.dev",
  };
  return map[toolId] || `${toolId}.com`;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Initialize
init();
