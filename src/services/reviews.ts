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

  if (isMissingReviewColumnError(error)) {
    const { data: legacyData, error: legacyError } = await supabase
      .from("reviews")
      .select("id,product_id,user_id,rating,body,created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (legacyError || !legacyData) {
      return [];
    }

    return legacyData.map((review) => ({
      ...review,
      title: null,
      verified_purchase: false,
      status: "published",
    }));
  }

  if (error || !data) {
    return [];
  }

  return data;
}

function isMissingReviewColumnError(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }

  return (
    error.code === "PGRST204" &&
    (error.message?.includes("'status'") ||
      error.message?.includes("'title'") ||
      error.message?.includes("'verified_purchase'"))
  );
}
