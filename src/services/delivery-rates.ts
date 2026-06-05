import { unstable_cache } from "next/cache";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/src/lib/supabase-server";
import type { DeliveryRate } from "@/src/types/shipping";
import { fallbackShippingRates } from "@/src/utils/pricing";

const TABLE = "delivery_rates";
export const DELIVERY_RATES_CACHE_TAG = "delivery-rates";

export const getActiveDeliveryRates = unstable_cache(
  async (): Promise<DeliveryRate[]> => {
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return fallbackShippingRates.map(toDeliveryRateFallback);
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("is_active", true)
      .order("country_name", { ascending: true })
      .order("state_name", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackShippingRates.map(toDeliveryRateFallback);
    }

    return data.map(normalizeDeliveryRate);
  },
  ["active-delivery-rates"],
  { revalidate: 300, tags: [DELIVERY_RATES_CACHE_TAG] },
);

export async function getActiveDeliveryRatesForPayment() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return fallbackShippingRates.map(toDeliveryRateFallback);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("is_active", true)
    .order("country_name", { ascending: true })
    .order("state_name", { ascending: true });

  if (error || !data || data.length === 0) {
    return fallbackShippingRates.map(toDeliveryRateFallback);
  }

  return data.map(normalizeDeliveryRate);
}

export function normalizeDeliveryRate(rate: Record<string, unknown>): DeliveryRate {
  return {
    id: String(rate.id ?? ""),
    country_code: String(rate.country_code ?? ""),
    country_name: String(rate.country_name ?? ""),
    state_name: rate.state_name ? String(rate.state_name) : null,
    standard_fee: Number(rate.standard_fee ?? 0),
    express_fee: Number(rate.express_fee ?? 0),
    currency: rate.currency === "USD" ? "USD" : "NGN",
    is_active: rate.is_active !== false,
    created_at: String(rate.created_at ?? ""),
    updated_at: rate.updated_at ? String(rate.updated_at) : null,
  };
}

function toDeliveryRateFallback(rate: (typeof fallbackShippingRates)[number], index: number): DeliveryRate {
  return {
    id: `fallback-${index}`,
    country_code: rate.country_code,
    country_name: rate.country_name,
    state_name: rate.state_name ?? null,
    standard_fee: rate.standard_fee,
    express_fee: rate.express_fee,
    currency: rate.currency,
    is_active: rate.is_active !== false,
    created_at: "",
    updated_at: null,
  };
}
