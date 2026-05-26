import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const body = await request.json();
  const { action, expires_in_hours, admin_note } = body;

  if (!["approved", "denied"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {
    status: action,
    granted_by: user.id,
    granted_at: new Date().toISOString(),
    admin_note: admin_note || null,
  };

  if (action === "approved" && expires_in_hours) {
    updateData.expires_at = new Date(Date.now() + expires_in_hours * 3600000).toISOString();
  }

  const { data, error } = await admin
    .from("access_requests")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If approved, create a temporary "monitor" policy exception
  if (action === "approved" && data) {
    // We don't create a new policy — instead the extension checks for approved access_requests
    // when evaluating policies. This way the access automatically expires.
  }

  return NextResponse.json(data);
}
