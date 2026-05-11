"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { authCookieNames, getAuthenticatedSupabaseServerClient } from "@/src/lib/supabase-server";

const reviewSchema = z.object({
  productId: z.uuid(),
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

  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.productId,
    user_id: user.id,
    rating: parsed.data.rating,
    body: parsed.data.body,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/products/${parsed.data.productId}`);
  revalidatePath("/products");
}
