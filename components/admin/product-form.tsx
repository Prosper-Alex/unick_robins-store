"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, Loader2, Save, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProductAction, updateProductAction, uploadProductImageAction } from "@/src/actions/admin-products";
import type { Product } from "@/src/types/product";

const productSchema = z.object({
  title: z.string().min(2, "Title is required"),
  short_description: z.string().min(8, "Use at least 8 characters"),
  description: z.string().min(10, "Use at least 10 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
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
      price: product?.price ?? 0,
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
  const previewUrl = localPreviewUrl || (typeof imageUrl === "string" ? imageUrl : "");

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
      const saved = product?.id
        ? await updateProductAction(product.id, values)
        : await createProductAction(values);
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
    <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="title">Product title</label>
        <Input id="title" className="h-11" {...form.register("title")} />
        <FormError message={form.formState.errors.title?.message} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="short_description">Short product summary</label>
        <Input id="short_description" className="h-11" {...form.register("short_description")} />
        <FormError message={form.formState.errors.short_description?.message} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="description">Description</label>
        <textarea
          id="description"
          className="min-h-28 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          {...form.register("description")}
        />
        <FormError message={form.formState.errors.description?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="price">Price</label>
          <Input id="price" type="number" min="0" step="1" className="h-11" {...form.register("price")} />
          <FormError message={form.formState.errors.price?.message} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="category">Category</label>
          <Input id="category" className="h-11" {...form.register("category")} />
          <FormError message={form.formState.errors.category?.message} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="stock">Stock quantity</label>
          <Input id="stock" type="number" min="0" className="h-11" {...form.register("stock")} />
          <FormError message={form.formState.errors.stock?.message} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="hydration_level">Hydration level</label>
          <Input id="hydration_level" type="number" min="1" max="5" className="h-11" {...form.register("hydration_level")} />
          <FormError message={form.formState.errors.hydration_level?.message} />
        </div>
      </div>
      <div className="grid gap-3 rounded-2xl border border-stone-200 p-4 sm:grid-cols-2">
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
        <div className="grid gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:grid-cols-[168px_1fr]">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-stone-200">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Product preview" className="h-full w-full object-cover" />
            ) : (
              <div className="grid justify-items-center gap-2 text-stone-400">
                <ImageUp className="size-8" />
                <span className="text-xs font-medium">Preview</span>
              </div>
            )}
          </div>
          <div className="grid content-start gap-3">
            <Input id="image" className="h-11 bg-white" placeholder="Upload an image or paste a URL" {...form.register("image")} />
            <label className="inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium transition hover:bg-stone-100">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
              Upload image
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleImageUpload(event.target.files?.[0])}
              />
            </label>
            <p className="text-xs leading-5 text-stone-500">Upload creates a store image URL and shows a preview before posting.</p>
          </div>
        </div>
        <FormError message={form.formState.errors.image?.message} />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium">Gallery images</label>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium transition hover:bg-stone-100">
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
              <div key={image} className="group relative aspect-square overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Product gallery preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(image)}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-stone-800 opacity-0 shadow-sm transition group-hover:opacity-100"
                  aria-label="Remove gallery image"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500">
            Add multiple angles, texture shots, or packaging images for this product.
          </p>
        )}
      </div>
      {status && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{status}</p>}
      <Button className="h-11 w-fit rounded-full px-6" disabled={form.formState.isSubmitting || uploading}>
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

  return <p className="text-sm text-red-600">{message}</p>;
}
