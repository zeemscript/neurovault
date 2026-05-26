// NeuroVault Content Script
// Detects paste and upload events on AI tool pages.
// Privacy-first: never captures actual content, only metadata.
// DLP: blocks sensitive pastes and warns user before they send to AI.

import { scanForSensitiveData } from "../shared/dlp-scanner";
import { DEFAULT_AI_TOOLS, matchUrlToTool } from "../shared/ai-tools";
import { DlpResult } from "../shared/types";

let isAiToolPage = false;
let dlpOverlay: HTMLElement | null = null;
let policyBanner: HTMLElement | null = null;
let observer: MutationObserver | null = null;

// First: quick local check against hardcoded AI tools (works without auth)
const localMatch = matchUrlToTool(window.location.href, DEFAULT_AI_TOOLS);
if (localMatch) {
  isAiToolPage = true;
  initDetection();
}

// Then: confirm with background (may have server-synced tools + policies)
chrome.runtime.sendMessage(
  { type: "CHECK_URL", url: window.location.href },
  (response) => {
    if (chrome.runtime.lastError) return;
    if (response?.tool && !isAiToolPage) {
      isAiToolPage = true;
      initDetection();
    }
  }
);

// Listen for messages from the background (policy warnings)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "POLICY_ACTION" && message.action === "warn") {
    showPolicyBanner(message.reason);
  }
});

function initDetection(): void {
  document.addEventListener("paste", handlePaste, true);
  document.addEventListener("change", handleFileInput, true);
  document.addEventListener("drop", handleDrop, true);
  document.addEventListener("click", handleDownloadClick, true);

  // Watch for dynamically added inputs (SPAs like ChatGPT)
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          node
            .querySelectorAll("textarea, [contenteditable]")
            .forEach((el) => {
              el.addEventListener("paste", handlePaste, true);
            });
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// ─── Paste Handler (DLP) ───────────────────────────────

function handlePaste(event: Event): void {
  const clipboardEvent = event as ClipboardEvent;
  const text = clipboardEvent.clipboardData?.getData("text/plain") || "";

  const dlpResult = scanForSensitiveData(text);

  if (dlpResult.flagged) {
    // BLOCK the paste — prevent it from reaching the AI tool
    event.preventDefault();
    event.stopImmediatePropagation();

    // Show DLP warning near the input
    const target = event.target as HTMLElement;
    showDlpWarning(target, text, dlpResult);

    // Log the blocked paste attempt
    logEvent("paste", {
      content_length: text.length,
      has_files: (clipboardEvent.clipboardData?.files.length ?? 0) > 0,
      dlp: { ...dlpResult, action_taken: "blocked" },
    });
  } else {
    // Not flagged — let it through, just log metadata
    logEvent("paste", {
      content_length: text.length,
      has_files: (clipboardEvent.clipboardData?.files.length ?? 0) > 0,
      dlp: dlpResult,
    });
  }
}

// ─── DLP Warning Modal ─────────────────────────────────

function showDlpWarning(
  target: HTMLElement,
  blockedText: string,
  dlpResult: DlpResult
): void {
  // Remove existing overlay if any
  if (dlpOverlay) {
    dlpOverlay.remove();
    dlpOverlay = null;
  }

  // Create full-screen overlay
  dlpOverlay = document.createElement("div");
  dlpOverlay.id = "neurovault-dlp-overlay";

  // Backdrop
  const backdrop = document.createElement("div");
  Object.assign(backdrop.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483646",
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
  });

  // Modal card — centered on screen
  const modal = document.createElement("div");
  Object.assign(modal.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: "2147483647",
    width: "480px",
    maxWidth: "calc(100vw - 32px)",
    background: "linear-gradient(145deg, #1e293b, #0f172a)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "16px",
    padding: "24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#e2e8f0",
    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.1)",
    animation: "nv-slide-up 0.25s ease-out",
  });

  // Inject animation keyframes
  if (!document.getElementById("nv-dlp-styles")) {
    const style = document.createElement("style");
    style.id = "nv-dlp-styles";
    style.textContent = `
      @keyframes nv-slide-up {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes nv-pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
        70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }
    `;
    document.head.appendChild(style);
  }

  // Header with icon
  const header = document.createElement("div");
  Object.assign(header.style, {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  });

  const iconCircle = document.createElement("div");
  Object.assign(iconCircle.style, {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
    animation: "nv-pulse-ring 2s infinite",
  });
  iconCircle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  const headerText = document.createElement("div");

  const title = document.createElement("div");
  Object.assign(title.style, {
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff",
    letterSpacing: "-0.01em",
  });
  title.textContent = "Sensitive Data Detected";

  const subtitle = document.createElement("div");
  Object.assign(subtitle.style, {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "2px",
  });
  subtitle.textContent = "Your paste was blocked to prevent data leakage.";

  headerText.appendChild(title);
  headerText.appendChild(subtitle);
  header.appendChild(iconCircle);
  header.appendChild(headerText);

  // Detected patterns list
  const patternBox = document.createElement("div");
  Object.assign(patternBox.style, {
    background: "rgba(239, 68, 68, 0.06)",
    border: "1px solid rgba(239, 68, 68, 0.12)",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "16px",
  });

  const patternLabel = document.createElement("div");
  Object.assign(patternLabel.style, {
    fontSize: "11px",
    fontWeight: "600",
    color: "#ef4444",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  });
  patternLabel.textContent = `Found in your paste (risk score: ${dlpResult.risk_score}/100)`;

  const patternList = document.createElement("div");
  Object.assign(patternList.style, {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  });

  for (const pattern of dlpResult.patterns_detected) {
    const count = dlpResult.pattern_counts[pattern];
    const tag = document.createElement("span");
    Object.assign(tag.style, {
      fontSize: "12px",
      fontWeight: "500",
      padding: "3px 10px",
      borderRadius: "6px",
      background: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.15)",
      color: "#fca5a5",
      whiteSpace: "nowrap",
    });
    const label = formatPatternName(pattern);
    tag.textContent = count > 1 ? `${label} (${count})` : label;
    patternList.appendChild(tag);
  }

  patternBox.appendChild(patternLabel);
  patternBox.appendChild(patternList);

  // Action buttons
  const actions = document.createElement("div");
  Object.assign(actions.style, {
    display: "flex",
    gap: "10px",
  });

  // "Remove & Cancel" button (primary — safe action)
  const cancelBtn = document.createElement("button");
  Object.assign(cancelBtn.style, {
    flex: "1",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "all 0.15s",
  });
  cancelBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  const cancelText = document.createTextNode(" Remove & Stay Safe");
  cancelBtn.appendChild(cancelText);
  cancelBtn.addEventListener("mouseenter", () => {
    cancelBtn.style.transform = "translateY(-1px)";
    cancelBtn.style.boxShadow = "0 4px 16px rgba(59, 130, 246, 0.3)";
  });
  cancelBtn.addEventListener("mouseleave", () => {
    cancelBtn.style.transform = "";
    cancelBtn.style.boxShadow = "";
  });
  cancelBtn.addEventListener("click", () => {
    // Just close the modal — paste was already blocked
    closeDlpWarning();
  });

  // "Paste Anyway" button (secondary — risky action)
  const pasteBtn = document.createElement("button");
  Object.assign(pasteBtn.style, {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  });
  pasteBtn.textContent = "Paste Anyway";
  pasteBtn.addEventListener("mouseenter", () => {
    pasteBtn.style.background = "rgba(239, 68, 68, 0.08)";
    pasteBtn.style.borderColor = "rgba(239, 68, 68, 0.2)";
    pasteBtn.style.color = "#fca5a5";
  });
  pasteBtn.addEventListener("mouseleave", () => {
    pasteBtn.style.background = "rgba(255, 255, 255, 0.04)";
    pasteBtn.style.borderColor = "rgba(255, 255, 255, 0.08)";
    pasteBtn.style.color = "#94a3b8";
  });
  pasteBtn.addEventListener("click", () => {
    closeDlpWarning();

    // Force-paste the text into the target element (user accepted the risk)
    insertTextIntoTarget(target, blockedText);

    // Log as user-overridden
    logEvent("paste", {
      content_length: blockedText.length,
      dlp: { ...dlpResult, action_taken: "user_override" },
    });
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(pasteBtn);

  // Footer
  const footer = document.createElement("div");
  Object.assign(footer.style, {
    marginTop: "12px",
    fontSize: "11px",
    color: "#475569",
    textAlign: "center",
  });
  footer.textContent = "Protected by NeuroVault · Content never leaves your browser";

  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(patternBox);
  modal.appendChild(actions);
  modal.appendChild(footer);

  dlpOverlay.appendChild(backdrop);
  dlpOverlay.appendChild(modal);

  // Close on backdrop click
  backdrop.addEventListener("click", closeDlpWarning);

  // Close on Escape key
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeDlpWarning();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);

  document.body.appendChild(dlpOverlay);
}

function closeDlpWarning(): void {
  if (dlpOverlay) {
    dlpOverlay.remove();
    dlpOverlay = null;
  }
}

function insertTextIntoTarget(target: HTMLElement, text: string): void {
  // Try to insert text into the focused element
  if (
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLInputElement
  ) {
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    target.value =
      target.value.slice(0, start) + text + target.value.slice(end);
    target.selectionStart = target.selectionEnd = start + text.length;
    target.dispatchEvent(new Event("input", { bubbles: true }));
  } else if (target.isContentEditable) {
    // For contenteditable (ChatGPT, Claude use these)
    document.execCommand("insertText", false, text);
  }
}

function formatPatternName(name: string): string {
  const labels: Record<string, string> = {
    email: "Email",
    phone: "Phone Number",
    ssn: "SSN",
    ssn_no_dashes: "SSN",
    passport: "Passport",
    date_of_birth: "Date of Birth",
    drivers_license: "Driver's License",
    address: "Physical Address",
    national_id: "National ID",
    full_name_context: "Full Name",
    gender_ethnicity: "Gender/Ethnicity",
    credit_card: "Credit Card",
    iban: "IBAN",
    swift_bic: "SWIFT/BIC",
    bank_routing: "Bank Routing",
    bank_account: "Bank Account",
    cvv: "CVV/CVC",
    expiry_date: "Card Expiry",
    crypto_wallet: "Crypto Wallet",
    crypto_seed: "Crypto Seed Phrase",
    aws_key: "AWS Key",
    aws_secret: "AWS Secret",
    github_token: "GitHub Token",
    openai_key: "OpenAI Key",
    stripe_key: "Stripe Key",
    slack_token: "Slack Token",
    slack_webhook: "Slack Webhook",
    gcp_key: "GCP Key",
    gcp_service_account: "GCP Service Account",
    azure_key: "Azure Key",
    azure_connection: "Azure Connection",
    jwt: "JWT Token",
    oauth_token: "OAuth Token",
    generic_secret: "Secret/Credential",
    private_key: "Private Key",
    certificate: "Certificate",
    ssh_key: "SSH Key",
    connection_string: "Database Connection",
    dsn: "Sentry DSN",
    env_variable: "Env Variable",
    password_plain: "Plaintext Password",
    sendgrid_key: "SendGrid Key",
    twilio_key: "Twilio Key",
    firebase_key: "Firebase Key",
    npm_token: "NPM Token",
    docker_auth: "Docker Auth",
    heroku_key: "UUID/Key",
    ip_private: "Private IP",
    ipv6: "IPv6 Address",
    internal_url: "Internal URL",
    mac_address: "MAC Address",
    server_path: "Server Path",
    kubernetes_secret: "K8s Secret",
    cidr_range: "CIDR Range",
    medical_record: "Medical Record",
    health_info: "Health Info",
    health_insurance: "Insurance ID",
    tax_id: "Tax ID",
    legal_case: "Legal Case",
    gdpr_data: "GDPR Data",
    biometric: "Biometric Data",
    code: "Source Code",
    sql_query: "SQL Query",
    database_schema: "DB Schema",
    proprietary_marker: "Confidential Marker",
    revenue_financials: "Financial Data",
    customer_data_bulk: "Bulk Customer Data",
    salary_compensation: "Salary Info",
    meeting_notes: "Meeting Notes",
    merger_acquisition: "M&A Data",
    infrastructure_config: "Infra Config",
    api_key: "API Key",
  };
  return labels[name] ?? name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── File & Download Handlers ──────────────────────────

function handleFileInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (target.type !== "file" || !target.files?.length) return;

  logEvent("upload", {
    file_count: target.files.length,
    file_types: Array.from(target.files).map((f) => f.type || "unknown"),
  });
}

function handleDrop(event: Event): void {
  const dragEvent = event as DragEvent;
  const files = dragEvent.dataTransfer?.files;
  if (!files?.length) return;

  logEvent("upload", {
    file_count: files.length,
    file_types: Array.from(files).map((f) => f.type || "unknown"),
    via: "drag-and-drop",
  });
}

function handleDownloadClick(event: Event): void {
  const target = event.target as HTMLElement;
  const anchor = target.closest("a") as HTMLAnchorElement | null;
  if (!anchor) return;

  const isDownload =
    anchor.hasAttribute("download") ||
    anchor.href?.startsWith("blob:") ||
    anchor.href?.startsWith("data:");

  if (isDownload) {
    logEvent("download", {
      filename: anchor.getAttribute("download") || undefined,
      url_type: anchor.href?.startsWith("blob:")
        ? "blob"
        : anchor.href?.startsWith("data:")
          ? "data"
          : "link",
    });
  }
}

// ─── Event Logging ─────────────────────────────────────

function logEvent(
  eventType: "paste" | "upload" | "download",
  metadata: Record<string, unknown>
): void {
  chrome.runtime.sendMessage({
    type: "LOG_EVENT",
    event: {
      ai_tool_id: "",
      url: window.location.href,
      page_title: document.title,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      metadata,
    },
  });
}

// ─── Policy Warning Banner (for warn policies, not DLP) ─

function showPolicyBanner(reason: string): void {
  if (policyBanner) return;

  policyBanner = document.createElement("div");
  policyBanner.id = "neurovault-policy-banner";

  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    zIndex: "2147483645",
    background: "linear-gradient(135deg, #1e293b, #0f172a)",
    borderBottom: "2px solid #f59e0b",
    color: "#e2e8f0",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  });

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("width", "20");
  icon.setAttribute("height", "20");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "#f59e0b");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.style.flexShrink = "0";
  icon.innerHTML =
    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
    '<line x1="12" y1="9" x2="12" y2="13"/>' +
    '<line x1="12" y1="17" x2="12.01" y2="17"/>';

  const textContainer = document.createElement("div");
  textContainer.style.display = "flex";
  textContainer.style.alignItems = "center";
  textContainer.style.gap = "10px";
  textContainer.style.flex = "1";

  const label = document.createElement("strong");
  label.style.color = "#fbbf24";
  label.textContent = "NeuroVault:";

  const msg = document.createElement("span");
  msg.textContent = ` ${reason}`;

  const textSpan = document.createElement("span");
  textSpan.appendChild(label);
  textSpan.appendChild(msg);
  textContainer.appendChild(icon);
  textContainer.appendChild(textSpan);

  const dismissBtn = document.createElement("button");
  Object.assign(dismissBtn.style, {
    background: "none",
    border: "1px solid #475569",
    color: "#94a3b8",
    padding: "4px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    whiteSpace: "nowrap",
    marginLeft: "12px",
    flexShrink: "0",
  });
  dismissBtn.textContent = "Dismiss";
  dismissBtn.addEventListener("click", () => {
    policyBanner?.remove();
    policyBanner = null;
  });

  wrapper.appendChild(textContainer);
  wrapper.appendChild(dismissBtn);
  policyBanner.appendChild(wrapper);
  document.body.appendChild(policyBanner);

  setTimeout(() => {
    if (policyBanner) {
      policyBanner.remove();
      policyBanner = null;
    }
  }, 30000);
}
