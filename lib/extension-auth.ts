import { createAdminClient } from "@/lib/supabase/admin";

interface TokenValidation {
  user_id: string;
  org_id: string;
  token_id: string;
}

export async function validateExtensionToken(
  request: Request
): Promise<TokenValidation> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid Authorization header", 401);
  }

  const token = authHeader.slice(7);

  if (!token) {
    throw new AuthError("Empty token", 401);
  }

  // Use admin client to bypass RLS — these routes have no user session
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("extension_tokens")
    .select("id, user_id, org_id")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    throw new AuthError("Invalid or revoked token", 401);
  }

  // Update last_seen_at (fire-and-forget, don't block the response)
  void supabase
    .from("extension_tokens")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", data.id);

  return {
    user_id: data.user_id,
    org_id: data.org_id,
    token_id: data.id,
  };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
