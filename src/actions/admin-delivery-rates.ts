"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authCookieNames, getAuthenticatedSupabaseServerClient } from "@/src/lib/supabase-server";
import { DELIVERY_RATES_CACHE_TAG, normalizeDeliveryRate } from "@/src/services/delivery-rates";
import type { DeliveryRate, DeliveryRateInput } from "@/src/types/shipping";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;
  const supabase = token ? getAuthenticatedSupabaseServerClient(token) : null;

  if (!supabase || !token) {
    throw new Error("Unauthorized");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

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
  entityId: string | null,
  details: Record<string, unknown> | null = null,
) {
  await supabase.from("audit_logs").insert({
    admin_id: adminId,
    action,
    entity: "delivery_rate",
    entity_id: entityId,
    details,
  });
}

export async function createDeliveryRateAction(
  input: DeliveryRateInput,
): Promise<DeliveryRate> {
  const { supabase, user } = await verifyAdmin();
  const payload = normalizeInput(input);
  const { data, error } = await supabase
    .from("delivery_rates")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(supabase, user.id, "create", data.id, payload);
  revalidateDeliveryRates();

  return normalizeDeliveryRate(data);
}

export async function updateDeliveryRateAction(
  id: string,
  input: DeliveryRateInput,
): Promise<DeliveryRate> {
  const { supabase, user } = await verifyAdmin();
  const payload = normalizeInput(input);
  const { data, error } = await supabase
    .from("delivery_rates")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(supabase, user.id, "update", id, payload);
  revalidateDeliveryRates();

  return normalizeDeliveryRate(data);
}

export async function deleteDeliveryRateAction(id: string): Promise<void> {
  const { supabase, user } = await verifyAdmin();
  const { error } = await supabase.from("delivery_rates").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(supabase, user.id, "delete", id);
  revalidateDeliveryRates();
}

function normalizeInput(input: DeliveryRateInput) {
  return {
    country_code: input.country_code.trim().toUpperCase(),
    country_name: input.country_name.trim(),
    state_name: input.state_name?.trim() || null,
    standard_fee: Number(input.standard_fee),
    express_fee: Number(input.express_fee),
    currency: input.currency,
    is_active: Boolean(input.is_active),
  };
}

function revalidateDeliveryRates() {
  revalidateTag(DELIVERY_RATES_CACHE_TAG, "max");
  revalidatePath("/admin/shipping");
  revalidatePath("/checkout");
}
