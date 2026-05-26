import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateExtensionToken, AuthError } from "@/lib/extension-auth";

export async function POST(request: Request) {
  try {
    const { org_id, user_id } = await validateExtensionToken(request);

    const body = await request.json();
    const { extensions } = body;

    if (!Array.isArray(extensions)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upsert each extension (update if exists, insert if new)
    for (const ext of extensions) {
      await supabase
        .from("browser_extensions")
        .upsert(
          {
            org_id,
            user_id,
            extension_id: ext.extension_id,
            name: ext.name,
            version: ext.version,
            description: ext.description,
            enabled: ext.enabled,
            install_type: ext.install_type,
            risk_level: ext.risk_level,
            risk_score: ext.risk_score,
            risk_reasons: ext.risk_reasons,
            permissions: ext.permissions,
            host_permissions: ext.host_permissions,
            homepage_url: ext.homepage_url,
            update_url: ext.update_url,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "org_id,user_id,extension_id" }
        );
    }

    return NextResponse.json({ received: extensions.length });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
