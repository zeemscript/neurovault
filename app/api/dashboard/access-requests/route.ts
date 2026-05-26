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

    // Fetch access requests without problematic FK joins
    const { data, error } = await admin
      .from("access_requests")
      .select("*, ai_tools(name, category, default_risk)")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get user profiles and emails separately
    const userIds = [...new Set((data || []).map((r) => r.user_id))];

    let profileMap = new Map<string, string>();
    let emailMap = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name || "Unknown"]));

      try {
        const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 });
        emailMap = new Map((authUsers || []).map((u) => [u.id, u.email || ""]));
      } catch { /* */ }
    }

    const enriched = (data || []).map((r) => ({
      ...r,
      profiles: { full_name: profileMap.get(r.user_id) || "Unknown" },
      user_email: emailMap.get(r.user_id) || "—",
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
