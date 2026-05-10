import type { Product } from "@/src/types/product";

export function getProductSummary(product: Product) {
  return product.short_description?.trim() || product.description;
}

export function getProductGallery(product: Product) {
  const gallery = product.gallery?.filter(Boolean) ?? [];
  return [product.image, ...gallery.filter((image) => image !== product.image)].slice(0, 4);
}

export function getHydrationLevel(product: Product) {
  return product.hydration_level ?? 4;
}

export function getRating(product: Product) {
  return product.rating ?? 4.8;
}

export function getReviewCount(product: Product) {
  return product.review_count ?? 124;
}

export function isTransferReady(product: Product) {
  return product.transfer_ready ?? true;
}

export function hasComplimentaryShipping(product: Product) {
  return product.complimentary_shipping ?? product.price >= 40;
}

export function getIngredients(product: Product) {
  return product.ingredients?.length
    ? product.ingredients
    : ["Botanical oils", "Amino shine complex", "Soft-touch conditioning esters"];
}

export function getBenefits(product: Product) {
  return product.benefits?.length
    ? product.benefits
    : ["Builds visible polish", "Softens without weight", "Supports a refined daily ritual"];
}

export function getUsageInstructions(product: Product) {
  return product.usage_instructions?.length
    ? product.usage_instructions
    : ["Apply to clean or refreshed hair.", "Work through mids, ends, or targeted areas.", "Layer as needed for extra finish."];
}

export function getHairCompatibility(product: Product) {
  return product.hair_compatibility?.length
    ? product.hair_compatibility
    : ["Curls", "Coils", "Waves", "Silk press", "Protective styles"];
}
