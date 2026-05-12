"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authCookieNames, getAuthenticatedSupabaseServerClient } from "@/src/lib/supabase-server";

const allowedStatuses = new Set([
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "payment_failed",
]);

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

async function logAudit(
  supabase: SupabaseClient,
  adminId: string,
  action: string,
  entityId: string,
  details: Record<string, unknown>,
) {
  await supabase.from("audit_logs").insert({
    admin_id: adminId,
    action,
    entity: "order",
    entity_id: entityId,
    details,
  });
}

export async function updateOrderStatusAction(input: {
  id: string;
  status: string;
  trackingNumber?: string;
}) {
  const { supabase, user } = await verifyAdmin();
  const status = input.status.trim();

  if (!allowedStatuses.has(status)) {
    throw new Error("Invalid order status.");
  }

  const trackingNumber = input.trackingNumber?.trim() || null;
  const patch: Record<string, string | null> = {
    status,
    tracking_number: trackingNumber,
  };

  if (status === "paid" || status === "processing" || status === "shipped" || status === "delivered") {
    patch.payment_status = "paid";
  }

  const { error } = await supabase.from("orders").update(patch).eq("id", input.id);

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(supabase, user.id, "update_status", input.id, {
    status,
    trackingNumber,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${input.id}`);
}
