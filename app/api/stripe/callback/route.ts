import { NextResponse } from "next/server";
import { confirmStripeCheckoutSession } from "@/src/lib/order-fulfillment";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/checkout/cancel?reason=missing_stripe_session", url.origin));
  }

  try {
    const orderId = await confirmStripeCheckoutSession(sessionId);
    return NextResponse.redirect(new URL(`/account/orders/${orderId}?payment=success`, url.origin));
  } catch (error) {
    const message = error instanceof Error ? error.message : "stripe_verification_failed";
    return NextResponse.redirect(new URL(`/checkout/cancel?reason=${encodeURIComponent(message)}`, url.origin));
  }
}
