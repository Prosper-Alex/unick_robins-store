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

  if (!supabase || !adminSupabase || !token) {
    throw new Error("Sign in to leave a review.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    throw new Error("Sign in to leave a review.");
  }

  const verifiedPurchase = await hasVerifiedPurchase(user.id, parsed.data.productId);
  const { error } = await adminSupabase.from("reviews").upsert({
    product_id: parsed.data.productId,
    user_id: user.id,
    title: parsed.data.title || null,
    rating: parsed.data.rating,
    body: parsed.data.body,
    verified_purchase: verifiedPurchase,
    status: "published",
  }, {
    onConflict: "product_id,user_id",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/products/${parsed.data.productId}`);
  revalidatePath("/products");
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
