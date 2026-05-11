import { BarChart3, Boxes, PackageX, ShoppingBag } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { Card } from "@/components/ui/card";
import { getAdminStoreData, getOrderItemCount, getOrderTotal } from "@/src/lib/admin-data";
import { formatCurrency } from "@/src/utils/format";

export default async function AdminAnalyticsPage() {
  const { products, orders, orderError } = await getAdminStoreData();
  const revenue = orders.reduce((total, order) => total + getOrderTotal(order), 0);
  const unitsSold = orders.reduce((total, order) => total + getOrderItemCount(order), 0);
  const averageOrder = orders.length > 0 ? revenue / orders.length : 0;
  const outOfStock = products.filter((product) => product.stock === 0).length;
  const categoryCounts = getCategoryCounts(products);
  const maxCategoryCount = Math.max(...categoryCounts.map((item) => item.count), 1);

  return (
    <div className="grid gap-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d6b25e]">Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold leading-[1.1] text-white sm:text-4xl">Performance insights</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100/70">
          Snapshot of revenue quality, catalog spread, and stock exposure.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Revenue" value={formatCurrency(revenue)} detail={orderError ? "Orders unavailable" : "From real orders"} icon={BarChart3} />
        <MetricCard label="Orders" value={`${orders.length}`} detail="Submitted checkout records" icon={ShoppingBag} />
        <MetricCard label="Units sold" value={`${unitsSold}`} detail="Calculated from order items" icon={Boxes} />
        <MetricCard label="Out of stock" value={`${outOfStock}`} detail="Products needing attention" icon={PackageX} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-white/10 bg-white/[0.08] p-6 text-white shadow-xl shadow-black/20 backdrop-blur">
          <h2 className="text-xl font-semibold">Category mix</h2>
          <div className="mt-6 grid gap-4">
            {categoryCounts.length > 0 ? (
              categoryCounts.map(({ label, count }) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm text-violet-100/75">
                    <span>{label}</span>
                    <span className="font-mono font-medium text-white">{count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#24102f] ring-1 ring-white/10">
                    <div className="h-3 rounded-full bg-[#d6b25e]" style={{ width: `${(count / maxCategoryCount) * 100}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyAnalyticsState title="No categories yet" detail="Add products to build a category breakdown." />
            )}
          </div>
        </Card>
        <Card className="border-white/10 bg-white/[0.08] p-6 text-white shadow-xl shadow-black/20 backdrop-blur">
          <h2 className="text-xl font-semibold">Order quality</h2>
          <div className="mt-6 grid gap-4">
            <InsightRow label="Average order" value={formatCurrency(averageOrder)} />
            <InsightRow label="Products listed" value={`${products.length}`} />
            <InsightRow label="Inventory units" value={`${products.reduce((total, product) => total + product.stock, 0)}`} />
          </div>
          {orderError && <p className="mt-5 rounded-xl bg-[#d6b25e]/15 px-4 py-3 text-sm text-[#f6e7b7] ring-1 ring-[#d6b25e]/25">{orderError}</p>}
        </Card>
      </div>
    </div>
  );
}

function getCategoryCounts(products: Array<{ category: string }>) {
  const counts = new Map<string, number>();

  for (const product of products) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }

  return Array.from(counts, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#24102f] px-4 py-3 ring-1 ring-white/10">
      <span className="text-sm text-violet-100/65">{label}</span>
      <span className="font-mono font-semibold text-white">{value}</span>
    </div>
  );
}

function EmptyAnalyticsState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-[#1a0824]/60 px-4 py-6 text-center">
      <p className="font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-violet-100/55">{detail}</p>
    </div>
  );
}
