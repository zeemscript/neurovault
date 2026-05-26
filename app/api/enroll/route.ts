import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrollmentSchema } from "@/lib/validators";
import { randomBytes, randomUUID } from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = enrollmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { code, name, email } = parsed.data;
  const admin = createAdminClient();

  // 1. Validate enrollment link
  const { data: link, error: linkError } = await admin
    .from("enrollment_links")
    .select("id, org_id, max_uses, used_count, expires_at, is_active, organizations(name, domain)")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  if (linkError || !link) {
    return NextResponse.json({ error: "Invalid or expired enrollment link" }, { status: 404 });
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "This enrollment link has expired" }, { status: 410 });
  }

  if (link.max_uses && link.used_count >= link.max_uses) {
    return NextResponse.json({ error: "This enrollment link has reached its usage limit" }, { status: 410 });
  }

  const org = (Array.isArray(link.organizations) ? link.organizations[0] : link.organizations) as unknown as { name: string; domain: string | null } | null;

  // 2. Optional: validate email domain
  if (org?.domain) {
    const emailDomain = email.split("@")[1];
    if (emailDomain !== org.domain) {
      return NextResponse.json({ error: `Only @${org.domain} email addresses are allowed` }, { status: 403 });
    }
  }

  // 3. Check if user already exists
  const { data: { users: existingUsers } } = await admin.auth.admin.listUsers();
  const existingUser = (existingUsers || []).find((u) => u.email === email);

  let userId: string;

  if (existingUser) {
    // Check if already a member of this org
    const { data: existingMember } = await admin
      .from("org_members")
      .select("id")
      .eq("org_id", link.org_id)
      .eq("user_id", existingUser.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: "You are already enrolled in this organization. Contact your admin for a new token." }, { status: 409 });
    }

    userId = existingUser.id;
  } else {
    // 4. Create new Supabase auth user with random password (can't log into dashboard)
    const randomPassword = randomBytes(32).toString("base64");
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        is_employee: true,
      },
    });

    if (createError || !newUser.user) {
      return NextResponse.json({ error: createError?.message || "Failed to create user" }, { status: 500 });
    }

    userId = newUser.user.id;
  }

  // 5. Add as employee to org
  const { error: memberError } = await admin
    .from("org_members")
    .insert({ org_id: link.org_id, user_id: userId, role: "employee" });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  // 6. Set current_org_id
  await admin
    .from("profiles")
    .update({ current_org_id: link.org_id })
    .eq("id", userId);

  // 7. Generate extension token
  const token = `nv_${randomUUID().replace(/-/g, "")}_${randomBytes(16).toString("hex")}`;

  const { error: tokenError } = await admin
    .from("extension_tokens")
    .insert({
      org_id: link.org_id,
      user_id: userId,
      token,
      device_info: { enrolled_via: "enrollment_link", link_code: code },
    });

  if (tokenError) {
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }

  // 8. Increment used_count
  await admin
    .from("enrollment_links")
    .update({ used_count: (link.used_count || 0) + 1 })
    .eq("id", link.id);

  // 9. Update enrollment_invite if exists
  await admin
    .from("enrollment_invites")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("org_id", link.org_id)
    .eq("email", email);

  return NextResponse.json({
    token,
    orgName: org?.name || "Organization",
    userName: name,
  }, { status: 201 });
}
