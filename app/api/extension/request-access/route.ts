import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateExtensionToken, AuthError } from "@/lib/extension-auth";

export async function POST(request: Request) {
  try {
    const { org_id, user_id } = await validateExtensionToken(request);
    const body = await request.json();
    const { ai_tool_id, reason } = body;

    if (!ai_tool_id) {
      return NextResponse.json({ error: "ai_tool_id required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check for existing pending request (prevent spam)
    const { data: existing } = await admin
      .from("access_requests")
      .select("id")
      .eq("org_id", org_id)
      .eq("user_id", user_id)
      .eq("ai_tool_id", ai_tool_id)
      .eq("status", "pending")
      .single();

    if (existing) {
      return NextResponse.json({ message: "Request already pending" });
    }

    const { data, error } = await admin
      .from("access_requests")
      .insert({
        org_id,
        user_id,
        ai_tool_id,
        reason: reason || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
