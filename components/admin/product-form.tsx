"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProduct, updateProduct, uploadProductImage } from "@/src/services/products";
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
  rating: z.coerce.number().min(0).max(5),
  review_count: z.coerce.number().int().min(0),
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
      rating: product?.rating ?? 4.8,
      review_count: product?.review_count ?? 0,
    },
  });

  async function handleImageUpload(file?: File) {
    if (!file) {
      return;
    }

    setUploading(true);
    setStatus(null);
    try {
      const publicUrl = await uploadProductImage(file);
      form.setValue("image", publicUrl, { shouldValidate: true });
      setStatus("Image uploaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ProductFormValues) {
    setStatus(null);
    try {
      const saved = product?.id
        ? await updateProduct(product.id, values)
        : await createProduct(values);
      setStatus("Product saved.");
      onSaved?.(saved);
      if (!product) {
        form.reset();
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
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="rating">Rating</label>
          <Input id="rating" type="number" min="0" max="5" step="0.1" className="h-11" {...form.register("rating")} />
          <FormError message={form.formState.errors.rating?.message} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="review_count">Review count</label>
          <Input id="review_count" type="number" min="0" className="h-11" {...form.register("review_count")} />
          <FormError message={form.formState.errors.review_count?.message} />
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
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input id="image" className="h-11" placeholder="https://..." {...form.register("image")} />
          <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 px-4 text-sm font-medium transition hover:bg-stone-100">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
            Upload
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => handleImageUpload(event.target.files?.[0])}
            />
          </label>
        </div>
        <FormError message={form.formState.errors.image?.message} />
      </div>
      {status && <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700">{status}</p>}
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
