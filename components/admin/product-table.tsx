"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { formatCurrency } from "@/src/utils/format";

export function ProductTable({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState<string | null>(null);

  async function remove(id: string) {
    setMessage(null);
    try {
      await deleteProductAction(id);
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-normal leading-[1.1] tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-stone-500">Create, edit, upload, and manage inventory.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus /> Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add product</DialogTitle>
            </DialogHeader>
            <ProductForm onSaved={(product) => setProducts((current) => [product, ...current])} />
          </DialogContent>
        </Dialog>
      </div>

      {message && <p className="rounded-xl bg-white px-4 py-3 text-sm text-red-600">{message}</p>}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Attributes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-lg bg-stone-100">
                      <Image src={product.image} alt={product.title} fill sizes="48px" className="object-cover" />
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
                <TableCell>{(product.rating ?? 4.8).toFixed(1)} / {product.review_count ?? 0}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 text-xs">
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
                          onSaved={(saved) =>
                            setProducts((current) =>
                              current.map((item) => (item.id === saved.id ? saved : item))
                            )
                          }
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
      </div>
    </div>
  );
}
