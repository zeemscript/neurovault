import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("current_org_id").eq("id", user.id).single();
  const orgId = profile?.current_org_id;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { data, error } = await admin
    .from("enrollment_links")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("current_org_id").eq("id", user.id).single();
  const orgId = profile?.current_org_id;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const { label, maxUses, expiresInDays } = body;

  // Generate a URL-safe code (12 chars)
  const code = randomBytes(9).toString("base64url");

  const insertData: Record<string, unknown> = {
    org_id: orgId,
    code,
    label: label || null,
    created_by: user.id,
    max_uses: maxUses || null,
  };

  if (expiresInDays) {
    insertData.expires_at = new Date(Date.now() + expiresInDays * 86400000).toISOString();
  }

  const { data, error } = await admin
    .from("enrollment_links")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
