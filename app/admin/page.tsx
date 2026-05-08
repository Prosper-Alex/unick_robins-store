import { Boxes, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { Card } from "@/components/ui/card";
import { getProducts } from "@/src/services/products";
import { formatCurrency } from "@/src/utils/format";

export default async function AdminOverviewPage() {
  const products = await getProducts();
  const inventoryValue = products.reduce((total, product) => total + product.price * product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= 20);

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9a7734]">Dashboard</p>
        <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight sm:text-4xl">Store overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Products" value={`${products.length}`} detail="Active catalog items" icon={Boxes} />
        <MetricCard label="Inventory value" value={formatCurrency(inventoryValue)} detail="Based on stock on hand" icon={DollarSign} />
        <MetricCard label="Orders" value="128" detail="Demo month activity" icon={ShoppingCart} />
        <MetricCard label="Conversion" value="4.8%" detail="+0.9% from last month" icon={TrendingUp} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-stone-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Recent performance</h2>
          <div className="mt-6 flex h-72 items-end gap-3">
            {[38, 52, 44, 68, 57, 86, 73, 92].map((height, index) => (
              <div key={index} className="flex flex-1 items-end rounded-t-xl bg-[#f7f1e8]">
                <div
                  className="w-full rounded-t-xl bg-stone-950 transition-all"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </Card>
        <Card className="border-stone-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Low stock watch</h2>
          <div className="mt-5 grid gap-3">
            {lowStock.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl bg-stone-100 px-4 py-3">
                <span className="font-medium">{product.title}</span>
                <span className="text-sm text-stone-500">{product.stock} left</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
