import type { Product } from "@/src/types/product";

type ProductDetailSection = {
  title: string;
  items: string[];
};

const apparelCategoryMatchers = [
  "apparel",
  "accessory",
  "accessories",
  "cap",
  "caps",
  "durag",
  "durags",
  "hair net",
  "hair bands",
  "hoodie",
  "hoodies",
];

export function getProductSummary(product: Product) {
  return (
    product.short_description?.trim() || getDynamicProductDescription(product)
  );
}

export function getDynamicProductDescription(product: Product) {
  const title = product.title.trim();
  const fallback = product.description?.trim();

  return generateCategoryProductDescription({
    title,
    category: product.category,
    seed: product.id,
    fallback,
  });
}

export function generateCategoryProductDescription({
  title,
  category,
  seed = title,
  fallback,
}: {
  title: string;
  category: string;
  seed?: string;
  fallback?: string | null;
}) {
  const normalizedTitle = title.trim() || "This product";
  const normalizedCategory = category.trim().toLowerCase();
  const templates: Record<string, string[]> = {
    caps: [
      `${normalizedTitle} brings a clean branded finish with nice fiber, structured comfort, and a refined everyday fit.`,
      `A polished branded cap made for easy styling, soft fiber feel, and a sharp finish with casual outfits.`,
    ],
    "hair net": [
      `${title} keeps styles protected with a breathable net feel, neat hold, and a smooth finish for daily wear.`,
      `A comfortable hair net designed to secure your look without bulk, with soft tension and clean coverage.`,
    ],
    "hair bands": [
      `${title} gives secure styling control with gentle stretch, polished hold, and a finish that works for daily looks.`,
      `A neat hair band option for ponytails, buns, and protective styling with dependable comfort.`,
    ],
    hoodies: [
      `${title} adds a branded lifestyle layer with soft hand-feel, relaxed structure, and easy off-duty polish.`,
      `A comfortable branded hoodie built for casual styling, clean texture, and everyday warmth.`,
    ],
    "hair oil": [
      `${title} is a lightweight oil ritual for scalp comfort, refined shine, and a soft finish without heavy residue.`,
      `A nourishing hair oil made to smooth dry-looking strands, support shine, and layer easily into your routine.`,
    ],
    "hair serum": [
      `${title} is a high-slip serum for polished shine, reduced friction, and a smooth finish from mids to ends.`,
      `A targeted hair serum made for sleekness, soft detangling, and a glassy finish without weighing hair down.`,
    ],
    "hair sprays": [
      `${title} delivers an even finishing veil for shine, refresh, and lightweight polish across styled hair.`,
      `A spray-led hair treatment made for quick refreshes, soft shine, and clean finish between wash days.`,
    ],
    "hair mist": [
      `${title} refreshes styled hair with a fine mist, soft fragrance, and a lightweight shine veil.`,
      `A featherlight hair mist for luminous finish, quick refresh, and touchable polish.`,
    ],
    "hair wax": [
      `${title} offers sculpted control with a smooth wax finish, flexible hold, and clean definition where you need it.`,
      `A focused hair wax for edges, parts, and shape control with a polished finish and reliable hold.`,
    ],
    "edge care": [
      `${title} smooths edges with clean control, soft sheen, and a refined finish without a heavy cast.`,
      `A targeted edge-care styler built for neat detail work, flexible hold, and polished shine.`,
    ],
    "leave-in care": [
      `${title} supports daily softness with slip, moisture, and a smooth base for styling.`,
      `A leave-in care step for easier comb-through, soft touch, and manageable texture.`,
    ],
    "curl cream": [
      `${title} shapes curls with plush moisture, bounce, and soft-touch definition.`,
      `A curl cream built for definition, smoothness, and a touchable finish across textured styles.`,
    ],
  };

  const options = templates[normalizedCategory];
  if (!options) {
    return (
      fallback ||
      `${normalizedTitle} is selected for polished styling, reliable finish, and everyday confidence.`
    );
  }

  const index =
    Math.abs(hashString(`${seed}-${normalizedTitle}-${normalizedCategory}`)) %
    options.length;
  return options[index];
}

export function getProductGallery(product: Product) {
  const gallery = product.gallery?.filter(Boolean) ?? [];
  return [product.image, ...gallery.filter((image) => image !== product.image)];
}

export function getHydrationLevel(product: Product) {
  return product.hydration_level ?? 4;
}

export function getRating(product: Product) {
  return product.rating ?? 0;
}

export function getReviewCount(product: Product) {
  return product.review_count ?? 0;
}

export function isTransferReady(product: Product) {
  return product.transfer_ready ?? true;
}

export function hasComplimentaryShipping(product: Product) {
  return product.complimentary_shipping ?? product.price >= 40;
}

export function getIngredients(product: Product) {
  if (isApparelOrAccessory(product.category)) {
    return getMaterialIngredients(product);
  }

  return product.ingredients?.length
    ? product.ingredients
    : [
        "Botanical oils",
        "Amino shine complex",
        "Soft-touch conditioning esters",
      ];
}

export function getBenefits(product: Product) {
  if (isApparelOrAccessory(product.category)) {
    return product.benefits?.length
      ? product.benefits
      : [
          "Protects styled hair",
          "Supports heat retention",
          "Finishes everyday looks with polish",
        ];
  }

  return product.benefits?.length
    ? product.benefits
    : [
        "Builds visible polish",
        "Softens without weight",
        "Supports a refined daily ritual",
      ];
}

export function getUsageInstructions(product: Product) {
  return product.usage_instructions?.length
    ? product.usage_instructions
    : [
        "Apply to clean or refreshed hair.",
        "Work through mids, ends, or targeted areas.",
        "Layer as needed for extra finish.",
      ];
}

export function getHairCompatibility(product: Product) {
  return product.hair_compatibility?.length
    ? product.hair_compatibility
    : ["Curls", "Coils", "Waves", "Silk press", "Protective styles"];
}

export function getProductDetailSections(
  product: Product,
): ProductDetailSection[] {
  if (isApparelOrAccessory(product.category)) {
    return [
      {
        title: "Benefits",
        items: getBenefits(product),
      },
      {
        title: "Material/Ingredients",
        items: getMaterialIngredients(product),
      },
    ].filter((section) => section.items.length > 0);
  }

  return [
    {
      title: "Benefits",
      items: getBenefits(product),
    },
    {
      title: "How to use",
      items: getUsageInstructions(product),
    },
    {
      title: "Ingredients",
      items: getIngredients(product),
    },
  ];
}

export function isApparelOrAccessory(category: string) {
  const normalizedCategory = category.trim().toLowerCase();

  return apparelCategoryMatchers.some((matcher) =>
    normalizedCategory.includes(matcher),
  );
}

function getMaterialIngredients(product: Product) {
  return product.ingredients?.length
    ? product.ingredients
    : [
        "Soft-touch fabric or fiber",
        "Comfortable everyday structure",
        "Gentle finish for styled hair",
      ];
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return hash;
}
