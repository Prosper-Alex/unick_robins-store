import { getSupabaseAdminClient } from "@/src/lib/supabase-server";
import { toPaystackSubunit, verifyPaystackTransaction } from "@/src/lib/paystack";

type OrderForPayment = {
  id: string;
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
    .select("id,total,pricing_currency,payment_status,payment_reference")
    .eq("payment_reference", reference)
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Order not found.");
  }

  const payment = await verifyPaystackTransaction(reference);

  if (payment.status !== "success") {
    await supabase
      .from("orders")
      .update({
        status: "payment_failed",
        payment_status: payment.status,
      })
      .eq("id", (order as OrderForPayment).id);

    throw new Error(`Payment is ${payment.status}.`);
  }

  const expectedAmount = toPaystackSubunit(Number((order as OrderForPayment).total ?? 0));

  if (payment.amount !== expectedAmount) {
    await supabase
      .from("orders")
      .update({
        status: "payment_review",
        payment_status: "amount_mismatch",
      })
      .eq("id", (order as OrderForPayment).id);

    throw new Error("Payment amount does not match order total.");
  }

  const expectedCurrency = (order as OrderForPayment).pricing_currency;

  if (expectedCurrency && payment.currency !== expectedCurrency) {
    await supabase
      .from("orders")
      .update({
        status: "payment_review",
        payment_status: "currency_mismatch",
      })
      .eq("id", (order as OrderForPayment).id);

    throw new Error("Payment currency does not match order currency.");
  }

  const { data: confirmedOrderId, error: confirmError } = await supabase.rpc("confirm_paid_order", {
    target_reference: reference,
  });

  if (confirmError) {
    throw new Error(confirmError.message);
  }

  return String(confirmedOrderId ?? (order as OrderForPayment).id);
}
