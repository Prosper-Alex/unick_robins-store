import { NextResponse } from "next/server";
import { confirmPaystackOrder } from "@/src/lib/order-fulfillment";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") ?? url.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(new URL("/checkout/cancel?reason=missing_reference", url.origin));
  }

  try {
    const orderId = await confirmPaystackOrder(reference);
    return NextResponse.redirect(new URL(`/checkout/success?order=${orderId}`, url.origin));
  } catch (error) {
    const message = error instanceof Error ? error.message : "verification_failed";
    return NextResponse.redirect(new URL(`/checkout/cancel?reason=${encodeURIComponent(message)}`, url.origin));
  }
}
