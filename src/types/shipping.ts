import type { ShippingRate } from "@/src/utils/pricing";

export type DeliveryRate = ShippingRate & {
  id: string;
  state_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export type DeliveryRateInput = {
  country_code: string;
  country_name: string;
  state_name?: string | null;
  standard_fee: number;
  express_fee: number;
  currency: "NGN" | "USD";
  is_active: boolean;
};
