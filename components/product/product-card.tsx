"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, PackageCheck, ShoppingBag, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCartStore } from "@/src/store/cart-store";
import { useWishlistStore } from "@/src/store/wishlist-store";
import type { Product } from "@/src/types/product";
import { formatCurrency } from "@/src/utils/format";
import {
  getHydrationLevel,
  getProductSummary,
  getRating,
  getReviewCount,
  hasComplimentaryShipping,
  isTransferReady,
} from "@/src/utils/product-details";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.has(product.id));
  const rating = getRating(product);
  const reviewCount = getReviewCount(product);
  const inStock = product.stock > 0;

  return (
    <Card className="group relative h-full w-full overflow-hidden border-white/10 bg-white/[0.97] p-0 shadow-sm shadow-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/25">
      <Link href={`/products/${product.id}`} className="relative z-0 block h-[60vh] max-h-[520px] min-h-[300px] overflow-hidden bg-violet-100 sm:aspect-[4/5] sm:h-auto sm:min-h-0">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-[#fff8df]/95 px-3 py-1 text-xs font-medium text-[#4b1f61] shadow-sm">
          {product.category}
        </span>
        <span className={`absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
          inStock ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
        }`}>
          {inStock ? `${product.stock} in stock` : "Sold out"}
        </span>
      </Link>
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full bg-[#fff8df]/95 text-[#4b1f61] shadow-sm transition hover:text-[#9f1239]"
          aria-label={`Wishlist ${product.title}`}
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart className={`size-4 ${isWishlisted ? "fill-current text-[#9f1239]" : ""}`} />
        </button>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full bg-[#fff8df]/95 text-[#4b1f61] opacity-0 shadow-sm transition group-hover:opacity-100"
              aria-label={`Quick preview ${product.title}`}
            >
              <Eye className="size-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{product.title}</DialogTitle>
              <DialogDescription>
                Quick preview of {product.title}, including product summary and key attributes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-violet-100">
                <Image src={product.image} alt={product.title} fill sizes="220px" className="object-cover" />
              </div>
              <div className="grid content-start gap-4">
                <p className="text-sm leading-6 text-[#65526d]">{getProductSummary(product)}</p>
                <ProductMeta product={product} />
                <Button className="w-fit rounded-full" onClick={() => addItem(product)} disabled={!inStock}>
                  <ShoppingBag /> Add to cart
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <CardContent className="grid gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="grid gap-2 min-w-0">
          <Link href={`/products/${product.id}`} className="text-lg font-semibold tracking-tight text-[#24102f]">
            {product.title}
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#65526d]">
            <span className="flex text-[#8b5a00]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`size-3.5 ${index < Math.round(rating) ? "fill-current" : ""}`}
                />
              ))}
            </span>
            <span>{rating.toFixed(1)} ({reviewCount})</span>
          </div>
          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-[#65526d]">
            {getProductSummary(product)}
          </p>
        </div>
        <ProductMeta product={product} />
        <div className="flex min-w-0 items-center justify-between gap-3">
          <span className="min-w-0 text-lg font-semibold text-[#24102f]">{formatCurrency(product.price)}</span>
          <Button className="rounded-full" onClick={() => addItem(product)} disabled={!inStock}>
            <ShoppingBag /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductMeta({ product }: { product: Product }) {
  return (
    <div className="grid gap-2 text-xs text-[#65526d]">
      <div className="flex items-center justify-between rounded-full bg-violet-50 px-3 py-2">
        <span>Hydration level</span>
        <span className="font-semibold text-[#4b1f61]">{getHydrationLevel(product)}/5</span>
      </div>
      <div className="grid gap-1.5">
        {hasComplimentaryShipping(product) && (
          <span className="inline-flex items-center gap-1.5">
            <PackageCheck className="size-3.5 text-[#8b5a00]" /> Complimentary shipping available
          </span>
        )}
        {isTransferReady(product) && (
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#8b5a00]" /> Transfer ready
          </span>
        )}
      </div>
    </div>
  );
}
