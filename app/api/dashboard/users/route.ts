import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("current_org_id").eq("id", user.id).single();
    const orgId = profile?.current_org_id;
    if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

    // Get org members with profiles
    const { data: members, error: membersError } = await admin
      .from("org_members")
      .select("user_id, role, created_at")
      .eq("org_id", orgId);

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    if (!members || members.length === 0) {
      return NextResponse.json([]);
    }

    // Get profiles for these users
    const userIds = members.map((m) => m.user_id);
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Get emails — try listUsers, fall back gracefully
    let emailMap = new Map<string, string>();
    try {
      const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 });
      emailMap = new Map((authUsers || []).map((u) => [u.id, u.email || ""]));
    } catch {
      // If listUsers fails, emails will show as "—"
    }

    // Get extension tokens
    const { data: tokens } = await admin
      .from("extension_tokens")
      .select("user_id, last_seen_at, is_active")
      .eq("org_id", orgId)
      .eq("is_active", true);

    // Get activity counts per user
    const { data: events } = await admin
      .from("activity_events")
      .select("user_id, ai_tool_id")
      .eq("org_id", orgId);

    const userActivity = new Map<string, Set<string>>();
    for (const evt of events || []) {
      const tools = userActivity.get(evt.user_id) || new Set();
      if (evt.ai_tool_id) tools.add(evt.ai_tool_id);
      userActivity.set(evt.user_id, tools);
    }

    const result = members.map((m) => {
      const prof = profileMap.get(m.user_id);
      const token = (tokens || []).find((t) => t.user_id === m.user_id);
      return {
        user_id: m.user_id,
        name: prof?.full_name || "Unknown",
        email: emailMap.get(m.user_id) || "—",
        role: m.role,
        ai_apps: userActivity.get(m.user_id)?.size || 0,
        extension_connected: !!token,
        last_seen: token?.last_seen_at || null,
        joined: m.created_at,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
