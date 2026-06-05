import type { Product } from "@/src/types/product";

export type StoreCurrency = "NGN" | "USD";
export type ShippingRate = {
  id?: string;
  country_code: string;
  country_name: string;
  state_name?: string | null;
  standard_fee: number;
  express_fee: number;
  currency: StoreCurrency;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string | null;
};

const DEFAULT_NGN_PER_USD = 1600;
const EXPRESS_SURCHARGE_NGN = 5000;
const EXPRESS_SURCHARGE_USD = 10;
const DEFAULT_NIGERIA_SHIPPING_FEE_NGN = 8000;
const DEFAULT_INTERNATIONAL_SHIPPING_FEE_USD = 25;

export const nigeriaShippingStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

const NIGERIA_STATE_SHIPPING_FEES_NGN: Record<string, number> = {
  abia: 7000,
  adamawa: 9000,
  "akwa ibom": 7500,
  anambra: 6500,
  bauchi: 8500,
  bayelsa: 7500,
  benue: 7500,
  borno: 10000,
  "cross river": 8000,
  delta: 6500,
  ebonyi: 7000,
  edo: 6000,
  ekiti: 5500,
  enugu: 7000,
  fct: 5000,
  gombe: 8500,
  imo: 7000,
  jigawa: 9000,
  kaduna: 7500,
  kano: 8500,
  katsina: 9000,
  kebbi: 9000,
  kogi: 6500,
  kwara: 5500,
  lagos: 3000,
  nasarawa: 6000,
  niger: 6500,
  ogun: 3500,
  ondo: 5500,
  osun: 5000,
  oyo: 4500,
  plateau: 8000,
  rivers: 7000,
  sokoto: 9500,
  taraba: 9000,
  yobe: 9500,
  zamfara: 9500,
};

const COUNTRY_SHIPPING_FEES_USD: Record<string, number> = {
  canada: 30,
  ghana: 18,
  kenya: 22,
  "south africa": 24,
  "united kingdom": 28,
  uk: 28,
  "united states": 30,
  usa: 30,
};

export const fallbackShippingRates: ShippingRate[] = [
  ...Object.entries(NIGERIA_STATE_SHIPPING_FEES_NGN).map(([state, fee]) => ({
    country_code: "NG",
    country_name: "Nigeria",
    state_name: toTitleCaseState(state),
    standard_fee: fee,
    express_fee: fee + EXPRESS_SURCHARGE_NGN,
    currency: "NGN" as const,
    is_active: true,
  })),
  ...Object.entries(COUNTRY_SHIPPING_FEES_USD).map(([country, fee]) => ({
    country_code: toCountryCode(country),
    country_name: toTitleCaseCountry(country),
    state_name: null,
    standard_fee: fee,
    express_fee: fee + EXPRESS_SURCHARGE_USD,
    currency: "USD" as const,
    is_active: true,
  })),
];

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

export function getShippingFee(
  currency: StoreCurrency,
  deliveryMethod: string,
  location?: { country?: string | null; state?: string | null },
  rates: ShippingRate[] = fallbackShippingRates,
) {
  const rate = findShippingRate(location, rates);

  if (rate) {
    const fee =
      deliveryMethod === "express" ? rate.express_fee : rate.standard_fee;
    return convertShippingFee(fee, normalizeCurrency(rate.currency), currency);
  }

  const standardFee = getLocationShippingFee(currency, location);

  if (deliveryMethod !== "express") {
    return standardFee;
  }

  return standardFee + (currency === "NGN" ? EXPRESS_SURCHARGE_NGN : EXPRESS_SURCHARGE_USD);
}

function getLocationShippingFee(
  currency: StoreCurrency,
  location?: { country?: string | null; state?: string | null },
) {
  const country = normalizeLocationKey(location?.country);
  const state = normalizeLocationKey(location?.state);
  const isNigeria = !country || country === "ng" || country.includes("nigeria");

  if (isNigeria) {
    const fee = state ? NIGERIA_STATE_SHIPPING_FEES_NGN[state] : null;
    const ngnFee = fee ?? DEFAULT_NIGERIA_SHIPPING_FEE_NGN;
    return currency === "NGN" ? ngnFee : roundMoney(ngnFee / getNgnPerUsd());
  }

  const usdFee = COUNTRY_SHIPPING_FEES_USD[country] ?? DEFAULT_INTERNATIONAL_SHIPPING_FEE_USD;
  return currency === "USD" ? usdFee : Math.round(usdFee * getNgnPerUsd());
}

function normalizeLocationKey(value?: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

function findShippingRate(
  location?: { country?: string | null; state?: string | null },
  rates: ShippingRate[] = fallbackShippingRates,
) {
  const country = normalizeLocationKey(location?.country);
  const state = normalizeLocationKey(location?.state);
  const activeRates = rates.filter((rate) => rate.is_active !== false);

  const countryMatches = activeRates.filter((rate) => {
    const rateCountryCode = normalizeLocationKey(rate.country_code);
    const rateCountryName = normalizeLocationKey(rate.country_name);

    if (!country) {
      return rateCountryCode === "ng" || rateCountryName === "nigeria";
    }

    return (
      country === rateCountryCode ||
      country === rateCountryName ||
      country.includes(rateCountryName) ||
      rateCountryName.includes(country)
    );
  });

  if (state) {
    const stateMatch = countryMatches.find(
      (rate) => normalizeLocationKey(rate.state_name) === state,
    );

    if (stateMatch) {
      return stateMatch;
    }
  }

  return (
    countryMatches.find((rate) => !normalizeLocationKey(rate.state_name)) ??
    null
  );
}

function convertShippingFee(
  amount: number,
  fromCurrency: StoreCurrency,
  toCurrency: StoreCurrency,
) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  return toCurrency === "NGN"
    ? Math.round(amount * getNgnPerUsd())
    : roundMoney(amount / getNgnPerUsd());
}

function toTitleCaseState(value: string) {
  if (value === "fct") {
    return "FCT";
  }

  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toTitleCaseCountry(value: string) {
  if (value === "uk") {
    return "United Kingdom";
  }

  if (value === "usa") {
    return "United States";
  }

  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toCountryCode(value: string) {
  const normalized = normalizeLocationKey(value);

  if (normalized === "ghana") return "GH";
  if (normalized === "kenya") return "KE";
  if (normalized === "south africa") return "ZA";
  if (normalized === "united kingdom" || normalized === "uk") return "GB";
  if (normalized === "united states" || normalized === "usa") return "US";
  if (normalized === "canada") return "CA";

  return normalized.slice(0, 2).toUpperCase();
}

function toPositiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
