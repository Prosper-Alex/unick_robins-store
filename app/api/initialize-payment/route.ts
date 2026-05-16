import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createPaystackCheckout,
  getAccessTokenFromCookieStore,
  type CheckoutDetails,
} from "@/src/lib/checkout-payment";
import type { CartItem } from "@/src/store/cart-store";

type InitializePaymentRequest = {
  items?: CartItem[];
  details?: CheckoutDetails;
};

export async function POST(request: Request) {
  let payload: InitializePaymentRequest;

  try {
    payload = (await request.json()) as InitializePaymentRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload.details || !Array.isArray(payload.items)) {
    return NextResponse.json({ error: "Checkout details and cart items are required." }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const result = await createPaystackCheckout({
      items: payload.items,
      details: payload.details,
      accessToken: getAccessTokenFromCookieStore(cookieStore),
      origin,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to initialize payment." },
      { status: 400 },
    );
  }
}
