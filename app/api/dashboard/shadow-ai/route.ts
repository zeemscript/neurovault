import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("current_org_id").eq("id", user.id).single();
  const orgId = profile?.current_org_id;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  // Get all activity events for this org, grouped by ai_tool_id
  const { data: events } = await admin
    .from("activity_events")
    .select("ai_tool_id, user_id, created_at")
    .eq("org_id", orgId)
    .not("ai_tool_id", "is", null);

  // Get AI tools reference
  const { data: aiTools } = await admin.from("ai_tools").select("*");
  const toolMap = new Map((aiTools || []).map((t) => [t.id, t]));

  // Get policies
  const { data: policies } = await admin.from("policies").select("*").eq("org_id", orgId).eq("enabled", true);

  // Get active sessions (heartbeats within last 2 minutes are considered active)
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: activeSessions } = await admin
    .from("active_sessions")
    .select("ai_tool_id, user_id, page_title, started_at")
    .eq("org_id", orgId)
    .gte("last_heartbeat", twoMinAgo);

  // Group active sessions by tool
  const activeByTool = new Map<string, { count: number; users: Set<string> }>();
  for (const s of activeSessions || []) {
    const existing = activeByTool.get(s.ai_tool_id) || { count: 0, users: new Set<string>() };
    existing.count++;
    existing.users.add(s.user_id);
    activeByTool.set(s.ai_tool_id, existing);
  }

  // Aggregate by tool
  const toolStats = new Map<string, { visits: number; users: Set<string>; lastSeen: string }>();
  for (const evt of events || []) {
    const toolId = evt.ai_tool_id;
    if (!toolId) continue;
    const existing = toolStats.get(toolId) || { visits: 0, users: new Set<string>(), lastSeen: evt.created_at };
    existing.visits++;
    existing.users.add(evt.user_id);
    if (evt.created_at > existing.lastSeen) existing.lastSeen = evt.created_at;
    toolStats.set(toolId, existing);
  }

  // Build response
  const result = Array.from(toolStats.entries()).map(([toolId, stats]) => {
    const tool = toolMap.get(toolId);
    const policy = (policies || []).find((p) => p.ai_tool_id === toolId || p.category === tool?.category);
    const active = activeByTool.get(toolId);
    return {
      id: toolId,
      name: tool?.name || toolId,
      category: tool?.category || "unknown",
      risk: tool?.default_risk || "medium",
      total_visits: stats.visits,
      unique_users: stats.users.size,
      last_seen: stats.lastSeen,
      policy_action: policy?.action || "none",
      active_sessions: active?.count || 0,
      active_users: active?.users.size || 0,
    };
  }).sort((a, b) => b.total_visits - a.total_visits);

  return NextResponse.json(result);
}
