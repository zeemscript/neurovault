import { BrowserExtensionInfo } from "./types";

// Permissions considered dangerous — weighted by severity
const DANGEROUS_PERMISSIONS: Record<string, number> = {
  debugger: 25,
  nativeMessaging: 20,
  proxy: 20,
  webRequest: 15,
  webRequestBlocking: 20,
  webRequestAuthProvider: 15,
  cookies: 15,
  history: 12,
  bookmarks: 8,
  downloads: 10,
  management: 12,
  privacy: 15,
  topSites: 8,
  tabCapture: 15,
  desktopCapture: 15,
  "content_settings": 10,
  geolocation: 10,
  clipboardRead: 12,
  clipboardWrite: 8,
  "declarativeNetRequest": 10,
  "declarativeNetRequestFeedback": 10,
  browsingData: 12,
  identity: 10,
  "identity.email": 8,
  "sessions": 8,
  "webNavigation": 5,
};

// Host permission patterns that indicate broad or sensitive access
const SENSITIVE_HOST_PATTERNS = [
  { pattern: /<all_urls>/i, score: 20, reason: "Access to all websites" },
  { pattern: /\*:\/\/\*\.\*\//i, score: 20, reason: "Wildcard access to all domains" },
  { pattern: /https?:\/\/\*\//i, score: 15, reason: "Access to all HTTP(S) sites" },
  { pattern: /mail\.google|outlook|yahoo.*mail/i, score: 12, reason: "Access to email services" },
  { pattern: /banking|chase|wellsfargo|bankofamerica|paypal|stripe\.com/i, score: 15, reason: "Access to banking/payment sites" },
  { pattern: /github\.com|gitlab|bitbucket/i, score: 8, reason: "Access to code repositories" },
  { pattern: /slack\.com|teams\.microsoft|discord/i, score: 8, reason: "Access to messaging platforms" },
  { pattern: /drive\.google|dropbox|onedrive/i, score: 10, reason: "Access to cloud storage" },
];

/**
 * Assess the risk level of a browser extension.
 * Returns a risk score (0-100), level, and reasons.
 */
export function assessExtensionRisk(
  ext: chrome.management.ExtensionInfo
): { level: string; score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Check install type
  if (ext.installType === "sideload") {
    score += 15;
    reasons.push("Sideloaded (not from Web Store)");
  } else if (ext.installType === "development") {
    score += 10;
    reasons.push("Developer mode extension");
  }

  // 2. Check if from Chrome Web Store
  const isWebStore = ext.updateUrl?.includes("google.com") || ext.updateUrl?.includes("chrome.google.com");
  if (!isWebStore && ext.installType !== "admin") {
    score += 10;
    reasons.push("Not from Chrome Web Store");
  }

  // 3. Check permissions
  const perms = ext.permissions || [];
  for (const perm of perms) {
    const weight = DANGEROUS_PERMISSIONS[perm];
    if (weight) {
      score += weight;
      reasons.push(`Has '${perm}' permission`);
    }
  }

  // 4. Check host permissions
  const hostPerms = ext.hostPermissions || [];
  for (const host of hostPerms) {
    for (const { pattern, score: s, reason } of SENSITIVE_HOST_PATTERNS) {
      if (pattern.test(host)) {
        score += s;
        reasons.push(reason);
        break; // Only match first pattern per host
      }
    }
  }

  // 5. Excessive permissions count
  const totalPerms = perms.length + hostPerms.length;
  if (totalPerms > 15) {
    score += 10;
    reasons.push(`Excessive permissions (${totalPerms} total)`);
  } else if (totalPerms > 10) {
    score += 5;
    reasons.push(`Many permissions (${totalPerms} total)`);
  }

  // 6. No homepage
  if (!ext.homepageUrl) {
    score += 5;
    reasons.push("No homepage URL");
  }

  // 7. Disabled by user but still installed
  if (!ext.enabled) {
    score = Math.max(0, score - 10); // Lower risk if disabled
  }

  // Cap at 100
  score = Math.min(100, score);

  // Determine level
  let level: string;
  if (score <= 10) level = "safe";
  else if (score <= 25) level = "low";
  else if (score <= 50) level = "medium";
  else if (score <= 75) level = "high";
  else level = "critical";

  // Deduplicate reasons
  const uniqueReasons = [...new Set(reasons)];

  return { level, score, reasons: uniqueReasons };
}

/**
 * Scan all installed extensions and return assessed info.
 * Excludes the NeuroVault extension itself and Chrome built-in components.
 */
export async function scanAllExtensions(): Promise<BrowserExtensionInfo[]> {
  const extensions = await chrome.management.getAll();
  const selfId = chrome.runtime.id;

  return extensions
    .filter((ext) => {
      // Exclude self
      if (ext.id === selfId) return false;
      // Exclude Chrome built-in apps/themes
      if (ext.type === "theme") return false;
      if (ext.isApp) return false;
      return true;
    })
    .map((ext) => {
      const { level, score, reasons } = assessExtensionRisk(ext);

      return {
        extension_id: ext.id,
        name: ext.name,
        version: ext.version,
        description: ext.description || "",
        enabled: ext.enabled,
        install_type: ext.installType,
        permissions: ext.permissions || [],
        host_permissions: ext.hostPermissions || [],
        homepage_url: ext.homepageUrl,
        update_url: ext.updateUrl,
        risk_level: level,
        risk_score: score,
        risk_reasons: reasons,
      };
    });
}
