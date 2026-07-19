"use server";

import { cookies } from "next/headers";
import {
  createCheckoutPayment,
  getAccessTokenFromCookieStore,
  type CheckoutDetails,
} from "@/src/lib/checkout-payment";
import type { CartItem } from "@/src/store/cart-store";

export async function createOrderAction(items: CartItem[], details: CheckoutDetails, paymentProvider?: string) {
  const cookieStore = await cookies();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return createCheckoutPayment({
    items,
    details,
    paymentProvider,
    accessToken: getAccessTokenFromCookieStore(cookieStore),
    origin,
  });
}
