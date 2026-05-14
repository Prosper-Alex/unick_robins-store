export const productCategoryGroups = [
  {
    label: "Hair Sprays & Treatments",
    description: "Liquid and mist-led care including oils, serums, sprays, and leave-in formulas.",
    categories: ["Hair Sprays", "Hair Oil", "Hair Serum", "Hair Mist", "Leave-In Care"],
  },
  {
    label: "Hair Wear",
    description: "Wearable hair accessories and branded lifestyle pieces.",
    categories: ["Caps", "Hair Net", "Hair Bands", "Hoodies"],
  },
  {
    label: "Hair Wax & Hold",
    description: "Hold, sculpt, and finish products with wax or balm texture.",
    categories: ["Hair Wax", "Edge Care", "Curl Cream"],
  },
] as const;

export const productCategories = productCategoryGroups.flatMap((group) => group.categories);

export type ProductCategory = (typeof productCategories)[number];
