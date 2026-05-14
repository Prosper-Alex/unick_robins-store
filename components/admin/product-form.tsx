"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, Loader2, Save, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProductAction, updateProductAction, uploadProductImageAction } from "@/src/actions/admin-products";
import { productCategoryGroups } from "@/src/constants/product-categories";
import type { Product } from "@/src/types/product";
import { generateCategoryProductDescription } from "@/src/utils/product-details";

const productSchema = z.object({
  title: z.string().min(2, "Title is required"),
  short_description: z.string().min(8, "Use at least 8 characters"),
  description: z.string().min(10, "Use at least 10 characters"),
  base_currency: z.enum(["NGN", "USD"]),
  price_ngn: z.coerce.number().positive("Naira price must be greater than 0"),
  price_usd: z.coerce.number().positive("USD price must be greater than 0"),
  image: z.string().url("Use a valid image URL"),
  category: z.string().min(2, "Category is required"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  hydration_level: z.coerce.number().int().min(1).max(5),
  transfer_ready: z.coerce.boolean(),
  complimentary_shipping: z.coerce.boolean(),
  gallery: z.array(z.string().url()).default([]),
});

type ProductFormValues = z.infer<typeof productSchema>;
type ProductFormInput = z.input<typeof productSchema>;

export function ProductForm({
  product,
  onSaved,
}: {
  product?: Product;
  onSaved?: (product: Product) => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(product?.gallery?.filter(Boolean) ?? []);
  const [uploading, setUploading] = useState(false);
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title ?? "",
      short_description: product?.short_description ?? "",
      description: product?.description ?? "",
      base_currency: product?.base_currency ?? "NGN",
      price_ngn: product?.price_ngn ?? (product?.base_currency === "NGN" || !product?.base_currency ? product?.price : 0) ?? 0,
      price_usd: product?.price_usd ?? (product?.base_currency === "USD" ? product?.price : 0) ?? 0,
      image: product?.image ?? "",
      category: product?.category ?? "",
      stock: product?.stock ?? 0,
      hydration_level: product?.hydration_level ?? 4,
      transfer_ready: product?.transfer_ready ?? true,
      complimentary_shipping: product?.complimentary_shipping ?? false,
      gallery: product?.gallery?.filter(Boolean) ?? [],
    },
  });
  const imageUrl = useWatch({ control: form.control, name: "image" });
  const titleValue = useWatch({ control: form.control, name: "title" });
  const categoryValue = useWatch({ control: form.control, name: "category" });
  const previewUrl = localPreviewUrl || (typeof imageUrl === "string" ? imageUrl : "");

  function generateDescription() {
    const title = typeof titleValue === "string" ? titleValue : "";
    const category = typeof categoryValue === "string" ? categoryValue : "";

    if (!title.trim() || !category.trim()) {
      setStatus("Add a product title and category before generating the description.");
      return;
    }

    const generated = generateCategoryProductDescription({
      title,
      category,
      seed: product?.id ?? `${title}-${category}`,
    });

    form.setValue("short_description", generated, { shouldValidate: true });
    form.setValue("description", generated, { shouldValidate: true });
    setStatus("Category-matched description generated.");
  }

  async function handleImageUpload(file?: File) {
    if (!file) {
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(localPreviewUrl);
    setUploading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const publicUrl = await uploadProductImageAction(formData);
      form.setValue("image", publicUrl, { shouldValidate: true });
      setStatus("Image uploaded and ready to publish.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
      setLocalPreviewUrl(null);
      URL.revokeObjectURL(localPreviewUrl);
    }
  }

  async function handleGalleryUpload(files?: FileList | null) {
    if (!files?.length) {
      return;
    }

    setUploading(true);
    setStatus(null);
    const temporaryUrls = Array.from(files).map((file) => URL.createObjectURL(file));
    setGalleryPreviews((current) => [...current, ...temporaryUrls]);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        uploadedUrls.push(await uploadProductImageAction(formData));
      }

      const nextGallery = [...(form.getValues("gallery") ?? []), ...uploadedUrls];
      form.setValue("gallery", nextGallery, { shouldValidate: true });
      setGalleryPreviews(nextGallery);
      setStatus(`${uploadedUrls.length} gallery image${uploadedUrls.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gallery upload failed.");
      setGalleryPreviews(form.getValues("gallery") ?? []);
    } finally {
      setUploading(false);
      temporaryUrls.forEach((url) => URL.revokeObjectURL(url));
    }
  }

  function removeGalleryImage(image: string) {
    const nextGallery = (form.getValues("gallery") ?? []).filter((item) => item !== image);
    form.setValue("gallery", nextGallery, { shouldValidate: true });
    setGalleryPreviews(nextGallery);
  }

  async function onSubmit(values: ProductFormValues) {
    setStatus(null);
    try {
      const payload = {
        ...values,
        price: values.base_currency === "NGN" ? values.price_ngn : values.price_usd,
      };
      const saved = product?.id
        ? await updateProductAction(product.id, payload)
        : await createProductAction(payload);
      setStatus(product?.id ? "Product changes saved." : "Product posted to the store.");
      onSaved?.(saved);
      if (!product) {
        form.reset();
        setLocalPreviewUrl(null);
        setGalleryPreviews([]);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Product could not be saved.");
    }
  }

  return (
    <form className="grid gap-5 text-white" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="title">Product title</label>
        <Input id="title" className="h-11 border-white/10 bg-white/[0.08] text-white" {...form.register("title")} />
        <FormError message={form.formState.errors.title?.message} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="short_description">Short product summary</label>
        <Input id="short_description" className="h-11 border-white/10 bg-white/[0.08] text-white" {...form.register("short_description")} />
        <FormError message={form.formState.errors.short_description?.message} />
      </div>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-medium" htmlFor="description">Description</label>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full border-white/15 bg-white/[0.08] text-white hover:bg-white/12 hover:text-white"
            onClick={generateDescription}
          >
            Generate from category
          </Button>
        </div>
        <textarea
          id="description"
          className="min-h-28 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white outline-none transition placeholder:text-violet-100/45 focus-visible:border-[#d6b25e] focus-visible:ring-3 focus-visible:ring-[#d6b25e]/30"
          {...form.register("description")}
        />
        <FormError message={form.formState.errors.description?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="base_currency">Base currency</label>
          <select
            id="base_currency"
            className="h-11 rounded-lg border border-white/10 bg-[#24102f] px-3 text-sm text-white outline-none transition focus-visible:border-[#d6b25e] focus-visible:ring-3 focus-visible:ring-[#d6b25e]/30"
            {...form.register("base_currency")}
          >
            <option value="NGN">Naira</option>
            <option value="USD">USD</option>
          </select>
          <FormError message={form.formState.errors.base_currency?.message} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="price_ngn">Nigeria price (NGN)</label>
          <Input id="price_ngn" type="number" min="0" step="1" className="h-11 border-white/10 bg-white/[0.08] text-white" {...form.register("price_ngn")} />
          <FormError message={form.formState.errors.price_ngn?.message} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="price_usd">International price (USD)</label>
          <Input id="price_usd" type="number" min="0" step="0.01" className="h-11 border-white/10 bg-white/[0.08] text-white" {...form.register("price_usd")} />
          <FormError message={form.formState.errors.price_usd?.message} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="category">Category</label>
          <select
            id="category"
            className="h-11 rounded-lg border border-white/10 bg-[#24102f] px-3 text-sm text-white outline-none transition focus-visible:border-[#d6b25e] focus-visible:ring-3 focus-visible:ring-[#d6b25e]/30"
            {...form.register("category")}
          >
            <option value="">Select category</option>
            {productCategoryGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <FormError message={form.formState.errors.category?.message} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="stock">Stock quantity</label>
          <Input id="stock" type="number" min="0" className="h-11 border-white/10 bg-white/[0.08] text-white" {...form.register("stock")} />
          <FormError message={form.formState.errors.stock?.message} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="hydration_level">Hydration level</label>
          <Input id="hydration_level" type="number" min="1" max="5" className="h-11 border-white/10 bg-white/[0.08] text-white" {...form.register("hydration_level")} />
          <FormError message={form.formState.errors.hydration_level?.message} />
        </div>
      </div>
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" className="size-4" {...form.register("transfer_ready")} />
          Transfer ready
        </label>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" className="size-4" {...form.register("complimentary_shipping")} />
          Complimentary shipping
        </label>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="image">Product image</label>
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 sm:grid-cols-[168px_1fr]">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#24102f] ring-1 ring-white/10">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Product preview" className="h-full w-full object-cover" />
            ) : (
              <div className="grid justify-items-center gap-2 text-violet-100/50">
                <ImageUp className="size-8" />
                <span className="text-xs font-medium">Preview</span>
              </div>
            )}
          </div>
          <div className="grid content-start gap-3">
            <Input id="image" className="h-11 border-white/10 bg-white/[0.08] text-white placeholder:text-violet-100/45" placeholder="Upload an image or paste a URL" {...form.register("image")} />
            <label className="inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-4 text-sm font-medium text-white transition hover:bg-white/12">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
              Upload image
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleImageUpload(event.target.files?.[0])}
              />
            </label>
            <p className="text-xs leading-5 text-violet-100/60">Upload creates a store image URL and shows a preview before posting.</p>
          </div>
        </div>
        <FormError message={form.formState.errors.image?.message} />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium">Gallery images</label>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-4 text-sm font-medium text-white transition hover:bg-white/12">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
            Add images
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => handleGalleryUpload(event.target.files)}
            />
          </label>
        </div>
        {galleryPreviews.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {galleryPreviews.map((image) => (
              <div key={image} className="group relative aspect-square overflow-hidden rounded-xl bg-[#24102f] ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Product gallery preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(image)}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-[#f6e7b7] text-[#24102f] opacity-0 shadow-sm transition group-hover:opacity-100"
                  aria-label="Remove gallery image"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.05] px-4 py-5 text-sm text-violet-100/60">
            Add multiple angles, texture shots, or packaging images for this product.
          </p>
        )}
      </div>
      {status && <p className="rounded-lg bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200 ring-1 ring-emerald-300/20">{status}</p>}
      <Button className="h-11 w-full rounded-full bg-[#d6b25e] px-6 text-[#24102f] hover:bg-[#f6e7b7] sm:w-fit" disabled={form.formState.isSubmitting || uploading}>
        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
        Save product
      </Button>
    </form>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-rose-200">{message}</p>;
}
