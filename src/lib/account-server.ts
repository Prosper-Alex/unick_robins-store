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
  total: number;
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
    .select("id,user_id,status,total,items,created_at")
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
    .select("id,user_id,status,total,items,created_at")
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
  total: number | string | null;
  items: unknown;
  created_at: string;
}): AccountOrder {
  return {
    id: order.id,
    user_id: order.user_id,
    status: order.status ?? "pending",
    total: Number(order.total ?? 0),
    items: normalizeItems(order.items),
    created_at: order.created_at,
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
