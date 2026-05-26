import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("current_org_id").eq("id", user.id).single();
  const orgId = profile?.current_org_id;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const { emails } = body;

  if (!Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: "At least one email required" }, { status: 400 });
  }

  // Deduplicate and normalize
  const uniqueEmails = [...new Set(
    (emails as string[]).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@"))
  )];

  if (uniqueEmails.length === 0) {
    return NextResponse.json({ error: "No valid emails found" }, { status: 400 });
  }

  if (uniqueEmails.length > 500) {
    return NextResponse.json({ error: "Maximum 500 emails per batch" }, { status: 400 });
  }

  // Check which emails are already enrolled — skip them
  const { data: existingMembers } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existingEmails = new Set(
    (existingMembers?.users || [])
      .filter((u) => {
        // Check if this user is already in this org
        return u.email;
      })
      .map((u) => u.email?.toLowerCase())
  );

  const { data: orgMembers } = await admin
    .from("org_members")
    .select("user_id")
    .eq("org_id", orgId);

  const orgMemberIds = new Set((orgMembers || []).map((m) => m.user_id));

  // Filter out emails that are already org members
  const alreadyInOrg = new Set<string>();
  for (const u of existingMembers?.users || []) {
    if (u.email && orgMemberIds.has(u.id)) {
      alreadyInOrg.add(u.email.toLowerCase());
    }
  }

  const newEmails = uniqueEmails.filter((e) => !alreadyInOrg.has(e));
  const skippedCount = uniqueEmails.length - newEmails.length;

  if (newEmails.length === 0) {
    return NextResponse.json({
      message: `All ${uniqueEmails.length} emails are already enrolled`,
      enrollmentUrls: [],
      skipped: skippedCount,
    });
  }

  // Create an enrollment link for this batch
  const code = randomBytes(9).toString("base64url");

  const { data: link, error: linkError } = await admin
    .from("enrollment_links")
    .insert({
      org_id: orgId,
      code,
      label: `Batch invite (${newEmails.length} employees)`,
      created_by: user.id,
      max_uses: newEmails.length,
    })
    .select()
    .single();

  if (linkError || !link) {
    return NextResponse.json({ error: "Failed to create enrollment link" }, { status: 500 });
  }

  // Create invite records for each new email
  const inviteRows = newEmails.map((email: string) => ({
    org_id: orgId,
    email,
    enrollment_link_id: link.id,
    status: "pending",
    created_by: user.id,
  }));

  // Upsert to handle any remaining duplicates
  const { error: inviteError } = await admin
    .from("enrollment_invites")
    .upsert(inviteRows, { onConflict: "org_id,email" });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  // Generate unique enrollment URLs per email
  const baseUrl = request.headers.get("origin") || "http://localhost:3000";
  const enrollmentUrls = newEmails.map((email: string) => ({
    email,
    url: `${baseUrl}/enroll/${code}?email=${encodeURIComponent(email)}`,
  }));

  return NextResponse.json({
    message: `${newEmails.length} enrollment links generated${skippedCount > 0 ? ` (${skippedCount} already enrolled, skipped)` : ""}`,
    enrollmentCode: code,
    enrollmentUrls,
    skipped: skippedCount,
  }, { status: 201 });
}
