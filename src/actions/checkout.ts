"use server";

import { cookies } from "next/headers";
import { authCookieNames, getSupabaseServerClient } from "@/src/lib/supabase-server";
import type { CartItem } from "@/src/store/cart-store";

export async function createOrderAction(items: CartItem[], total: number) {
  const supabase = getSupabaseServerClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let userId = null;

  // If user is logged in, attach their ID to the order
  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      userId = user.id;
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending", // move from draft to pending once checkout is submitted
      total,
      items,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}
