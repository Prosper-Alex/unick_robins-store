"use server";

import { cookies } from "next/headers";
import {
  createPaystackCheckout,
  getAccessTokenFromCookieStore,
  type CheckoutDetails,
} from "@/src/lib/checkout-payment";
import type { CartItem } from "@/src/store/cart-store";

export async function createOrderAction(items: CartItem[], details: CheckoutDetails) {
  const cookieStore = await cookies();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return createPaystackCheckout({
    items,
    details,
    accessToken: getAccessTokenFromCookieStore(cookieStore),
    origin,
  });
}
