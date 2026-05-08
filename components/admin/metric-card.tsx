import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">{label}</p>
          <p className="mt-2 text-2xl font-medium leading-[1.1] tracking-tight text-stone-950">{value}</p>
          <p className="mt-2 text-sm text-stone-500">{detail}</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#f7f1e8] text-[#9a7734]">
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}
