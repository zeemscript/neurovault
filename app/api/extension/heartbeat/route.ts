import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateExtensionToken, AuthError } from "@/lib/extension-auth";

export async function POST(request: Request) {
  try {
    const { org_id, user_id, token_id } = await validateExtensionToken(request);
    const body = await request.json();
    const { active_tabs } = body;

    if (!Array.isArray(active_tabs)) {
      return NextResponse.json({ error: "active_tabs must be an array" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Delete all existing sessions for this user in this org
    await admin
      .from("active_sessions")
      .delete()
      .eq("org_id", org_id)
      .eq("user_id", user_id);

    // Insert current active tabs
    if (active_tabs.length > 0) {
      const rows = active_tabs
        .filter((tab: { ai_tool_id: string }) => tab.ai_tool_id)
        .map((tab: { ai_tool_id: string; url?: string; title?: string; started_at?: string }) => ({
          org_id,
          user_id,
          ai_tool_id: tab.ai_tool_id,
          tab_url: tab.url || null,
          page_title: tab.title || null,
          started_at: tab.started_at || new Date().toISOString(),
          last_heartbeat: new Date().toISOString(),
        }));

      if (rows.length > 0) {
        await admin.from("active_sessions").insert(rows);
      }
    }

    // Update token last_seen_at
    await admin
      .from("extension_tokens")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", token_id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
