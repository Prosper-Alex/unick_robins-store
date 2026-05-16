"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, PackageCheck, ShoppingBag, Sparkles, Star } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
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
import { throwProductToCart } from "@/components/product/cart-throw-animation";
import { useCartStore } from "@/src/store/cart-store";
import { useWishlistStore } from "@/src/store/wishlist-store";
import type { Product } from "@/src/types/product";
import { formatCurrency } from "@/src/utils/format";
import {
  getDisplayCurrencyForCountry,
  getClientCountryFallback,
  getProductPrice,
  localizeProduct,
  type StoreCurrency,
} from "@/src/utils/pricing";
import {
  getHydrationLevel,
  getProductSummary,
  getRating,
  getReviewCount,
  hasComplimentaryShipping,
  isTransferReady,
} from "@/src/utils/product-details";

export function ProductCard({
  product,
  country,
}: {
  product: Product;
  country?: string | null;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.has(product.id));
  const [resolvedCountry, setResolvedCountry] = useState(country);
  const rating = getRating(product);
  const reviewCount = getReviewCount(product);
  const inStock = product.stock > 0;
  const currency = getDisplayCurrencyForCountry(resolvedCountry);
  const displayPrice = getProductPrice(product, currency);

  useEffect(() => {
    if (!country) {
      const frame = window.requestAnimationFrame(() => {
        setResolvedCountry(getClientCountryFallback());
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [country]);

  function addProduct(event: MouseEvent<HTMLButtonElement>) {
    addItem(localizeProduct(product, currency));
    throwProductToCart({ product, source: event.currentTarget });
  }

  return (
    <Card className="card-lift group relative h-full w-full overflow-hidden rounded-2xl border-white/10 bg-white/[0.97] p-0 shadow-sm shadow-black/10">
      <Link href={`/products/${product.id}`} className="relative z-0 block aspect-[4/5] min-h-[260px] overflow-hidden bg-violet-50 sm:min-h-0">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {/* Category badge — warm gold tint */}
        <span className="absolute left-3 top-3 max-w-[calc(100%-4.25rem)] truncate rounded-full border border-[#d6b25e]/30 bg-[#fff8df]/95 px-3 py-1 text-xs font-medium text-[#4b1f61] shadow-sm backdrop-blur-sm sm:left-4 sm:top-4">
          {product.category}
        </span>
        {/* Stock badge */}
        <span className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm sm:bottom-4 sm:left-4 ${
          inStock ? "bg-emerald-50/90 text-emerald-800" : "bg-rose-50/90 text-rose-800"
        }`}>
          {inStock ? `${product.stock} in stock` : "Sold out"}
        </span>
      </Link>

      {/* Action buttons */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 sm:right-4 sm:top-4">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full bg-[#fff8df]/95 text-[#4b1f61] shadow-sm backdrop-blur-sm transition hover:scale-110 hover:text-[#9f1239]"
          aria-label={`Wishlist ${product.title}`}
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart className={`size-4 ${isWishlisted ? "fill-current text-[#9f1239]" : ""}`} />
        </button>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full bg-[#fff8df]/95 text-[#4b1f61] shadow-sm backdrop-blur-sm transition hover:scale-110 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label={`Quick preview ${product.title}`}
            >
              <Eye className="size-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{product.title}</DialogTitle>
              <DialogDescription>
                Quick preview of {product.title}, including product summary and key attributes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 sm:grid-cols-[minmax(160px,220px)_1fr]">
              <div className="relative aspect-[4/5] max-h-[360px] overflow-hidden rounded-2xl bg-violet-100">
                <Image src={product.image} alt={product.title} fill sizes="220px" className="object-cover" />
              </div>
              <div className="grid content-start gap-4">
                <p className="text-sm leading-6 text-[#65526d]">{getProductSummary(product)}</p>
                <ProductMeta product={product} />
                <Button className="w-fit rounded-full" onClick={addProduct} disabled={!inStock}>
                  <ShoppingBag /> Add to cart
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <CardContent className="grid gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="grid min-w-0 gap-2">
          <Link href={`/products/${product.id}`} className="line-clamp-2 min-h-[3.25rem] font-heading text-lg font-semibold leading-tight tracking-tight text-[#24102f] transition hover:text-[#4b1f61]">
            {product.title}
          </Link>
          <div className="flex min-w-0 items-center gap-2 text-xs text-[#65526d]">
            <span className="flex shrink-0 text-[#8b5a00]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`size-3.5 ${index < Math.round(rating) ? "fill-current" : ""}`}
                />
              ))}
            </span>
            <span className="truncate">{reviewCount > 0 ? `${rating.toFixed(1)} (${reviewCount})` : "No reviews yet"}</span>
          </div>
          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-[#65526d]">
            {getProductSummary(product)}
          </p>
        </div>
        <ProductMeta product={product} />
        <div className="grid min-w-0 grid-cols-[1fr_auto] items-center gap-3">
          {/* Price in Playfair Display for editorial feel */}
          <span className="font-heading min-w-0 text-xl font-semibold text-[#24102f]">
            {formatPrice(displayPrice, currency)}
          </span>
          <Button className="shrink-0 rounded-full px-4" onClick={addProduct} disabled={!inStock}>
            <ShoppingBag /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatPrice(price: number, currency: StoreCurrency) {
  return formatCurrency(price, currency);
}

function ProductMeta({ product }: { product: Product }) {
  return (
    <div className="grid gap-2 text-xs text-[#65526d]">
      <div className="flex items-center justify-between gap-3 rounded-full bg-[#f3eef8] px-3 py-2">
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
