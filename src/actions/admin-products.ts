"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authCookieNames, getAuthenticatedSupabaseServerClient } from "@/src/lib/supabase-server";
import { PRODUCT_CACHE_TAG } from "@/src/services/products";
import type { Product, ProductInput } from "@/src/types/product";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;
  const supabase = token ? getAuthenticatedSupabaseServerClient(token) : null;

  if (!supabase || !token) {
    throw new Error("Unauthorized");
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return { supabase, user };
}

async function logAudit(
  supabase: SupabaseClient,
  adminId: string,
  action: string,
  entity: string,
  entityId: string | null,
  details: Record<string, unknown> | null = null,
) {
  await supabase.from("audit_logs").insert({
    admin_id: adminId,
    action,
    entity,
    entity_id: entityId,
    details,
  });
}

function getLegacyProductInput(input: ProductInput) {
  const legacyInput = { ...input };
  delete legacyInput.base_currency;
  delete legacyInput.price_ngn;
  delete legacyInput.price_usd;

  return legacyInput;
}

function isMissingPricingColumnError(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }

  return (
    error.code === "PGRST204" &&
    (error.message?.includes("'base_currency'") ||
      error.message?.includes("'price_ngn'") ||
      error.message?.includes("'price_usd'"))
  );
}

export async function createProductAction(input: ProductInput): Promise<Product> {
  const { supabase, user } = await verifyAdmin();

  let { data, error } = await supabase.from("products").insert(input).select("*").single();

  if (isMissingPricingColumnError(error)) {
    const result = await supabase.from("products").insert(getLegacyProductInput(input)).select("*").single();
    data = result.data;
    error = result.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(supabase, user.id, "create", "product", data.id, { title: input.title });
  revalidateTag(PRODUCT_CACHE_TAG, "max");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  
  return data as Product;
}

export async function updateProductAction(id: string, input: ProductInput): Promise<Product> {
  const { supabase, user } = await verifyAdmin();

  let { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (isMissingPricingColumnError(error)) {
    const result = await supabase
      .from("products")
      .update(getLegacyProductInput(input))
      .eq("id", id)
      .select("*")
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(supabase, user.id, "update", "product", id, { title: input.title });
  revalidateTag(PRODUCT_CACHE_TAG, "max");
  revalidatePath("/admin/products");
  revalidatePath("/products");

  return data as Product;
}

export async function deleteProductAction(id: string): Promise<void> {
  const { supabase, user } = await verifyAdmin();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(supabase, user.id, "delete", "product", id);
  revalidateTag(PRODUCT_CACHE_TAG, "max");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function uploadProductImageAction(formData: FormData): Promise<string> {
  const { supabase, user } = await verifyAdmin();

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `products/${crypto.randomUUID()}.${extension}`;
  
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(supabase, user.id, "upload", "image", path);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
