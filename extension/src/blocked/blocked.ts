const params = new URLSearchParams(window.location.search);
const toolName = params.get("tool") || "Unknown Tool";
const toolId = params.get("toolId") || "";
const reason = params.get("reason") || "This tool has been restricted by your organization's security policy.";

document.getElementById("toolName")!.textContent = toolName;
document.getElementById("reason")!.textContent = reason;
document.title = "Blocked: " + toolName + " — NeuroVault";

// Favicon
const domains: Record<string, string> = {
  chatgpt:"chat.openai.com", claude:"claude.ai", gemini:"gemini.google.com",
  midjourney:"midjourney.com", copilot:"github.com", perplexity:"perplexity.ai",
  huggingface:"huggingface.co", stability:"stability.ai", jasper:"jasper.ai",
  writesonic:"writesonic.com", "copy-ai":"copy.ai", "notion-ai":"notion.so",
  cursor:"cursor.com", v0:"v0.dev", replicate:"replicate.com",
};
if (toolId && domains[toolId]) {
  (document.getElementById("toolFavicon") as HTMLImageElement).src =
    "https://www.google.com/s2/favicons?domain=" + domains[toolId] + "&sz=64";
} else {
  document.getElementById("iconBadge")?.classList.add("hidden");
}

// Elements
const requestBtn = document.getElementById("requestBtn") as HTMLButtonElement;
const sentMsg = document.getElementById("sentMsg")!;
const errorMsg = document.getElementById("errorMsg")!;
const waitingMsg = document.getElementById("waitingMsg");

// Request access button
requestBtn.addEventListener("click", () => {
  requestBtn.disabled = true;
  requestBtn.style.opacity = "0.6";

  chrome.runtime.sendMessage(
    { type: "REQUEST_ACCESS", tool_id: toolId, tool_name: toolName },
    (response) => {
      if (chrome.runtime.lastError) {
        errorMsg.textContent = "Failed: " + chrome.runtime.lastError.message;
        errorMsg.classList.add("show");
        requestBtn.style.opacity = "1";
        requestBtn.disabled = false;
        return;
      }
      if (response && response.error) {
        errorMsg.textContent = response.error;
        errorMsg.classList.add("show");
        requestBtn.style.opacity = "1";
        requestBtn.disabled = false;
        return;
      }

      // Success — show waiting state and start polling
      requestBtn.style.display = "none";
      sentMsg.classList.add("show");
      if (waitingMsg) waitingMsg.classList.add("show");

      startPollingForAccess();
    }
  );
});

// Go back button
document.getElementById("backBtn")!.addEventListener("click", () => {
  if (history.length > 1) {
    history.back();
  } else {
    window.close();
  }
});

// Poll for access grant — checks every 10 seconds
let pollInterval: ReturnType<typeof setInterval> | null = null;

function startPollingForAccess(): void {
  // First, trigger an immediate policy refresh in the service worker
  chrome.runtime.sendMessage({ type: "REFRESH_POLICIES" });

  pollInterval = setInterval(() => {
    // Ask the service worker to refresh policies and then check if the tool is still blocked
    chrome.runtime.sendMessage({ type: "REFRESH_POLICIES" }, () => {
      // After refresh, check if the tool is now allowed
      const toolDomain = domains[toolId];
      if (!toolDomain) return;

      const testUrl = "https://" + toolDomain;
      chrome.runtime.sendMessage(
        { type: "CHECK_URL", url: testUrl },
        (result) => {
          if (result && result.action !== "block") {
            // Access granted! Redirect to the tool
            if (pollInterval) clearInterval(pollInterval);

            // Update UI
            sentMsg.classList.remove("show");
            if (waitingMsg) waitingMsg.classList.remove("show");

            const grantedMsg = document.getElementById("grantedMsg");
            if (grantedMsg) grantedMsg.classList.add("show");

            // Redirect after a short delay
            setTimeout(() => {
              window.location.href = testUrl;
            }, 2000);
          }
        }
      );
    });
  }, 10000); // Every 10 seconds
}
