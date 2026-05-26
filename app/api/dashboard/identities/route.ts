import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("current_org_id").eq("id", user.id).single();
    const orgId = profile?.current_org_id;
    if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

    // Fetch discovered identities from db
    const { data: identities, error: identitiesError } = await admin
      .from("saas_identities")
      .select("*")
      .eq("org_id", orgId)
      .order("last_active", { ascending: false });

    if (identitiesError) throw identitiesError;

    if (!identities || identities.length === 0) {
      return NextResponse.json([]);
    }

    // Grab profiles to associate names
    const { data: members } = await admin
      .from("org_members")
      .select("user_id, role")
      .eq("org_id", orgId);
    
    const userIds = (members || []).map((m) => m.user_id);
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // If real data exists, combine with profiles
    const result = identities.map((ident) => {
      const prof = profileMap.get(ident.user_id);
      return {
        ...ident,
        profile: {
          full_name: prof?.full_name || "Unknown",
          avatar_url: prof?.avatar_url || null
        }
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("current_org_id").eq("id", user.id).single();
    const orgId = profile?.current_org_id;
    if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

    const body = await request.json();
    const { action, identityId } = body;

    if (!identityId) {
      return NextResponse.json({ error: "Missing identity ID" }, { status: 400 });
    }

    // For real database identities, perform updates
    if (action === "secure") {
      const { error } = await admin
        .from("saas_identities")
        .update({ status: "secure", mfa_enabled: true, sso_connected: true })
        .eq("id", identityId)
        .eq("org_id", orgId);
      if (error) throw error;
    } else if (action === "block") {
      const { error } = await admin
        .from("saas_identities")
        .update({ status: "breached", last_active: new Date().toISOString() })
        .eq("id", identityId)
        .eq("org_id", orgId);
      if (error) throw error;
    } else if (action === "warn") {
      const { error } = await admin
        .from("saas_identities")
        .update({ status: "warn", last_active: new Date().toISOString() })
        .eq("id", identityId)
        .eq("org_id", orgId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: `Identity updated successfully.` });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
