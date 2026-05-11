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
    <Card className="border-white/10 bg-white/[0.08] p-5 text-white shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-violet-100/65">{label}</p>
          <p className="mt-2 font-mono text-2xl font-medium leading-[1.1] tracking-tight text-white">{value}</p>
          <p className="mt-2 text-sm text-violet-100/60">{detail}</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#d6b25e]/15 text-[#f6e7b7] ring-1 ring-[#d6b25e]/25">
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}
