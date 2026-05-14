"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/src/utils/format";
import type { StoreCurrency } from "@/src/utils/pricing";

export function OdometerValue({
  value,
  currency,
  className,
}: {
  value: number;
  currency?: StoreCurrency;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 650;
    const startedAt = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className={className}>
      {formatCurrency(displayValue, currency)}
    </span>
  );
}
