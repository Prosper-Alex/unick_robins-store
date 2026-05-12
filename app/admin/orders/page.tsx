import { AdminOrdersTable } from "@/components/admin/orders-table";
import { getAdminStoreData, getOrderTotal } from "@/src/lib/admin-data";
import { formatCurrency } from "@/src/utils/format";

export const metadata = {
  title: "Orders | Unick Robins Admin",
};

export default async function AdminOrdersPage() {
  const { orders, orderError } = await getAdminStoreData();
  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const pendingOrders = orders.filter((order) => order.status === "pending_payment");
  const revenue = paidOrders.reduce((total, order) => total + getOrderTotal(order), 0);

  return (
    <div className="grid gap-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-white shadow-xl shadow-black/20 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d6b25e]">Operations</p>
        <div className="mt-3 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(440px,0.9fr)] xl:items-end">
          <div>
            <h1 className="text-3xl font-semibold leading-[1.1] sm:text-4xl">Order management</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100/70">
              Track Paystack payment state, delivery details, fulfillment status, and tracking numbers.
            </p>
          </div>
          <div className="grid gap-3 text-center sm:grid-cols-3">
            <Metric label="Orders" value={`${orders.length}`} />
            <Metric label="Pending" value={`${pendingOrders.length}`} />
            <Metric label="Paid revenue" value={formatCurrency(revenue)} />
          </div>
        </div>
      </div>

      {orderError ? (
        <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-5 text-sm text-red-100">
          {orderError}
        </div>
      ) : (
        <AdminOrdersTable orders={orders} />
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#13091d]/70 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-violet-100/50">{label}</p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-[#f6e7b7]">{value}</p>
    </div>
  );
}
