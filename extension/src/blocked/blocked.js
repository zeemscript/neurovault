const params = new URLSearchParams(window.location.search);
const toolName = params.get("tool") || "Unknown Tool";
const toolId = params.get("toolId") || "";
const reason = params.get("reason") || "This tool has been restricted by your organization's security policy.";

document.getElementById("toolName").textContent = toolName;
document.getElementById("reason").textContent = reason;
document.title = "Blocked: " + toolName + " — NeuroVault";

// Favicon
const domains = {
  chatgpt:"chat.openai.com", claude:"claude.ai", gemini:"gemini.google.com",
  midjourney:"midjourney.com", copilot:"github.com", perplexity:"perplexity.ai",
  huggingface:"huggingface.co", stability:"stability.ai", jasper:"jasper.ai",
  writesonic:"writesonic.com", "copy-ai":"copy.ai", "notion-ai":"notion.so",
  cursor:"cursor.com", v0:"v0.dev", replicate:"replicate.com",
};
if (toolId && domains[toolId]) {
  document.getElementById("toolFavicon").src = "https://www.google.com/s2/favicons?domain=" + domains[toolId] + "&sz=64";
} else {
  document.getElementById("iconBadge").classList.add("hidden");
}

// Request access button
const requestBtn = document.getElementById("requestBtn");
const sentMsg = document.getElementById("sentMsg");
const errorMsg = document.getElementById("errorMsg");

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
      requestBtn.style.display = "none";
      sentMsg.classList.add("show");
    }
  );
});

// Go back button
document.getElementById("backBtn").addEventListener("click", () => {
  if (history.length > 1) {
    history.back();
  } else {
    window.close();
  }
});
