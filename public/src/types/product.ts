export type Product = {
  id: string;
  title: string;
  description: string;
  short_description?: string | null;
  price: number;
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
  image: string;
  gallery?: string[];
  category: string;
  stock: number;
  hydration_level?: number;
  transfer_ready?: boolean;
  complimentary_shipping?: boolean;
  rating?: number;
  review_count?: number;
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
