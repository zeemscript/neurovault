import { AiTool, CachedPolicies, Policy, PolicyAction } from "../shared/types";
import { getCachedPolicies, setCachedPolicies } from "../shared/storage";
import { fetchAndCachePolicies } from "../shared/api-client";
import { DEFAULT_AI_TOOLS, matchUrlToTool } from "../shared/ai-tools";

let cached: CachedPolicies | null = null;

export async function refreshPolicies(): Promise<void> {
  try {
    cached = await fetchAndCachePolicies();
    await setCachedPolicies(cached);
    console.log(
      `[NeuroVault] Policies refreshed: ${cached.policies.length} policies, ${cached.ai_tools.length} tools`
    );
  } catch (err) {
    console.error("[NeuroVault] Policy refresh failed:", err);
    // Fall back to cached version
    if (!cached) {
      cached = await getCachedPolicies();
    }
  }
}

export async function getAiTools(): Promise<AiTool[]> {
  if (!cached) {
    cached = await getCachedPolicies();
  }
  return cached?.ai_tools ?? DEFAULT_AI_TOOLS;
}

export function matchUrl(url: string, tools: AiTool[]): AiTool | null {
  return matchUrlToTool(url, tools);
}

/**
 * Evaluate a URL against active policies.
 * Returns the most restrictive action that applies.
 */
export async function evaluateUrl(
  url: string
): Promise<{ action: PolicyAction; tool: AiTool | null; policy: Policy | null }> {
  const tools = await getAiTools();
  const tool = matchUrlToTool(url, tools);

  if (!tool) {
    return { action: "monitor", tool: null, policy: null };
  }

  if (!cached) {
    cached = await getCachedPolicies();
  }

  // Check for approved access override (temporary access grant)
  const overrides = cached?.access_overrides ?? [];
  if (overrides.includes(tool.id)) {
    // User has temporary approved access — downgrade to monitor
    return { action: "monitor", tool, policy: null };
  }

  const policies = (cached?.policies ?? []).filter((p) => p.enabled !== false);

  // Find all matching policies (tool-specific or category-wide)
  const matching = policies.filter((p) => {
    // Tool-specific match
    if (p.ai_tool_id && p.ai_tool_id === tool.id) return true;
    // Category-wide match (no specific tool set)
    if (!p.ai_tool_id && p.category && p.category === tool.category) return true;
    return false;
  });

  if (matching.length === 0) {
    return { action: "monitor", tool, policy: null };
  }

  // Most restrictive wins: block > warn > monitor
  const priority: Record<PolicyAction, number> = {
    block: 3,
    warn: 2,
    monitor: 1,
  };

  const sorted = matching.sort(
    (a, b) => priority[b.action] - priority[a.action]
  );

  return { action: sorted[0].action, tool, policy: sorted[0] };
}
