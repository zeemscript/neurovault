// Blocked page script — handles "Request Access" and "Go Back"

const params = new URLSearchParams(window.location.search);
const toolName = params.get("tool") ?? "Unknown AI Tool";
const toolId = params.get("toolId") ?? "";
const reason =
  params.get("reason") ?? "This AI tool is blocked by your organization policy.";

// Populate the page
document.getElementById("toolName")!.textContent = toolName;
document.getElementById("reason")!.textContent = reason;

// Show tool favicon
if (toolId) {
  const domainMap: Record<string, string> = {
    chatgpt: "chat.openai.com",
    claude: "claude.ai",
    gemini: "gemini.google.com",
    midjourney: "midjourney.com",
    copilot: "github.com",
    perplexity: "perplexity.ai",
    huggingface: "huggingface.co",
    replicate: "replicate.com",
    stability: "stability.ai",
    jasper: "jasper.ai",
    writesonic: "writesonic.com",
    "copy-ai": "copy.ai",
    "notion-ai": "notion.so",
    cursor: "cursor.com",
    v0: "v0.dev",
  };

  const domain = domainMap[toolId];
  if (domain) {
    const favicon = document.getElementById("toolFavicon") as HTMLImageElement;
    favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    favicon.alt = toolName;
    document.getElementById("iconBadge")!.classList.remove("hidden");
  }
}

// Request Access button
const requestBtn = document.getElementById("requestBtn")!;
const sentMsg = document.getElementById("sentMsg")!;
const errorMsg = document.getElementById("errorMsg")!;

requestBtn.addEventListener("click", async () => {
  if (!toolId) {
    showError("Cannot identify the tool. Please contact your administrator.");
    return;
  }

  requestBtn.setAttribute("disabled", "true");
  requestBtn.style.opacity = "0.6";
  requestBtn.style.cursor = "not-allowed";

  try {
    const response = await new Promise<{ success?: boolean; error?: string }>(
      (resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: "REQUEST_ACCESS", tool_id: toolId },
          (res) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(res);
            }
          }
        );
      }
    );

    if (response?.error) {
      showError(response.error);
      requestBtn.removeAttribute("disabled");
      requestBtn.style.opacity = "1";
      requestBtn.style.cursor = "pointer";
    } else {
      // Success — swap button with confirmation message
      requestBtn.style.display = "none";
      sentMsg.classList.add("show");
    }
  } catch {
    showError("Failed to send request. Please try again.");
    requestBtn.removeAttribute("disabled");
    requestBtn.style.opacity = "1";
    requestBtn.style.cursor = "pointer";
  }
});

// Go Back button
document.getElementById("backBtn")!.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.close();
  }
});

function showError(msg: string): void {
  errorMsg.textContent = msg;
  errorMsg.classList.add("show");
  setTimeout(() => errorMsg.classList.remove("show"), 5000);
}
