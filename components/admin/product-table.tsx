"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductForm } from "@/components/admin/product-form";
import { deleteProductAction } from "@/src/actions/admin-products";
import type { Product } from "@/src/types/product";
import { formatCurrency, formatDate } from "@/src/utils/format";

export function ProductTable({
  products: initialProducts,
  dataError,
}: {
  products: Product[];
  dataError?: string | null;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  async function remove(id: string) {
    const product = products.find((item) => item.id === id);
    if (!window.confirm(`Delete ${product?.title ?? "this product"}? This cannot be undone.`)) {
      return;
    }

    setMessage(null);
    try {
      await deleteProductAction(id);
      setProducts((current) => current.filter((product) => product.id !== id));
      setMessage(`${product?.title ?? "Product"} was deleted.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold leading-[1.1]">Products</h1>
          <p className="mt-1 text-sm text-stone-500">Create, preview, edit, and retire live catalog items.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus /> Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add product</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSaved={(product) => {
                setProducts((current) => [product, ...current]);
                setMessage(`${product.title} was posted to the store.`);
                setCreateOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {dataError && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{dataError}</p>}
      {message && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" />
          {message}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-14 overflow-hidden rounded-lg bg-stone-100 ring-1 ring-stone-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="max-w-md truncate text-xs text-stone-500">{product.short_description ?? product.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{formatDate(product.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 text-xs">
                      <span className={`rounded-full px-2 py-1 ${product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {product.stock > 0 ? "Live" : "Out of stock"}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2 py-1">Hydration {product.hydration_level ?? 4}/5</span>
                      {product.transfer_ready && <span className="rounded-full bg-stone-100 px-2 py-1">Transfer</span>}
                      {product.complimentary_shipping && <span className="rounded-full bg-stone-100 px-2 py-1">Shipping</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" aria-label={`Edit ${product.title}`}>
                            <Pencil />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit product</DialogTitle>
                          </DialogHeader>
                          <ProductForm
                            product={product}
                            onSaved={(saved) => {
                              setProducts((current) =>
                                current.map((item) => (item.id === saved.id ? saved : item))
                              );
                              setMessage(`${saved.title} was updated.`);
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="icon" onClick={() => remove(product.id)} aria-label={`Delete ${product.title}`}>
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid justify-items-center gap-3 px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-stone-100">
              <Plus className="size-5 text-stone-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-950">No products yet</h2>
              <p className="mt-1 max-w-md text-sm text-stone-500">Upload your first product image, fill the product details, and publish it to the store.</p>
            </div>
            <Button className="rounded-full" onClick={() => setCreateOpen(true)}>
              <Plus />
              Add product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
