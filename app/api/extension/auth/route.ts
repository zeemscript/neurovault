import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes, randomUUID } from "crypto";

export async function POST(request: Request) {
  // Authenticate the user via session
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { device_info = {} } = body;

  const admin = createAdminClient();

  // Get user's current org
  let { data: profile } = await admin
    .from("profiles")
    .select("current_org_id")
    .eq("id", user.id)
    .single();

  // If no org exists, auto-create one from signup metadata or default
  if (!profile?.current_org_id) {
    const orgName =
      user.user_metadata?.org_name ||
      (user.email ? `${user.email.split("@")[0]}'s Organization` : "My Organization");

    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({ name: orgName, slug: `${slug}-${Date.now()}` })
      .select()
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: "Failed to create organization: " + (orgError?.message || "Unknown error") },
        { status: 500 }
      );
    }

    // Add user as owner
    await admin
      .from("org_members")
      .insert({ org_id: org.id, user_id: user.id, role: "owner" });

    // Set as current org
    await admin
      .from("profiles")
      .update({ current_org_id: org.id })
      .eq("id", user.id);

    profile = { current_org_id: org.id };
  }

  // Generate a secure token
  const token = `nv_${randomUUID().replace(/-/g, "")}_${randomBytes(16).toString("hex")}`;

  const { data, error } = await admin
    .from("extension_tokens")
    .insert({
      org_id: profile.current_org_id,
      user_id: user.id,
      token,
      device_info,
    })
    .select("id, token, org_id, user_id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
