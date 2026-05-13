"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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

const productDialogContentClass =
  "max-h-[90vh] gap-0 overflow-y-auto border-white/10 bg-[#16071f] p-0 text-white ring-white/10 sm:max-w-2xl";
const productDialogHeaderClass =
  "sticky top-0 z-[55] -mx-px border-b border-white/10 bg-[#16071f]/95 px-4 py-4 pr-16 shadow-lg shadow-black/20 backdrop-blur-2xl sm:px-6";
const productDialogBodyClass = "px-4 pb-4 pt-5 sm:px-6 sm:pb-6";

function ProductDialogHeader({ title }: { title: string }) {
  return (
    <DialogHeader className={productDialogHeaderClass}>
      <DialogTitle className="text-[#fff8df]">{title}</DialogTitle>
      <DialogClose asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-[#d6b25e]/35 bg-[#f6e7b7] text-[#24102f] shadow-lg shadow-black/25 backdrop-blur transition hover:bg-white hover:text-[#24102f]"
        >
          <X />
          <span className="sr-only">Close</span>
        </Button>
      </DialogClose>
    </DialogHeader>
  );
}

function EditProductDialog({
  product,
  onSaved,
}: {
  product: Product;
  onSaved: (product: Product) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white" aria-label={`Edit ${product.title}`}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className={productDialogContentClass} showCloseButton={false}>
        <ProductDialogHeader title="Edit product" />
        <div className={productDialogBodyClass}>
          <ProductForm
            product={product}
            onSaved={(saved) => {
              onSaved(saved);
              setOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d6b25e]">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold leading-[1.1] text-white">Products</h1>
          <p className="mt-2 text-sm text-violet-100/65">Create, preview, edit, and retire live catalog items.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-[#d6b25e] text-[#24102f] hover:bg-[#f6e7b7]">
              <Plus /> Add product
            </Button>
          </DialogTrigger>
          <DialogContent className={productDialogContentClass} showCloseButton={false}>
            <ProductDialogHeader title="Add product" />
            <div className={productDialogBodyClass}>
              <ProductForm
                onSaved={(product) => {
                  setProducts((current) => [product, ...current]);
                  setMessage(`${product.title} was posted to the store.`);
                  setCreateOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {dataError && <p className="rounded-xl bg-[#d6b25e]/15 px-4 py-3 text-sm text-[#f6e7b7] ring-1 ring-[#d6b25e]/25">{dataError}</p>}
      {message && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 ring-1 ring-emerald-300/20">
          <CheckCircle2 className="size-4" />
          {message}
        </p>
      )}

      <div className="grid gap-3 md:hidden">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-white shadow-xl shadow-black/20 backdrop-blur">
              <div className="flex gap-3">
                <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#24102f] ring-1 ring-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.title}</p>
                  <p className="mt-1 text-xs text-violet-100/55">{product.category}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded-xl bg-[#24102f] px-3 py-2 text-violet-100/70">
                      Price <span className="block font-mono text-white">{formatCurrency(product.price)}</span>
                    </span>
                    <span className="rounded-xl bg-[#24102f] px-3 py-2 text-violet-100/70">
                      Stock <span className="block font-mono text-white">{product.stock}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className={`rounded-full px-2 py-1 text-xs ${product.stock > 0 ? "bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/20" : "bg-rose-400/10 text-rose-200 ring-1 ring-rose-300/20"}`}>
                  {product.stock > 0 ? "Live" : "Out of stock"}
                </span>
                <div className="flex gap-2">
                  <EditProductDialog
                    product={product}
                    onSaved={(saved) => {
                      setProducts((current) =>
                        current.map((item) => (item.id === saved.id ? saved : item))
                      );
                      setMessage(`${saved.title} was updated.`);
                    }}
                  />
                  <Button variant="destructive" size="icon" onClick={() => remove(product.id)} aria-label={`Delete ${product.title}`}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : null}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.08] text-white shadow-xl shadow-black/20 backdrop-blur md:block">
        {products.length > 0 ? (
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/[0.04]">
                <TableHead className="text-violet-100/70">Product</TableHead>
                <TableHead className="text-violet-100/70">Category</TableHead>
                <TableHead className="text-violet-100/70">Price</TableHead>
                <TableHead className="text-violet-100/70">Stock</TableHead>
                <TableHead className="text-violet-100/70">Posted</TableHead>
                <TableHead className="text-violet-100/70">Status</TableHead>
                <TableHead className="text-right text-violet-100/70">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-white/10 hover:bg-white/[0.04]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-14 overflow-hidden rounded-lg bg-[#24102f] ring-1 ring-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="max-w-md truncate text-xs text-violet-100/55">{product.short_description ?? product.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(product.price)}</TableCell>
                  <TableCell className="font-mono">{product.stock}</TableCell>
                  <TableCell className="text-violet-100/60">{formatDate(product.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 text-xs">
                      <span className={`rounded-full px-2 py-1 ${product.stock > 0 ? "bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/20" : "bg-rose-400/10 text-rose-200 ring-1 ring-rose-300/20"}`}>
                        {product.stock > 0 ? "Live" : "Out of stock"}
                      </span>
                      <span className="rounded-full bg-white/[0.08] px-2 py-1 text-violet-100/75 ring-1 ring-white/10">Hydration {product.hydration_level ?? 4}/5</span>
                      {product.transfer_ready && <span className="rounded-full bg-white/[0.08] px-2 py-1 text-violet-100/75 ring-1 ring-white/10">Transfer</span>}
                      {product.complimentary_shipping && <span className="rounded-full bg-white/[0.08] px-2 py-1 text-violet-100/75 ring-1 ring-white/10">Shipping</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <EditProductDialog
                        product={product}
                        onSaved={(saved) => {
                          setProducts((current) =>
                            current.map((item) => (item.id === saved.id ? saved : item))
                          );
                          setMessage(`${saved.title} was updated.`);
                        }}
                      />
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
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#d6b25e]/15 ring-1 ring-[#d6b25e]/25">
              <Plus className="size-5 text-[#f6e7b7]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">No products yet</h2>
              <p className="mt-1 max-w-md text-sm text-violet-100/60">Upload your first product image, fill the product details, and publish it to the store.</p>
            </div>
            <Button className="rounded-full bg-[#d6b25e] text-[#24102f] hover:bg-[#f6e7b7]" onClick={() => setCreateOpen(true)}>
              <Plus />
              Add product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
