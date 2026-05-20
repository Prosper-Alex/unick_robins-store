import Link from "next/link";
import {
  Bell,
  Boxes,
  DollarSign,
  PackageCheck,
  ShoppingCart,
} from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getAdminStoreData,
  getOrderTotal,
  type AdminOrderEvent,
} from "@/src/lib/admin-data";
import { formatCurrency, formatDate } from "@/src/utils/format";

export default async function AdminOverviewPage() {
  const { products, orders, orderEvents, orderError, orderEventError } =
    await getAdminStoreData();
  const inventoryValue = products.reduce(
    (total, product) => total + product.price * product.stock,
    0,
  );
  const lowStock = products.filter((product) => product.stock <= 20);
  const totalRevenue = orders.reduce(
    (total, order) => total + getOrderTotal(order),
    0,
  );
  const inStockProducts = products.filter(
    (product) => product.stock > 0,
  ).length;
  const recentOrders = orders.slice(0, 5);
  const pendingAdminNotifications = orderEvents.filter(
    (event) => event.type === "admin_new_order",
  );
  const orderLookup = new Map(orders.map((order) => [order.id, order]));

  return (
    <div className="grid gap-8">
      <div className="rounded-2xl border border-white/10 bg-white/6 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d6b25e]">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-[1.1] text-white sm:text-4xl">
          Store overview
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100/70">
          Live operating view for catalog health, sales movement, and stock
          pressure.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Products"
          value={`${products.length}`}
          detail="Live catalog records"
          icon={Boxes}
        />
        <MetricCard
          label="Inventory value"
          value={formatCurrency(inventoryValue)}
          detail="Based on stock on hand"
          icon={DollarSign}
        />
        <MetricCard
          label="Orders"
          value={`${orders.length}`}
          detail={orderError ? "Orders unavailable" : "Real submitted orders"}
          icon={ShoppingCart}
        />
        <MetricCard
          label="In stock"
          value={`${inStockProducts}`}
          detail="Products ready to sell"
          icon={PackageCheck}
        />
      </div>
      <Card className="border-white/10 bg-white/8 p-6 text-white shadow-xl shadow-black/20 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="size-5 text-[#d6b25e]" />
              <h2 className="text-xl font-semibold">Admin notifications</h2>
            </div>
            <p className="mt-1 text-sm text-violet-100/60">
              New paid orders that need manual fulfillment.
            </p>
          </div>
          <span className="w-fit rounded-full bg-[#d6b25e]/15 px-3 py-1 text-sm font-medium text-[#f6e7b7]">
            {pendingAdminNotifications.length} pending
          </span>
        </div>
        <div className="mt-5 grid gap-3">
          {orderEventError ? (
            <EmptyAdminState
              title="Notifications are not available"
              detail={orderEventError}
            />
          ) : pendingAdminNotifications.length > 0 ? (
            pendingAdminNotifications.map((event) => (
              <AdminNotification
                key={event.id}
                event={event}
                orderStatus={orderLookup.get(event.order_id)?.status}
              />
            ))
          ) : (
            <EmptyAdminState
              title="No pending admin notifications"
              detail="Paid orders will appear here after Paystack confirms payment."
            />
          )}
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-white/10 bg-white/8 p-6 text-white shadow-xl shadow-black/20 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Recent orders</h2>
              <p className="mt-1 text-sm text-violet-100/60">
                Revenue shown from actual submitted orders.
              </p>
            </div>
            <span className="font-mono text-2xl font-semibold text-[#f6e7b7]">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="mt-6 grid gap-3">
            {orderError ? (
              <EmptyAdminState
                title="Orders are not available"
                detail={orderError}
              />
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1a0824]/65 px-4 py-3">
                  <div>
                    <p className="font-mono font-medium">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-violet-100/55">
                      {order.status ?? "pending"}
                    </p>
                  </div>
                  <span className="font-mono font-semibold">
                    {formatCurrency(getOrderTotal(order))}
                  </span>
                </div>
              ))
            ) : (
              <EmptyAdminState
                title="No orders yet"
                detail="Orders will appear here after customers check out."
              />
            )}
          </div>
        </Card>
        <Card className="border-white/10 bg-white/8 p-6 text-white shadow-xl shadow-black/20 backdrop-blur">
          <h2 className="text-xl font-semibold">Low stock watch</h2>
          <div className="mt-5 grid gap-3">
            {lowStock.length > 0 ? (
              lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl bg-[#24102f] px-4 py-3 ring-1 ring-white/10">
                  <span className="font-medium">{product.title}</span>
                  <span className="font-mono text-sm text-[#f6e7b7]">
                    {product.stock} left
                  </span>
                </div>
              ))
            ) : (
              <EmptyAdminState
                title="No low-stock products"
                detail="Products with 20 units or fewer will show here."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AdminNotification({
  event,
  orderStatus,
}: {
  event: AdminOrderEvent;
  orderStatus?: string | null;
}) {
  const total = Number(event.payload.total ?? 0);
  const currency =
    typeof event.payload.currency === "string"
      ? event.payload.currency
      : undefined;
  const customerName =
    typeof event.payload.customer_name === "string" &&
    event.payload.customer_name.length > 0
      ? event.payload.customer_name
      : "Customer";
  const customerEmail =
    typeof event.payload.customer_email === "string"
      ? event.payload.customer_email
      : null;
  const deliveryMethod =
    typeof event.payload.delivery_method === "string"
      ? event.payload.delivery_method
      : null;

  return (
    <div className="grid gap-4 rounded-xl border border-white/10 bg-[#1a0824]/65 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">New paid order</p>
          <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-200">
            {orderStatus?.replaceAll("_", " ") ?? "paid"}
          </span>
        </div>
        <p className="mt-1 text-sm text-violet-100/65">
          {customerName}
          {customerEmail ? ` · ${customerEmail}` : ""} ·{" "}
          {formatCurrency(total, currency)}
        </p>
        <p className="mt-1 text-xs text-violet-100/45">
          {deliveryMethod ? `${deliveryMethod} delivery · ` : ""}
          {formatDate(event.created_at)}
        </p>
      </div>
      <Button
        asChild
        className="rounded-full bg-[#d6b25e] text-[#24102f] hover:bg-[#f6e7b7]">
        <Link href="/admin/orders">Fulfill order</Link>
      </Button>
    </div>
  );
}

function EmptyAdminState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-[#1a0824]/60 px-4 py-6 text-center">
      <p className="font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-violet-100/55">{detail}</p>
    </div>
  );
}
