import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("current_org_id")
    .eq("id", user.id)
    .single();

  const orgId = profile?.current_org_id;
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  const since = new Date(Date.now() - days * 86400000).toISOString();

  // Fetch all events for the period
  const { data: events, error } = await admin
    .from("activity_events")
    .select("ai_tool_id, event_type, user_id, created_at")
    .eq("org_id", orgId)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch AI tools for labeling
  const { data: aiTools } = await admin
    .from("ai_tools")
    .select("id, name, category, default_risk");

  const toolMap = new Map(
    (aiTools || []).map((t) => [t.id, t])
  );

  // Daily activity trend
  const dailyMap = new Map<string, number>();
  for (const evt of events || []) {
    const day = evt.created_at.slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
  }
  const dailyTrend = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Tool usage breakdown
  const toolCounts = new Map<string, number>();
  for (const evt of events || []) {
    if (evt.ai_tool_id) {
      toolCounts.set(evt.ai_tool_id, (toolCounts.get(evt.ai_tool_id) || 0) + 1);
    }
  }
  const toolBreakdown = Array.from(toolCounts.entries())
    .map(([toolId, count]) => ({
      tool_id: toolId,
      name: toolMap.get(toolId)?.name || toolId,
      category: toolMap.get(toolId)?.category || "unknown",
      risk: toolMap.get(toolId)?.default_risk || "medium",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Category breakdown
  const categoryCounts = new Map<string, number>();
  for (const item of toolBreakdown) {
    categoryCounts.set(
      item.category,
      (categoryCounts.get(item.category) || 0) + item.count
    );
  }
  const categoryBreakdown = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Event type breakdown
  const eventTypeCounts = new Map<string, number>();
  for (const evt of events || []) {
    eventTypeCounts.set(
      evt.event_type,
      (eventTypeCounts.get(evt.event_type) || 0) + 1
    );
  }
  const eventTypeBreakdown = Array.from(eventTypeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Top users
  const userCounts = new Map<string, number>();
  for (const evt of events || []) {
    userCounts.set(evt.user_id, (userCounts.get(evt.user_id) || 0) + 1);
  }
  const topUsers = Array.from(userCounts.entries())
    .map(([userId, count]) => ({ user_id: userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Risk distribution
  const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const item of toolBreakdown) {
    const risk = item.risk as keyof typeof riskCounts;
    if (risk in riskCounts) {
      riskCounts[risk] += item.count;
    }
  }

  return NextResponse.json({
    daily_trend: dailyTrend,
    tool_breakdown: toolBreakdown,
    category_breakdown: categoryBreakdown,
    event_type_breakdown: eventTypeBreakdown,
    top_users: topUsers,
    risk_distribution: riskCounts,
    total_events: events?.length || 0,
    period_days: days,
  });
}
