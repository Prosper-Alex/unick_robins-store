import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccountOrder } from "@/src/lib/account-server";
import { formatCurrency, formatDate } from "@/src/utils/format";

export function OrderList({
  orders,
  compact = false,
}: {
  orders: AccountOrder[];
  compact?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-5 py-8 text-center">
        <Package className="mx-auto size-8 text-[#9a7734]" />
        <h3 className="mt-3 text-lg font-medium">No transactions yet</h3>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Orders you place while signed in will appear here.
        </p>
        <Button asChild className="mt-5 rounded-full">
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-[#d6b25e]/60 hover:shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-[#24102f]">Order #{order.id.slice(0, 8)}</p>
              <OrderStatus status={order.status} />
            </div>
            <p className="mt-1 text-sm text-stone-500">
              {formatDate(order.created_at)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p className="font-medium text-[#24102f]">{formatCurrency(order.total)}</p>
            {!compact && <ArrowRight className="size-4 text-[#9a7734]" />}
          </div>
        </Link>
      ))}
    </div>
  );
}

export function OrderStatus({ status }: { status: string }) {
  const label = status.replaceAll("_", " ");
  const paidStates = ["paid", "processing", "shipped", "delivered", "completed"];
  const problemStates = ["cancelled", "refunded", "payment_failed", "amount_mismatch"];
  const tone =
    paidStates.includes(status)
      ? "bg-emerald-50 text-emerald-700"
      : problemStates.includes(status)
        ? "bg-red-50 text-red-700"
        : "bg-[#fff8df] text-[#7b5a18]";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${tone}`}>
      {label}
    </span>
  );
}
