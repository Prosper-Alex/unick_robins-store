"use server";

import { revalidatePath } from "next/cache";
import { initializePaystackTransaction } from "@/src/lib/paystack";
import { getAccountContext } from "@/src/lib/account-server";

const cancellablePaymentStatuses = ["unpaid", "pending", "abandoned"];

export async function cancelPendingPaymentAction(orderId: string) {
  const { supabase, user } = await getAccountContext();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,status,payment_status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (orderError || !order) {
    throw new Error("We could not find this order.");
  }

  if (order.status !== "pending_payment" || !cancellablePaymentStatuses.includes(order.payment_status ?? "")) {
    throw new Error("This order can no longer be cancelled from your account.");
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      payment_status: "cancelled_by_customer",
    })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .eq("status", "pending_payment")
    .in("payment_status", cancellablePaymentStatuses);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);

  return {
    message: "Pending payment cancelled. No confirmed payment was attached to this order.",
  };
}

export async function resumePendingPaymentAction(orderId: string) {
  const { supabase, user } = await getAccountContext();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,status,payment_status,total,pricing_currency,customer_email,customer_name")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (orderError || !order) {
    throw new Error("We could not find this order.");
  }

  if (order.status !== "pending_payment" || !cancellablePaymentStatuses.includes(order.payment_status ?? "")) {
    throw new Error("This order is not waiting for payment anymore.");
  }

  if (!order.customer_email) {
    throw new Error("This order is missing a customer email.");
  }

  const reference = `UR-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const origin = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

  const initialized = await initializePaystackTransaction({
    email: order.customer_email,
    amount: Number(order.total ?? 0),
    currency: order.pricing_currency ?? undefined,
    reference,
    callbackUrl: `${origin}/api/verify-payment`,
    metadata: {
      order_id: order.id,
      customer_name: order.customer_name ?? "Customer",
      resumed_payment: true,
    },
  });

  const { error } = await supabase
    .from("orders")
    .update({
      payment_provider: "paystack",
      payment_reference: reference,
      payment_status: "unpaid",
    })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .eq("status", "pending_payment")
    .in("payment_status", cancellablePaymentStatuses);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/account/orders/${orderId}`);

  return {
    authorizationUrl: initialized.authorization_url,
    reference,
  };
}
