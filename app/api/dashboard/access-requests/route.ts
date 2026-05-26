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

  const { data, error } = await admin
    .from("access_requests")
    .select("*, ai_tools(name, category, default_risk), profiles!access_requests_user_id_fkey(full_name)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get emails
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers();
  const emailMap = new Map((authUsers || []).map((u) => [u.id, u.email]));

  const enriched = (data || []).map((r) => ({
    ...r,
    user_email: emailMap.get(r.user_id) || "—",
  }));

  return NextResponse.json(enriched);
}
