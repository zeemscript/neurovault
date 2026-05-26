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

    // ─── Real-Time SaaS Identity Discovery ───
    try {
      // Find all unique tools from this telemetry batch
      const uniqueTools = Array.from(new Set(rows.map((r) => r.ai_tool_id).filter(Boolean)));
      
      if (uniqueTools.length > 0) {
        // Resolve user email
        const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user_id);
        const email = authUser?.email;

        if (email) {
          // Resolve org domain
          const { data: org } = await supabase.from("organizations").select("domain").eq("id", org_id).single();
          const orgDomain = org?.domain;
          const emailDomain = email.split("@")[1];
          const identity_type = (orgDomain && emailDomain === orgDomain) ? "corporate" as const : "personal" as const;

          // Fetch AI tools catalog for app names
          const { data: aiTools } = await supabase.from("ai_tools").select("id, name").in("id", uniqueTools);
          const toolNames = new Map((aiTools || []).map((t) => [t.id, t.name]));

          for (const toolId of uniqueTools) {
            if (!toolId) continue;
            const app_name = toolNames.get(toolId) || toolId.toUpperCase();

            // Check if identity already registered
            const { data: existingIdent } = await supabase
              .from("saas_identities")
              .select("id")
              .eq("org_id", org_id)
              .eq("user_id", user_id)
              .eq("app_id", toolId)
              .eq("email", email)
              .maybeSingle();

            if (existingIdent) {
              await supabase
                .from("saas_identities")
                .update({ last_active: new Date().toISOString() })
                .eq("id", existingIdent.id);
            } else {
              // Standard auto-discover defaults:
              // Corporate matching = secure/SSO. Personal domain = warn policy.
              const status = identity_type === "personal" ? "warn" as const : "secure" as const;
              const risk_reason = identity_type === "personal"
                ? `Personal address used to access corporate-monitored AI tool.`
                : "SSO and enterprise identity policy active.";

              await supabase.from("saas_identities").insert({
                org_id,
                user_id,
                app_name,
                app_id: toolId,
                email,
                identity_type,
                status,
                mfa_enabled: identity_type === "corporate",
                sso_connected: identity_type === "corporate",
                last_active: new Date().toISOString(),
                details: { risk_reason }
              });
            }
          }
        }
      }
    } catch (discoverErr) {
      console.error("[Identity Discovery] Error executing telemetry parse:", discoverErr);
      // Fail silently to prevent telemetry ingestion from breaking
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
