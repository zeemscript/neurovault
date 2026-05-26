import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const admin = createAdminClient();

  const { data: link, error } = await admin
    .from("enrollment_links")
    .select("id, org_id, code, max_uses, used_count, expires_at, is_active, organizations(name)")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  if (error || !link) {
    return NextResponse.json({ valid: false, error: "Invalid or expired enrollment link" }, { status: 404 });
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "This enrollment link has expired" }, { status: 410 });
  }

  if (link.max_uses && link.used_count >= link.max_uses) {
    return NextResponse.json({ valid: false, error: "This enrollment link has reached its usage limit" }, { status: 410 });
  }

  const org = (Array.isArray(link.organizations) ? link.organizations[0] : link.organizations) as unknown as { name: string } | null;

  return NextResponse.json({
    valid: true,
    orgName: org?.name || "Organization",
    orgId: link.org_id,
  });
}
