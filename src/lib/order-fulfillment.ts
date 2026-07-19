import { getSupabaseAdminClient } from "@/src/lib/supabase-server";
import { toPaystackSubunit, verifyPaystackTransaction } from "@/src/lib/paystack";
import { getStripeClient, toStripeSubunit } from "@/src/lib/stripe";

type OrderForPayment = {
  id: string;
  status: string | null;
  total: number | string | null;
  pricing_currency: string | null;
  payment_status: string | null;
  payment_reference: string | null;
};

export async function confirmPaystackOrder(reference: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,status,total,pricing_currency,payment_status,payment_reference")
    .eq("payment_reference", reference)
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Order not found.");
  }

  const payment = await verifyPaystackTransaction(reference);
  const orderForPayment = order as OrderForPayment;

  if (payment.status !== "success") {
    await supabase
      .from("orders")
      .update({
        status: "payment_failed",
        payment_status: payment.status,
      })
      .eq("id", orderForPayment.id)
      .neq("status", "cancelled");

    throw new Error(`Payment is ${payment.status}.`);
  }

  if (orderForPayment.status === "cancelled" || orderForPayment.payment_status === "cancelled_by_customer") {
    await supabase
      .from("orders")
      .update({
        status: "payment_review",
        payment_status: "paid_after_customer_cancelled",
      })
      .eq("id", orderForPayment.id);

    throw new Error("Payment arrived after this order was cancelled. The order is in review.");
  }

  const expectedAmount = toPaystackSubunit(Number(orderForPayment.total ?? 0));

  if (payment.amount !== expectedAmount) {
    await supabase
      .from("orders")
      .update({
        status: "payment_review",
        payment_status: "amount_mismatch",
      })
      .eq("id", orderForPayment.id);

    throw new Error("Payment amount does not match order total.");
  }

  const expectedCurrency = orderForPayment.pricing_currency;

  if (expectedCurrency && payment.currency !== expectedCurrency) {
    await supabase
      .from("orders")
      .update({
        status: "payment_review",
        payment_status: "currency_mismatch",
      })
      .eq("id", orderForPayment.id);

    throw new Error("Payment currency does not match order currency.");
  }

  const { data: confirmedOrderId, error: confirmError } = await supabase.rpc("confirm_paid_order", {
    target_reference: reference,
  });

  if (confirmError) {
    throw new Error(confirmError.message);
  }

  return String(confirmedOrderId ?? orderForPayment.id);
}

export async function confirmStripeCheckoutSession(sessionId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const reference = session.client_reference_id ?? session.metadata?.reference;

  if (!reference) {
    throw new Error("Stripe session is missing the order reference.");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,status,total,pricing_currency,payment_status,payment_reference")
    .eq("payment_reference", reference)
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Order not found.");
  }

  const orderForPayment = order as OrderForPayment;

  if (session.payment_status !== "paid" || session.status !== "complete") {
    await supabase
      .from("orders")
      .update({
        status: "payment_failed",
        payment_status: session.payment_status,
      })
      .eq("id", orderForPayment.id)
      .neq("status", "cancelled");

    throw new Error(`Stripe payment is ${session.payment_status}.`);
  }

  if (orderForPayment.status === "cancelled" || orderForPayment.payment_status === "cancelled_by_customer") {
    await supabase
      .from("orders")
      .update({
        status: "payment_review",
        payment_status: "paid_after_customer_cancelled",
      })
      .eq("id", orderForPayment.id);

    throw new Error("Payment arrived after this order was cancelled. The order is in review.");
  }

  const expectedCurrency = orderForPayment.pricing_currency;
  const paidCurrency = session.currency?.toUpperCase();

  if (expectedCurrency && paidCurrency !== expectedCurrency) {
    await supabase
      .from("orders")
      .update({
        status: "payment_review",
        payment_status: "currency_mismatch",
      })
      .eq("id", orderForPayment.id);

    throw new Error("Payment currency does not match order currency.");
  }

  const expectedAmount = toStripeSubunit(
    Number(orderForPayment.total ?? 0),
    expectedCurrency ?? paidCurrency ?? "USD",
  );

  if (session.amount_total !== expectedAmount) {
    await supabase
      .from("orders")
      .update({
        status: "payment_review",
        payment_status: "amount_mismatch",
      })
      .eq("id", orderForPayment.id);

    throw new Error("Payment amount does not match order total.");
  }

  const { data: confirmedOrderId, error: confirmError } = await supabase.rpc("confirm_paid_order", {
    target_reference: reference,
  });

  if (confirmError) {
    throw new Error(confirmError.message);
  }

  return String(confirmedOrderId ?? orderForPayment.id);
}
