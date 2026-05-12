"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, PackageCheck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/src/actions/admin-orders";
import type { AdminOrder } from "@/src/lib/admin-data";
import { formatCurrency, formatDate } from "@/src/utils/format";

const statuses = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "payment_failed",
];

export function AdminOrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function saveOrder(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    const trackingNumber = String(formData.get("trackingNumber") ?? "");

    setPendingId(id);
    setMessage(null);
    startTransition(async () => {
      try {
        await updateOrderStatusAction({ id, status, trackingNumber });
        setMessage("Order updated.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to update order.");
      } finally {
        setPendingId(null);
      }
    });
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.06] px-5 py-10 text-center text-white">
        <PackageCheck className="mx-auto size-10 text-[#d6b25e]" />
        <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
        <p className="mt-2 text-sm text-violet-100/60">Paid and pending Paystack orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {message && (
        <p className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm text-violet-50">
          {message}
        </p>
      )}
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          disabled={isPending && pendingId === order.id}
          onSave={saveOrder}
        />
      ))}
    </div>
  );
}

function OrderRow({
  order,
  disabled,
  onSave,
}: {
  order: AdminOrder;
  disabled: boolean;
  onSave: (formData: FormData) => void;
}) {
  const address = useMemo(() => normalizeAddress(order.shipping_address), [order.shipping_address]);
  const itemCount = Array.isArray(order.items)
    ? order.items.reduce((count, item) => {
        if (!item || typeof item !== "object") return count;
        return count + Number((item as Record<string, unknown>).quantity ?? 1);
      }, 0)
    : 0;

  return (
    <form action={onSave} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-white shadow-xl shadow-black/20 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center">
      <input type="hidden" name="id" value={order.id} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-sm font-semibold">#{order.id.slice(0, 8)}</p>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusTone(order.status ?? "pending")}`}>
            {(order.status ?? "pending").replaceAll("_", " ")}
          </span>
          <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-xs text-violet-100/70">
            {order.payment_status ?? "unpaid"}
          </span>
        </div>
        <p className="mt-2 text-sm text-violet-100/70">
          {formatDate(order.created_at)} · {itemCount} item{itemCount === 1 ? "" : "s"} · {formatCurrency(Number(order.total ?? 0))}
        </p>
        <p className="mt-1 truncate text-sm text-violet-100/60">
          {order.customer_name ?? "Customer"} {order.customer_email ? `· ${order.customer_email}` : ""}
        </p>
        {address && <p className="mt-1 text-sm text-violet-100/55">{address}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-violet-100/65">Status</span>
          <select
            name="status"
            defaultValue={order.status ?? "pending_payment"}
            className="h-11 rounded-xl border border-white/10 bg-[#13091d] px-3 text-white outline-none focus:border-[#d6b25e]"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-violet-100/65">Tracking</span>
          <input
            name="trackingNumber"
            defaultValue={order.tracking_number ?? ""}
            placeholder="Optional"
            className="h-11 rounded-xl border border-white/10 bg-[#13091d] px-3 text-white outline-none placeholder:text-violet-100/35 focus:border-[#d6b25e]"
          />
        </label>
      </div>
      <Button type="submit" disabled={disabled} className="rounded-full bg-[#d6b25e] text-[#24102f] hover:bg-[#f6e7b7]">
        {disabled ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save
      </Button>
    </form>
  );
}

function normalizeAddress(address: unknown) {
  if (!address || typeof address !== "object") {
    return null;
  }

  const source = address as Record<string, unknown>;
  return [source.address, source.city, source.state, source.country, source.postalCode]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(", ");
}

function statusTone(status: string) {
  if (["paid", "processing", "shipped", "delivered"].includes(status)) {
    return "bg-emerald-400/15 text-emerald-200";
  }

  if (["cancelled", "refunded", "payment_failed"].includes(status)) {
    return "bg-red-400/15 text-red-200";
  }

  return "bg-[#d6b25e]/15 text-[#f6e7b7]";
}
