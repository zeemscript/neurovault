import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user needs org setup
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user has a profile with an org
        const { data: profile } = await supabase
          .from("profiles")
          .select("current_org_id")
          .eq("id", user.id)
          .single();

        if (!profile?.current_org_id && user.user_metadata?.org_name) {
          // Create org for new user
          const orgName = user.user_metadata.org_name as string;
          const slug = orgName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

          const { data: org } = await supabase
            .from("organizations")
            .insert({ name: orgName, slug: `${slug}-${Date.now()}` })
            .select()
            .single();

          if (org) {
            await supabase
              .from("org_members")
              .insert({ org_id: org.id, user_id: user.id, role: "owner" });

            await supabase
              .from("profiles")
              .update({ current_org_id: org.id })
              .eq("id", user.id);
          }
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
