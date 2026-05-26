import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateExtensionToken, AuthError } from "@/lib/extension-auth";

export async function GET(request: Request) {
  try {
    const { org_id, user_id } = await validateExtensionToken(request);
    const supabase = createAdminClient();

    const [policiesResult, aiToolsResult] = await Promise.all([
      supabase
        .from("policies")
        .select("*, ai_tool:ai_tools(*)")
        .eq("org_id", org_id)
        .eq("enabled", true),
      supabase.from("ai_tools").select("*"),
    ]);

    if (policiesResult.error) {
      return NextResponse.json(
        { error: policiesResult.error.message },
        { status: 500 }
      );
    }

    if (aiToolsResult.error) {
      return NextResponse.json(
        { error: aiToolsResult.error.message },
        { status: 500 }
      );
    }

    // Get approved, non-expired access overrides for this user
    const { data: accessOverrides } = await supabase
      .from("access_requests")
      .select("ai_tool_id, expires_at")
      .eq("org_id", org_id)
      .eq("user_id", user_id)
      .eq("status", "approved");

    const now = new Date().toISOString();
    const validOverrides = (accessOverrides || [])
      .filter((o) => !o.expires_at || o.expires_at > now)
      .map((o) => o.ai_tool_id);

    return NextResponse.json({
      policies: policiesResult.data,
      ai_tools: aiToolsResult.data,
      access_overrides: validOverrides,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
