import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { confirmStripeCheckoutSession } from "@/src/lib/order-fulfillment";
import { getStripeClient, getStripeConfig } from "@/src/lib/stripe";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const { webhookSecret } = getStripeConfig();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 401 });
  }

  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await confirmStripeCheckoutSession(session.id);
    } catch (error) {
      return NextResponse.json(
        { received: true, error: error instanceof Error ? error.message : "Unable to confirm order" },
        { status: 202 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
