import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Circle, ReceiptText, XCircle } from "lucide-react";
import { OrderActions } from "@/components/account/order-actions";
import { AccountShell } from "@/components/account/account-shell";
import { OrderStatus } from "@/components/account/order-list";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { Button } from "@/components/ui/button";
import { getAccountOrder } from "@/src/lib/account-server";
import { formatCurrency, formatDate } from "@/src/utils/format";
import { formatOrderId, isPendingPaymentOrder } from "@/src/utils/orders";

export const metadata = {
  title: "Order Details | Unick Robins",
};

export default async function OrderDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;
  const { order } = await getAccountOrder(id);

  if (!order) {
    notFound();
  }
  const currency = order.pricing_currency;
  const displayOrderId = formatOrderId(order.id);
  const canManagePendingPayment = isPendingPaymentOrder(order.status, order.payment_status);

  return (
    <AccountShell>
      {payment === "success" && <ClearCartOnSuccess />}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Button asChild variant="link" className="mb-6 h-auto px-0 account-btn-link">
          <Link href="/account/orders">
            <ArrowLeft className="size-4" />
            Back to orders
          </Link>
        </Button>

        <section className="rounded-3xl border border-stone-200 bg-white p-5 text-[#24102f] sm:p-7">
          <div className="flex flex-col gap-5 border-b border-stone-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-[#fff8df] text-[#7b5a18]">
                <ReceiptText className="size-5" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] account-text-gold">
                Receipt
              </p>
              <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight">
                {displayOrderId}
              </h1>
              <p className="mt-2 text-sm text-stone-500">{formatDate(order.created_at)}</p>
            </div>
            <div className="grid gap-2 text-left sm:text-right">
              <OrderStatus status={order.status} />
              <p className="text-2xl font-medium account-text-ink">{formatCurrency(order.total, currency)}</p>
            </div>
          </div>

          <div className="grid gap-5 border-b border-stone-100 py-6 lg:grid-cols-[1fr_1.1fr]">
            <OrderActions
              orderId={order.id}
              displayId={displayOrderId}
              canManagePendingPayment={canManagePendingPayment}
            />
            <OrderTimeline
              status={order.status}
              paymentStatus={order.payment_status}
              paidAt={order.paid_at}
              createdAt={order.created_at}
            />
          </div>

          <div className="grid gap-4 py-6">
            {order.items.length === 0 ? (
              <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">
                This order has no item details attached.
              </p>
            ) : (
              order.items.map((item, index) => (
                <div
                  key={`${item.id ?? "item"}-${index}`}
                  className="grid gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-4 sm:grid-cols-[64px_1fr_auto] sm:items-center"
                >
                  <div className="relative size-16 overflow-hidden rounded-xl bg-white">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title ?? "Product"}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium account-text-ink">{item.title ?? "Product"}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      Qty {item.quantity ?? 1} · {formatCurrency(item.price ?? 0, currency)} each
                    </p>
                  </div>
                  <p className="font-medium account-text-ink">
                    {formatCurrency((item.price ?? 0) * (item.quantity ?? 1), currency)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-5 border-t border-stone-100 pt-5 lg:grid-cols-2">
            <div className="rounded-2xl bg-stone-50 p-4">
              <h2 className="font-medium">Delivery details</h2>
              <div className="mt-3 grid gap-1 text-sm leading-6 text-stone-600">
                <p>{order.customer_name ?? "Customer"}</p>
                {order.customer_phone && <p>{order.customer_phone}</p>}
                {order.customer_email && <p>{order.customer_email}</p>}
                {order.shipping_address ? (
                  <p>
                    {[
                      order.shipping_address.address,
                      order.shipping_address.city,
                      order.shipping_address.state,
                      order.shipping_address.country,
                      order.shipping_address.postalCode,
                    ].filter(Boolean).join(", ")}
                  </p>
                ) : null}
                {order.delivery_method && <p className="capitalize">Delivery: {order.delivery_method}</p>}
                {order.tracking_number && <p>Tracking: {order.tracking_number}</p>}
              </div>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <h2 className="font-medium">Payment</h2>
              <div className="mt-3 grid gap-2 text-sm text-stone-600">
                <div className="flex justify-between gap-4">
                  <span>Status</span>
                  <span className="capitalize">{order.payment_status.replaceAll("_", " ")}</span>
                </div>
                {order.payment_reference && (
                  <div className="flex justify-between gap-4">
                    <span>Reference</span>
                    <span className="break-all text-right font-mono text-xs">{order.payment_reference}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span>Shipping</span>
                  <span>{order.shipping_fee > 0 ? formatCurrency(order.shipping_fee, currency) : "Free"}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-stone-200 pt-3 text-lg font-medium account-text-ink">
                  <span>Total</span>
                  <span>{formatCurrency(order.total, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AccountShell>
  );
}

function OrderTimeline({
  status,
  paymentStatus,
  paidAt,
  createdAt,
}: {
  status: string;
  paymentStatus: string;
  paidAt: string | null;
  createdAt: string;
}) {
  const cancelled = status === "cancelled";
  const failed = status === "payment_failed";
  const paid = paymentStatus === "paid" || ["paid", "processing", "shipped", "delivered", "completed"].includes(status);
  const processing = ["processing", "shipped", "delivered", "completed"].includes(status);
  const shipped = ["shipped", "delivered", "completed"].includes(status);
  const delivered = ["delivered", "completed"].includes(status);

  const steps = cancelled
    ? [
        { label: "Order created", detail: formatDate(createdAt), state: "done" },
        { label: "Payment pending", detail: "No confirmed payment attached", state: "current" },
        { label: "Cancelled", detail: "This unpaid order was closed", state: "problem" },
      ]
    : failed
      ? [
          { label: "Order created", detail: formatDate(createdAt), state: "done" },
          { label: "Payment failed", detail: "Payment was not completed", state: "problem" },
        ]
      : [
          { label: "Order created", detail: formatDate(createdAt), state: "done" },
          {
            label: paid ? "Payment confirmed" : "Payment pending",
            detail: paidAt ? formatDate(paidAt) : "Complete payment to continue",
            state: paid ? "done" : "current",
          },
          {
            label: "Processing",
            detail: "Preparing your order",
            state: processing ? "done" : paid ? "current" : "upcoming",
          },
          {
            label: "Shipped",
            detail: "Tracking appears here when available",
            state: shipped ? "done" : "upcoming",
          },
          {
            label: "Delivered",
            detail: "Order completed",
            state: delivered ? "done" : "upcoming",
          },
        ];

  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <h2 className="font-medium">Order timeline</h2>
      <ol className="mt-4 grid gap-4 sm:flex sm:gap-0">
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1;
          const connectorTone =
            step.state === "done" && steps[index + 1]?.state === "done"
              ? "after:bg-emerald-600"
              : step.state === "done" && steps[index + 1]?.state === "problem"
                ? "after:bg-red-500"
                : step.state === "done" && steps[index + 1]?.state === "current"
                  ? "after:bg-[var(--account-gold)]"
                  : "after:bg-stone-200";

          return (
            <li
              key={step.label}
              className={`relative grid grid-cols-[1.75rem_1fr] gap-3 sm:flex sm:flex-1 sm:flex-col sm:items-center sm:gap-2 sm:px-2 sm:text-center ${
                isLastStep
                  ? ""
                  : `sm:after:absolute sm:after:left-[calc(50%+0.875rem)] sm:after:right-[calc(-50%+0.875rem)] sm:after:top-[0.875rem] sm:after:h-0.5 sm:after:content-[''] ${connectorTone}`
              }`}
            >
              <span
                className={
                  step.state === "done"
                    ? "relative z-10 mt-0.5 flex size-7 items-center justify-center rounded-full bg-emerald-600 text-white"
                    : step.state === "problem"
                      ? "relative z-10 mt-0.5 flex size-7 items-center justify-center rounded-full bg-red-600 text-white"
                      : step.state === "current"
                        ? "relative z-10 mt-0.5 flex size-7 items-center justify-center rounded-full bg-[var(--account-gold)] account-text-ink"
                        : "relative z-10 mt-0.5 flex size-7 items-center justify-center rounded-full bg-white text-stone-400 ring-1 ring-stone-200"
                }>
                {step.state === "done" ? (
                  <Check className="size-4" />
                ) : step.state === "problem" ? (
                  <XCircle className="size-4" />
                ) : (
                  <Circle className="size-3 fill-current" />
                )}
              </span>
              <span>
                <span className="block text-sm font-medium account-text-ink">{step.label}</span>
                <span className="mt-0.5 block text-sm leading-5 text-stone-500">{step.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
