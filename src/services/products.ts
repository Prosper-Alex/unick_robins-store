import { mockProducts } from "@/src/data/products";
import { unstable_cache } from "next/cache";
import { getSupabaseBrowserClient } from "@/src/lib/supabase";
import { getSupabaseServerClient } from "@/src/lib/supabase-server";
import type { Product, ProductInput } from "@/src/types/product";

const TABLE = "products";
const IMAGE_BUCKET = "product-images";
export const PRODUCT_CACHE_TAG = "products";

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return mockProducts;
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return mockProducts;
    }

    return data as Product[];
  },
  ["public-products"],
  { revalidate: 300, tags: [PRODUCT_CACHE_TAG] },
);

export const getProductById = unstable_cache(
  async (id: string): Promise<Product | null> => {
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return mockProducts.find((product) => product.id === id) ?? null;
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return mockProducts.find((product) => product.id === id) ?? null;
    }

    return data as Product;
  },
  ["public-product"],
  { revalidate: 300, tags: [PRODUCT_CACHE_TAG] },
);

export async function createProduct(input: ProductInput) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase.from(TABLE).insert(input).select("*").single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function updateProduct(id: string, input: ProductInput) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function deleteProduct(id: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function uploadProductImage(file: File) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `products/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
