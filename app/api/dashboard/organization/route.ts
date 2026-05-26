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

  const { data, error } = await admin.from("organizations").select("*").eq("id", orgId).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("current_org_id").eq("id", user.id).single();
  const orgId = profile?.current_org_id;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  // Check user is admin/owner
  const { data: membership } = await admin
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await request.json();
  const { name, domain } = body;

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) updateData.name = name;
  if (domain !== undefined) updateData.domain = domain || null;

  const { data, error } = await admin
    .from("organizations")
    .update(updateData)
    .eq("id", orgId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
