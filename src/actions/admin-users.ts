"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { authCookieNames, getAuthenticatedSupabaseServerClient } from "@/src/lib/supabase-server";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;
  const supabase = token ? getAuthenticatedSupabaseServerClient(token) : null;

  if (!supabase || !token) {
    throw new Error("Unauthorized");
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return { supabase, user };
}

export async function updateUserRoleAction(targetUserId: string, newRole: "admin" | "customer") {
  const { supabase, user: adminUser } = await verifyAdmin();

  if (targetUserId === adminUser.id) {
    throw new Error("You cannot change your own role.");
  }

  const { error } = await supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    throw new Error(error.message);
  }

  // Log the audit
  await supabase.from("audit_logs").insert({
    admin_id: adminUser.id,
    action: "update_role",
    entity: "user",
    entity_id: targetUserId,
    details: { newRole },
  });

  revalidatePath("/admin/users");
}
