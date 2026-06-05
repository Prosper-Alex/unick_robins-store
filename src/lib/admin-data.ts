import { cookies } from "next/headers";
import { authCookieNames, getAuthenticatedSupabaseServerClient } from "@/src/lib/supabase-server";
import { normalizeDeliveryRate } from "@/src/services/delivery-rates";
import type { Product } from "@/src/types/product";
import type { DeliveryRate } from "@/src/types/shipping";

export type AdminOrder = {
  id: string;
  user_id?: string | null;
  status: string | null;
  payment_status?: string | null;
  payment_reference?: string | null;
  total: number | string | null;
  shipping_fee?: number | string | null;
  pricing_currency?: string | null;
  pricing_country?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address?: unknown;
  delivery_method?: string | null;
  tracking_number?: string | null;
  paid_at?: string | null;
  items: unknown;
  created_at: string;
};

export type AdminOrderEvent = {
  id: string;
  order_id: string;
  type: "customer_receipt_pending" | "admin_new_order";
  audience: "customer" | "admin";
  status: "pending" | "done" | "dismissed";
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AdminStoreData = {
  products: Product[];
  orders: AdminOrder[];
  orderEvents: AdminOrderEvent[];
  productError: string | null;
  orderError: string | null;
  orderEventError: string | null;
};

export type AdminDeliveryRatesData = {
  rates: DeliveryRate[];
  rateError: string | null;
};

export async function getAdminStoreData(): Promise<AdminStoreData> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;
  const supabase = token ? getAuthenticatedSupabaseServerClient(token) : null;

  if (!supabase) {
    return {
      products: [],
      orders: [],
      orderEvents: [],
      productError: "Supabase is not configured.",
      orderError: "Supabase is not configured.",
      orderEventError: "Supabase is not configured.",
    };
  }

  const [productResult, orderResult, orderEventResult] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id,user_id,status,payment_status,payment_reference,total,shipping_fee,pricing_currency,pricing_country,customer_name,customer_email,customer_phone,shipping_address,delivery_method,tracking_number,paid_at,items,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("order_events")
      .select("id,order_id,type,audience,status,payload,created_at,updated_at")
      .eq("audience", "admin")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    products: productResult.data ?? [],
    orders: orderResult.data ?? [],
    orderEvents: normalizeOrderEvents(orderEventResult.data),
    productError: productResult.error?.message ?? null,
    orderError: orderResult.error?.message ?? null,
    orderEventError: orderEventResult.error?.message ?? null,
  };
}

export async function getAdminDeliveryRatesData(): Promise<AdminDeliveryRatesData> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;
  const supabase = token ? getAuthenticatedSupabaseServerClient(token) : null;

  if (!supabase) {
    return {
      rates: [],
      rateError: "Supabase is not configured.",
    };
  }

  const { data, error } = await supabase
    .from("delivery_rates")
    .select("*")
    .order("country_name", { ascending: true })
    .order("state_name", { ascending: true });

  return {
    rates: data?.map(normalizeDeliveryRate) ?? [],
    rateError: error?.message ?? null,
  };
}

function normalizeOrderEvents(events: unknown): AdminOrderEvent[] {
  if (!Array.isArray(events)) {
    return [];
  }

  return events.map((event) => {
    const source = event as Record<string, unknown>;
    return {
      id: String(source.id ?? ""),
      order_id: String(source.order_id ?? ""),
      type: source.type === "customer_receipt_pending" ? "customer_receipt_pending" : "admin_new_order",
      audience: source.audience === "customer" ? "customer" : "admin",
      status: source.status === "done" || source.status === "dismissed" ? source.status : "pending",
      payload: isPlainObject(source.payload) ? source.payload : {},
      created_at: String(source.created_at ?? ""),
      updated_at: String(source.updated_at ?? ""),
    };
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getOrderTotal(order: AdminOrder) {
  return Number(order.total ?? 0);
}

export function getOrderItemCount(order: AdminOrder) {
  return Array.isArray(order.items)
    ? order.items.reduce((count, item) => {
        if (!item || typeof item !== "object") {
          return count;
        }

        const quantity = Number((item as Record<string, unknown>).quantity ?? 1);
        return count + (Number.isFinite(quantity) ? quantity : 1);
      }, 0)
    : 0;
}
