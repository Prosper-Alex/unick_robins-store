import type { User } from "@supabase/supabase-js";
import { getAuthenticatedSupabaseServerClient, getSupabaseAdminClient } from "@/src/lib/supabase-server";

export async function ensureUserProfile(user: User, accessToken?: string | null) {
  const email = user.email?.trim().toLowerCase();

  if (!email) {
    return { role: "customer", created: false };
  }

  try {
    const adminSupabase = getSupabaseAdminClient();

    if (adminSupabase) {
      const { data: existing } = await adminSupabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (existing?.role) {
        await adminSupabase.from("users").update({ email }).eq("id", user.id);
        return { role: existing.role as string, created: false };
      }

      const role = await getInitialRole(email);
      const { data: inserted } = await adminSupabase
        .from("users")
        .insert({ id: user.id, email, role })
        .select("role")
        .single();

      return { role: (inserted?.role as string | undefined) ?? role, created: true };
    }

    const authenticatedSupabase = accessToken
      ? getAuthenticatedSupabaseServerClient(accessToken)
      : null;

    if (!authenticatedSupabase) {
      return { role: "customer", created: false };
    }

    const { data: existing } = await authenticatedSupabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (existing?.role) {
      return { role: existing.role as string, created: false };
    }

    const { data: inserted } = await authenticatedSupabase
      .from("users")
      .insert({ id: user.id, email, role: "customer" })
      .select("role")
      .single();

    return { role: (inserted?.role as string | undefined) ?? "customer", created: true };
  } catch {
    return { role: "customer", created: false };
  }
}

async function getInitialRole(email: string) {
  const adminSupabase = getSupabaseAdminClient();

  if (!adminSupabase) {
    return "customer";
  }

  const { data } = await adminSupabase
    .from("admin_whitelist")
    .select("email")
    .ilike("email", email)
    .maybeSingle();

  return data?.email ? "admin" : "customer";
}
