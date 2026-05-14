import { mockProducts } from "@/src/data/products";
import { getSupabaseBrowserClient } from "@/src/lib/supabase";
import type { Product, ProductInput } from "@/src/types/product";

const TABLE = "products";
const IMAGE_BUCKET = "product-images";

type ProductReviewStatRow = {
  product_id: string | null;
  rating: number | string | null;
};

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient();

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

  return withReviewStats(data as Product[]);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseBrowserClient();

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

  const [product] = await withReviewStats([data as Product]);
  return product;
}

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

async function withReviewStats(products: Product[]) {
  if (products.length === 0) {
    return products;
  }

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return products;
  }

  const productIds = products.map((product) => product.id);
  const reviewResult = await supabase
    .from("reviews")
    .select("product_id,rating,status")
    .in("product_id", productIds)
    .eq("status", "published");
  let data: ProductReviewStatRow[] | null = reviewResult.data;
  let error = reviewResult.error;

  if (isMissingReviewStatusError(error)) {
    const legacyResult = await supabase
      .from("reviews")
      .select("product_id,rating")
      .in("product_id", productIds);
    data = legacyResult.data as ProductReviewStatRow[] | null;
    error = legacyResult.error;
  }

  if (error || !data) {
    return products;
  }

  const stats = new Map<string, { total: number; count: number }>();

  for (const review of data) {
    const productId = typeof review.product_id === "string" ? review.product_id : null;
    const rating = Number(review.rating);

    if (!productId || !Number.isFinite(rating)) {
      continue;
    }

    const current = stats.get(productId) ?? { total: 0, count: 0 };
    current.total += rating;
    current.count += 1;
    stats.set(productId, current);
  }

  return products.map((product) => {
    const productStats = stats.get(product.id);

    if (!productStats) {
      return product;
    }

    return {
      ...product,
      rating: Number((productStats.total / productStats.count).toFixed(1)),
      review_count: productStats.count,
    };
  });
}

function isMissingReviewStatusError(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }

  return error.code === "PGRST204" && error.message?.includes("'status'");
}
