export type Product = {
  id: string;
  title: string;
  description: string;
  short_description?: string | null;
  price: number;
  base_currency?: "NGN" | "USD" | null;
  price_ngn?: number | null;
  price_usd?: number | null;
  display_currency?: "NGN" | "USD" | null;
  image: string;
  gallery?: string[] | null;
  category: string;
  stock: number;
  hydration_level?: number | null;
  transfer_ready?: boolean | null;
  complimentary_shipping?: boolean | null;
  rating?: number | null;
  review_count?: number | null;
  ingredients?: string[] | null;
  benefits?: string[] | null;
  usage_instructions?: string[] | null;
  hair_compatibility?: string[] | null;
  created_at: string;
};

export type ProductInput = {
  title: string;
  description: string;
  short_description?: string;
  price: number;
  base_currency?: "NGN" | "USD";
  price_ngn?: number;
  price_usd?: number;
  image: string;
  gallery?: string[];
  category: string;
  stock: number;
  hydration_level?: number;
  transfer_ready?: boolean;
  complimentary_shipping?: boolean;
  ingredients?: string[];
  benefits?: string[];
  usage_instructions?: string[];
  hair_compatibility?: string[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};
