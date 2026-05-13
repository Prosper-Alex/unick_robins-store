import { cookies } from "next/headers";
import { authCookieNames, getAuthenticatedSupabaseServerClient } from "@/src/lib/supabase-server";
import type { Product } from "@/src/types/product";

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

export type AdminStoreData = {
  products: Product[];
  orders: AdminOrder[];
  productError: string | null;
  orderError: string | null;
};

export async function getAdminStoreData(): Promise<AdminStoreData> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;
  const supabase = token ? getAuthenticatedSupabaseServerClient(token) : null;

  if (!supabase) {
    return {
      products: [],
      orders: [],
      productError: "Supabase is not configured.",
      orderError: "Supabase is not configured.",
    };
  }

  const [productResult, orderResult] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id,user_id,status,payment_status,payment_reference,total,shipping_fee,pricing_currency,pricing_country,customer_name,customer_email,customer_phone,shipping_address,delivery_method,tracking_number,paid_at,items,created_at")
      .order("created_at", { ascending: false }),
  ]);

  return {
    products: productResult.data ?? [],
    orders: orderResult.data ?? [],
    productError: productResult.error?.message ?? null,
    orderError: orderResult.error?.message ?? null,
  };
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
