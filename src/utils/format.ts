import type { StoreCurrency } from "@/src/utils/pricing";

export function formatCurrency(value: number, currency?: StoreCurrency | string | null) {
  const resolvedCurrency = currency ?? process.env.NEXT_PUBLIC_STORE_CURRENCY ?? process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY ?? "NGN";

  return new Intl.NumberFormat(resolvedCurrency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency: resolvedCurrency,
    maximumFractionDigits: resolvedCurrency === "NGN" ? 0 : 2,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function maskEmail(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const [localPart, domain] = value.split("@");

  if (!localPart || !domain) {
    return value;
  }

  const visiblePrefix = localPart.slice(0, Math.min(4, localPart.length));
  return `${visiblePrefix}***@${domain}`;
}
