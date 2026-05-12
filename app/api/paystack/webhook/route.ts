import { NextResponse } from "next/server";
import { confirmPaystackOrder } from "@/src/lib/order-fulfillment";
import { verifyPaystackSignature } from "@/src/lib/paystack";

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaystackWebhookEvent;

  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      await confirmPaystackOrder(event.data.reference);
    } catch (error) {
      return NextResponse.json(
        { received: true, error: error instanceof Error ? error.message : "Unable to confirm order" },
        { status: 202 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
