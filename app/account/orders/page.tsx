import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { OrderList, OrderStatus } from "@/components/account/order-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccountOrders } from "@/src/lib/account-server";
import { formatCurrency, formatDate } from "@/src/utils/format";
import { formatOrderId, normalizeOrderDisplayId } from "@/src/utils/orders";

export const metadata = {
  title: "Order History | Unick Robins",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  const { orders } = await getAccountOrders();
  const trackingQuery = normalizeOrderDisplayId(track ?? "");
  const trackedOrder = trackingQuery
    ? orders.find((order) => normalizeOrderDisplayId(formatOrderId(order.id)) === trackingQuery)
    : null;

  return (
    <AccountShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Button asChild variant="link" className="mb-6 h-auto px-0 account-btn-link">
          <Link href="/account/dashboard">
            <ArrowLeft className="size-4" />
            Back to account
          </Link>
        </Button>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9a7734]">
            Transactions
          </p>
          <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-4xl">
            Order history
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">
            View each order tied to your signed-in account.
          </p>
        </div>

        <section className="mb-6 rounded-2xl border border-white/10 bg-white/95 p-4 text-[#24102f] shadow-xl shadow-black/10 sm:p-5">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="grid gap-2">
              <label htmlFor="track-order" className="text-sm font-medium">
                Track order by ID
              </label>
              <Input
                id="track-order"
                name="track"
                defaultValue={track ?? ""}
                placeholder="UR-AE60-9DA662"
                className="h-11 rounded-xl bg-white font-mono uppercase"
              />
            </div>
            <Button
              type="submit"
              className="h-11 rounded-full px-5 account-btn-primary account-btn-lift hover:shadow-xl hover:shadow-purple-950/20">
              <Search className="size-4" />
              Track status
            </Button>
          </form>

          {trackingQuery && trackedOrder && (
            <div className="mt-4 grid gap-3 rounded-xl border account-border-gold account-bg-gold-soft p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-sm font-semibold">{formatOrderId(trackedOrder.id)}</p>
                  <OrderStatus status={trackedOrder.status} />
                </div>
                <p className="mt-2 text-sm account-text-gold-muted">
                  Placed {formatDate(trackedOrder.created_at)} · {formatCurrency(trackedOrder.total, trackedOrder.pricing_currency)}
                </p>
                {trackedOrder.tracking_number && (
                  <p className="mt-1 text-sm account-text-gold-muted">Tracking number: {trackedOrder.tracking_number}</p>
                )}
              </div>
              <Button asChild variant="outline" className="rounded-full account-btn-outline hover:shadow-sm">
                <Link href={`/account/orders/${trackedOrder.id}`}>Open order</Link>
              </Button>
            </div>
          )}

          {trackingQuery && !trackedOrder && (
            <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              No order with ID {trackingQuery} was found in your signed-in account.
            </p>
          )}
        </section>

        <OrderList orders={orders} />
      </div>
    </AccountShell>
  );
}
