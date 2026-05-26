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
  const days = parseInt(searchParams.get("days") || "7");
  const since = new Date(Date.now() - days * 86400000).toISOString();

  // Run all queries in parallel
  const [toolsResult, eventsResult, usersResult, alertsResult] =
    await Promise.all([
      // Unique AI tools detected
      admin
        .from("activity_events")
        .select("ai_tool_id")
        .eq("org_id", orgId)
        .not("ai_tool_id", "is", null)
        .gte("created_at", since),

      // Total events count
      admin
        .from("activity_events")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .gte("created_at", since),

      // Unique users
      admin
        .from("activity_events")
        .select("user_id")
        .eq("org_id", orgId)
        .gte("created_at", since),

      // Open alerts
      admin
        .from("alerts")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("status", "open"),
    ]);

  const uniqueTools = new Set(
    toolsResult.data?.map((e) => e.ai_tool_id) || []
  ).size;
  const uniqueUsers = new Set(
    usersResult.data?.map((e) => e.user_id) || []
  ).size;

  return NextResponse.json({
    ai_tools_detected: uniqueTools,
    total_events: eventsResult.count || 0,
    active_users: uniqueUsers,
    open_alerts: alertsResult.count || 0,
    period_days: days,
  });
}
