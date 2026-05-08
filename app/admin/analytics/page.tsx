import { BarChart3, Eye, MousePointerClick, ShoppingBag } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { Card } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  return (
    <div className="grid gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9a7734]">Analytics</p>
        <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight sm:text-4xl">Performance insights</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Visitors" value="18.4k" detail="Demo traffic metric" icon={Eye} />
        <MetricCard label="Add to carts" value="1,284" detail="Across collection" icon={ShoppingBag} />
        <MetricCard label="Click rate" value="12.7%" detail="Hero to product grid" icon={MousePointerClick} />
        <MetricCard label="Revenue" value="$42k" detail="Demo month revenue" icon={BarChart3} />
      </div>
      <Card className="border-stone-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Channel mix</h2>
        <div className="mt-6 grid gap-4">
          {[
            ["Organic search", "42%"],
            ["Instagram", "31%"],
            ["Email", "18%"],
            ["Direct", "9%"],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex justify-between text-sm">
                <span>{label}</span>
                <span className="font-medium">{value}</span>
              </div>
              <div className="h-3 rounded-full bg-stone-100">
                <div className="h-3 rounded-full bg-stone-950" style={{ width: value }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
