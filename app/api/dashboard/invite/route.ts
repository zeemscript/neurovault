import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("current_org_id").eq("id", user.id).single();
  const orgId = profile?.current_org_id;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  // Verify admin/owner role
  const { data: membership } = await admin
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
  }

  const body = await request.json();
  const { email, role = "member" } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!["member", "viewer", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Check if user already exists in auth
  const { data: { users: existingUsers } } = await admin.auth.admin.listUsers();
  const existingUser = (existingUsers || []).find((u) => u.email === email);

  if (existingUser) {
    // Check if already a member
    const { data: existingMember } = await admin
      .from("org_members")
      .select("id")
      .eq("org_id", orgId)
      .eq("user_id", existingUser.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }

    // Add existing user to org
    const { error: memberError } = await admin
      .from("org_members")
      .insert({ org_id: orgId, user_id: existingUser.id, role });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Set current_org_id if they don't have one
    await admin
      .from("profiles")
      .update({ current_org_id: orgId })
      .eq("id", existingUser.id)
      .is("current_org_id", null);

    return NextResponse.json({ message: "User added to organization", user_id: existingUser.id }, { status: 200 });
  }

  // Invite new user via Supabase auth
  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { invited_by: user.id, org_id: orgId, role },
  });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  // Pre-create org membership for when they accept
  if (inviteData.user) {
    await admin.from("org_members").insert({
      org_id: orgId,
      user_id: inviteData.user.id,
      role,
    });

    await admin.from("profiles").update({ current_org_id: orgId }).eq("id", inviteData.user.id);
  }

  return NextResponse.json({ message: "Invitation sent", email }, { status: 201 });
}
