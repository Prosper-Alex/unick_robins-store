import type { Product } from "@/src/types/product";

export type StoreCurrency = "NGN" | "USD";

const DEFAULT_NGN_PER_USD = 1600;

export function getNgnPerUsd() {
  const configuredRate = Number(process.env.NEXT_PUBLIC_NGN_PER_USD);
  return Number.isFinite(configuredRate) && configuredRate > 0
    ? configuredRate
    : DEFAULT_NGN_PER_USD;
}

export function normalizeCurrency(value?: string | null): StoreCurrency {
  return value === "USD" ? "USD" : "NGN";
}

export function getDisplayCurrencyForCountry(country?: string | null): StoreCurrency {
  const normalized = country?.trim().toLowerCase();

  if (!normalized) {
    return "USD";
  }

  return normalized === "ng" || normalized.includes("nigeria") ? "NGN" : "USD";
}

export function getCountryFromHeaders(headersList: Pick<Headers, "get">) {
  return (
    headersList.get("x-vercel-ip-country") ||
    headersList.get("cf-ipcountry") ||
    headersList.get("x-country-code") ||
    null
  );
}

export function getClientCountryFallback() {
  if (typeof navigator !== "undefined") {
    const locale = navigator.language || navigator.languages?.[0] || "";
    if (locale.toLowerCase().endsWith("-ng")) {
      return "NG";
    }
  }

  if (typeof Intl !== "undefined") {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone === "Africa/Lagos") {
      return "NG";
    }
  }

  return null;
}

export function getProductPrice(product: Product, currency: StoreCurrency) {
  const ngnPerUsd = getNgnPerUsd();
  const baseCurrency = normalizeCurrency(product.base_currency);
  const basePrice = Number(product.price ?? 0);
  const ngnPrice = toPositiveNumber(product.price_ngn);
  const usdPrice = toPositiveNumber(product.price_usd);

  if (currency === "NGN") {
    if (ngnPrice !== null) {
      return ngnPrice;
    }

    if (usdPrice !== null) {
      return Math.round(usdPrice * ngnPerUsd);
    }

    return baseCurrency === "USD" ? Math.round(basePrice * ngnPerUsd) : basePrice;
  }

  if (usdPrice !== null) {
    return usdPrice;
  }

  if (ngnPrice !== null) {
    return roundMoney(ngnPrice / ngnPerUsd);
  }

  return baseCurrency === "NGN" ? roundMoney(basePrice / ngnPerUsd) : basePrice;
}

export function localizeProduct(product: Product, currency: StoreCurrency): Product {
  return {
    ...product,
    price: getProductPrice(product, currency),
    display_currency: currency,
  };
}

export function getShippingFee(currency: StoreCurrency, deliveryMethod: string) {
  if (deliveryMethod !== "express") {
    return 0;
  }

  return currency === "NGN" ? 15000 : 15;
}

function toPositiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
