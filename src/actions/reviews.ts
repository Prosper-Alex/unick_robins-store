"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { authCookieNames, getAuthenticatedSupabaseServerClient, getSupabaseAdminClient } from "@/src/lib/supabase-server";

const reviewSchema = z.object({
  productId: z.uuid(),
  title: z.string().trim().max(80, "Keep review titles under 80 characters.").optional(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(8, "Write at least 8 characters.").max(600, "Keep reviews under 600 characters."),
});

export async function createReviewAction(input: z.input<typeof reviewSchema>) {
  const parsed = reviewSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("Add a rating and a short review.");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;
  const supabase = token ? getAuthenticatedSupabaseServerClient(token) : null;
  const adminSupabase = getSupabaseAdminClient();

  if (!supabase || !token) {
    throw new Error("Sign in to leave a review.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    throw new Error("Sign in to leave a review.");
  }

  const verifiedPurchase = adminSupabase
    ? await hasVerifiedPurchase(user.id, parsed.data.productId)
    : false;
  const reviewPayload = {
    product_id: parsed.data.productId,
    user_id: user.id,
    title: parsed.data.title || null,
    rating: parsed.data.rating,
    body: parsed.data.body,
    status: "published",
    ...(adminSupabase ? { verified_purchase: verifiedPurchase } : {}),
  };
  const reviewClient = adminSupabase ?? supabase;
  const saved = await saveReviewWithoutConflictTarget(
    reviewClient,
    user.id,
    parsed.data.productId,
    reviewPayload,
  );

  if (isMissingReviewColumnError(saved.error)) {
    const legacyPayload = {
      product_id: parsed.data.productId,
      user_id: user.id,
      rating: parsed.data.rating,
      body: parsed.data.body,
    };
    const { error: legacyError } = await saveReviewWithoutConflictTarget(
      supabase,
      user.id,
      parsed.data.productId,
      legacyPayload,
    );

    if (legacyError) {
      throw new Error(legacyError.message);
    }
  } else if (saved.error) {
    throw new Error(saved.error.message);
  }

  revalidatePath(`/products/${parsed.data.productId}`);
  revalidatePath("/products");
}

async function saveReviewWithoutConflictTarget(
  supabase: ReturnType<typeof getAuthenticatedSupabaseServerClient>,
  userId: string,
  productId: string,
  payload: Record<string, unknown>,
) {
  if (!supabase) {
    return { error: new Error("Sign in to leave a review.") };
  }

  const existing = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.error && existing.error.code !== "PGRST116") {
    return { error: existing.error };
  }

  if (existing.data?.id) {
    return supabase
      .from("reviews")
      .update(payload)
      .eq("id", existing.data.id);
  }

  const inserted = await supabase.from("reviews").insert(payload);

  if (isDuplicateReviewError(inserted.error)) {
    return updateExistingReview(supabase, userId, productId, payload);
  }

  return inserted;
}

async function updateExistingReview(
  supabase: ReturnType<typeof getAuthenticatedSupabaseServerClient>,
  userId: string,
  productId: string,
  payload: Record<string, unknown>,
) {
  if (!supabase) {
    return { error: new Error("Sign in to leave a review.") };
  }

  return supabase
    .from("reviews")
    .update(payload)
    .eq("product_id", productId)
    .eq("user_id", userId)
    .select("id")
    .single();
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

function isDuplicateReviewError(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }

  return (
    error.code === "23505" ||
    error.message?.includes('duplicate key value violates unique constraint "reviews_product_user_key"')
  );
}

async function hasVerifiedPurchase(userId: string, productId: string) {
  const adminSupabase = getSupabaseAdminClient();

  if (!adminSupabase) {
    return false;
  }

  const { data, error } = await adminSupabase
    .from("orders")
    .select("items")
    .eq("user_id", userId)
    .eq("payment_status", "paid");

  if (error || !data) {
    return false;
  }

  return data.some((order) => {
    if (!Array.isArray(order.items)) {
      return false;
    }

    return order.items.some((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }

      return (item as Record<string, unknown>).id === productId;
    });
  });
}
