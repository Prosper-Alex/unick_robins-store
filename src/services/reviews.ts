import { getSupabaseBrowserClient } from "@/src/lib/supabase";
import type { ProductReview } from "@/src/types/review";

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id,product_id,user_id,title,rating,body,verified_purchase,status,created_at")
    .eq("product_id", productId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}
