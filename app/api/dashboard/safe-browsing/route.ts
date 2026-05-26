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

    // Get all extensions for the org
    const { data: extensions, error } = await admin
      .from("browser_extensions")
      .select("*")
      .eq("org_id", orgId)
      .order("risk_score", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get user profiles for display
    const userIds = [...new Set((extensions || []).map((e) => e.user_id))];
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const result = (extensions || []).map((ext) => ({
      ...ext,
      profile: profileMap.get(ext.user_id) || { full_name: "Unknown", avatar_url: null },
    }));

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("current_org_id").eq("id", user.id).single();
    const orgId = profile?.current_org_id;
    if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

    const body = await request.json();
    const { action, extensionId } = body;

    if (!extensionId || !["allowed", "blocked", "monitored"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { error } = await admin
      .from("browser_extensions")
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq("id", extensionId)
      .eq("org_id", orgId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
