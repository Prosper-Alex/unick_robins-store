import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { authCookieNames } from "@/src/lib/supabase-server";

export type AccountOrderItem = {
  id?: string;
  title?: string;
  price?: number;
  quantity?: number;
  image?: string;
};

export type AccountOrder = {
  id: string;
  user_id: string | null;
  status: string;
  payment_status: string;
  payment_reference: string | null;
  total: number;
  shipping_fee: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  } | null;
  delivery_method: string | null;
  tracking_number: string | null;
  paid_at: string | null;
  items: AccountOrderItem[];
  created_at: string;
};

type AccountContext = {
  supabase: SupabaseClient;
  user: User;
  role: string;
};

export async function getAccountContext(): Promise<AccountContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;

  if (!token) {
    redirect("/account/login");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    redirect("/account/login");
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    redirect("/account/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user, role: profile?.role ?? "customer" };
}

export async function getAccountOrders(limit?: number) {
  const { supabase, user, role } = await getAccountContext();
  let query = supabase
    .from("orders")
    .select("id,user_id,status,payment_status,payment_reference,total,shipping_fee,customer_name,customer_email,customer_phone,shipping_address,delivery_method,tracking_number,paid_at,items,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { user, role, orders: [] as AccountOrder[] };
  }

  return {
    user,
    role,
    orders: data.map(normalizeOrder),
  };
}

export async function getAccountOrder(id: string) {
  const { supabase, user, role } = await getAccountContext();
  const { data, error } = await supabase
    .from("orders")
    .select("id,user_id,status,payment_status,payment_reference,total,shipping_fee,customer_name,customer_email,customer_phone,shipping_address,delivery_method,tracking_number,paid_at,items,created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return { user, role, order: null };
  }

  return { user, role, order: normalizeOrder(data) };
}

function normalizeOrder(order: {
  id: string;
  user_id: string | null;
  status: string | null;
  payment_status?: string | null;
  payment_reference?: string | null;
  total: number | string | null;
  shipping_fee?: number | string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address?: unknown;
  delivery_method?: string | null;
  tracking_number?: string | null;
  paid_at?: string | null;
  items: unknown;
  created_at: string;
}): AccountOrder {
  return {
    id: order.id,
    user_id: order.user_id,
    status: order.status ?? "pending",
    payment_status: order.payment_status ?? "unpaid",
    payment_reference: order.payment_reference ?? null,
    total: Number(order.total ?? 0),
    shipping_fee: Number(order.shipping_fee ?? 0),
    customer_name: order.customer_name ?? null,
    customer_email: order.customer_email ?? null,
    customer_phone: order.customer_phone ?? null,
    shipping_address: normalizeAddress(order.shipping_address),
    delivery_method: order.delivery_method ?? null,
    tracking_number: order.tracking_number ?? null,
    paid_at: order.paid_at ?? null,
    items: normalizeItems(order.items),
    created_at: order.created_at,
  };
}

function normalizeAddress(address: unknown): AccountOrder["shipping_address"] {
  if (!address || typeof address !== "object") {
    return null;
  }

  const source = address as Record<string, unknown>;
  return {
    address: typeof source.address === "string" ? source.address : undefined,
    city: typeof source.city === "string" ? source.city : undefined,
    state: typeof source.state === "string" ? source.state : undefined,
    country: typeof source.country === "string" ? source.country : undefined,
    postalCode: typeof source.postalCode === "string" ? source.postalCode : undefined,
  };
}

function normalizeItems(items: unknown): AccountOrderItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    if (!item || typeof item !== "object") {
      return {};
    }

    const source = item as Record<string, unknown>;
    return {
      id: typeof source.id === "string" ? source.id : undefined,
      title: typeof source.title === "string" ? source.title : "Product",
      price: Number(source.price ?? 0),
      quantity: Number(source.quantity ?? 1),
      image: typeof source.image === "string" ? source.image : undefined,
    };
  });
}
