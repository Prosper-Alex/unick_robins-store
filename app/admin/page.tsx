import { Boxes, DollarSign, PackageCheck, ShoppingCart } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { Card } from "@/components/ui/card";
import { getAdminStoreData, getOrderTotal } from "@/src/lib/admin-data";
import { formatCurrency } from "@/src/utils/format";

export default async function AdminOverviewPage() {
  const { products, orders, orderError } = await getAdminStoreData();
  const inventoryValue = products.reduce((total, product) => total + product.price * product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= 20);
  const totalRevenue = orders.reduce((total, order) => total + getOrderTotal(order), 0);
  const inStockProducts = products.filter((product) => product.stock > 0).length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="grid gap-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d6b25e]">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold leading-[1.1] text-white sm:text-4xl">Store overview</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100/70">
          Live operating view for catalog health, sales movement, and stock pressure.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Products" value={`${products.length}`} detail="Live catalog records" icon={Boxes} />
        <MetricCard label="Inventory value" value={formatCurrency(inventoryValue)} detail="Based on stock on hand" icon={DollarSign} />
        <MetricCard label="Orders" value={`${orders.length}`} detail={orderError ? "Orders unavailable" : "Real submitted orders"} icon={ShoppingCart} />
        <MetricCard label="In stock" value={`${inStockProducts}`} detail="Products ready to sell" icon={PackageCheck} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-white/10 bg-white/[0.08] p-6 text-white shadow-xl shadow-black/20 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Recent orders</h2>
              <p className="mt-1 text-sm text-violet-100/60">Revenue shown from actual submitted orders.</p>
            </div>
            <span className="font-mono text-2xl font-semibold text-[#f6e7b7]">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="mt-6 grid gap-3">
            {orderError ? (
              <EmptyAdminState title="Orders are not available" detail={orderError} />
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1a0824]/65 px-4 py-3">
                  <div>
                    <p className="font-mono font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-violet-100/55">{order.status ?? "pending"}</p>
                  </div>
                  <span className="font-mono font-semibold">{formatCurrency(getOrderTotal(order))}</span>
                </div>
              ))
            ) : (
              <EmptyAdminState title="No orders yet" detail="Orders will appear here after customers check out." />
            )}
          </div>
        </Card>
        <Card className="border-white/10 bg-white/[0.08] p-6 text-white shadow-xl shadow-black/20 backdrop-blur">
          <h2 className="text-xl font-semibold">Low stock watch</h2>
          <div className="mt-5 grid gap-3">
            {lowStock.length > 0 ? (
              lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-xl bg-[#24102f] px-4 py-3 ring-1 ring-white/10">
                  <span className="font-medium">{product.title}</span>
                  <span className="font-mono text-sm text-[#f6e7b7]">{product.stock} left</span>
                </div>
              ))
            ) : (
              <EmptyAdminState title="No low-stock products" detail="Products with 20 units or fewer will show here." />
            )}
          </div>
        </Card>
      </div>
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
