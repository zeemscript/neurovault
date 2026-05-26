import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
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

  const { data, error } = await admin
    .from("alert_rules")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
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

  const body = await request.json();
  const { name, description, condition, severity, notify_email, notify_dashboard } = body;

  if (!name || !condition?.type) {
    return NextResponse.json(
      { error: "Name and condition type are required" },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("alert_rules")
    .insert({
      org_id: orgId,
      name,
      description: description || null,
      condition,
      severity: severity || "medium",
      notify_email: notify_email ?? true,
      notify_dashboard: notify_dashboard ?? true,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
