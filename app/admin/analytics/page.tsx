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
      <div>
        <p className="text-sm font-semibold uppercase text-[#9a7734]">Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold leading-[1.1] sm:text-4xl">Performance insights</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Revenue" value={formatCurrency(revenue)} detail={orderError ? "Orders unavailable" : "From real orders"} icon={BarChart3} />
        <MetricCard label="Orders" value={`${orders.length}`} detail="Submitted checkout records" icon={ShoppingBag} />
        <MetricCard label="Units sold" value={`${unitsSold}`} detail="Calculated from order items" icon={Boxes} />
        <MetricCard label="Out of stock" value={`${outOfStock}`} detail="Products needing attention" icon={PackageX} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-stone-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Category mix</h2>
          <div className="mt-6 grid gap-4">
            {categoryCounts.length > 0 ? (
              categoryCounts.map(({ label, count }) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-stone-100">
                    <div className="h-3 rounded-full bg-stone-950" style={{ width: `${(count / maxCategoryCount) * 100}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyAnalyticsState title="No categories yet" detail="Add products to build a category breakdown." />
            )}
          </div>
        </Card>
        <Card className="border-stone-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Order quality</h2>
          <div className="mt-6 grid gap-4">
            <InsightRow label="Average order" value={formatCurrency(averageOrder)} />
            <InsightRow label="Products listed" value={`${products.length}`} />
            <InsightRow label="Inventory units" value={`${products.reduce((total, product) => total + product.stock, 0)}`} />
          </div>
          {orderError && <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{orderError}</p>}
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
    <div className="flex items-center justify-between rounded-xl bg-stone-100 px-4 py-3">
      <span className="text-sm text-stone-600">{label}</span>
      <span className="font-semibold text-stone-950">{value}</span>
    </div>
  );
}

function EmptyAnalyticsState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center">
      <p className="font-medium text-stone-900">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{detail}</p>
    </div>
  );
}
