import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateExtensionToken, AuthError } from "@/lib/extension-auth";
import { activityReportSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const { org_id, user_id, token_id } = await validateExtensionToken(request);

    const body = await request.json();
    const parsed = activityReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const rows = parsed.data.events.map((event) => ({
      org_id,
      user_id,
      ai_tool_id: event.ai_tool_id,
      url: event.url,
      page_title: event.page_title ?? null,
      duration_secs: event.duration_secs ?? null,
      event_type: event.event_type,
      created_at: event.timestamp,
      metadata: event.metadata ?? {},
    }));

    const supabase = createAdminClient();

    const { error } = await supabase.from("activity_events").insert(rows);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update token last_seen_at
    void supabase.from("extension_tokens").update({ last_seen_at: new Date().toISOString() }).eq("id", token_id);

    return NextResponse.json({ received: rows.length });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
