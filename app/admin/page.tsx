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
      <div>
        <p className="text-sm font-semibold uppercase text-[#9a7734]">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold leading-[1.1] sm:text-4xl">Store overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Products" value={`${products.length}`} detail="Live catalog records" icon={Boxes} />
        <MetricCard label="Inventory value" value={formatCurrency(inventoryValue)} detail="Based on stock on hand" icon={DollarSign} />
        <MetricCard label="Orders" value={`${orders.length}`} detail={orderError ? "Orders unavailable" : "Real submitted orders"} icon={ShoppingCart} />
        <MetricCard label="In stock" value={`${inStockProducts}`} detail="Products ready to sell" icon={PackageCheck} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-stone-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Recent orders</h2>
              <p className="mt-1 text-sm text-stone-500">Revenue shown from actual submitted orders.</p>
            </div>
            <span className="text-2xl font-semibold">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="mt-6 grid gap-3">
            {orderError ? (
              <EmptyAdminState title="Orders are not available" detail={orderError} />
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3">
                  <div>
                    <p className="font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-stone-500">{order.status ?? "pending"}</p>
                  </div>
                  <span className="font-semibold">{formatCurrency(getOrderTotal(order))}</span>
                </div>
              ))
            ) : (
              <EmptyAdminState title="No orders yet" detail="Orders will appear here after customers check out." />
            )}
          </div>
        </Card>
        <Card className="border-stone-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Low stock watch</h2>
          <div className="mt-5 grid gap-3">
            {lowStock.length > 0 ? (
              lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-xl bg-stone-100 px-4 py-3">
                  <span className="font-medium">{product.title}</span>
                  <span className="text-sm text-stone-500">{product.stock} left</span>
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
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center">
      <p className="font-medium text-stone-900">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{detail}</p>
    </div>
  );
}
