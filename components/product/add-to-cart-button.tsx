"use client";

import { ShoppingBag } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { throwProductToCart } from "@/components/product/cart-throw-animation";
import { useCartStore } from "@/src/store/cart-store";
import type { Product } from "@/src/types/product";
import { getClientCountryFallback, getDisplayCurrencyForCountry, localizeProduct } from "@/src/utils/pricing";

export function AddToCartButton({
  product,
  country,
}: {
  product: Product;
  country?: string | null;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const inStock = product.stock > 0;
  const [resolvedCountry, setResolvedCountry] = useState(country);
  const currency = getDisplayCurrencyForCountry(resolvedCountry);

  useEffect(() => {
    if (!country) {
      const frame = window.requestAnimationFrame(() => {
        setResolvedCountry(getClientCountryFallback());
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [country]);

  function addSelection(event: MouseEvent<HTMLButtonElement>) {
    const localizedProduct = localizeProduct(product, currency);
    addItem(localizedProduct);
    throwProductToCart({ product, source: event.currentTarget });
  }

  return (
    <div className="grid gap-3 sm:inline-grid">
      <Button
        className="h-12 rounded-full px-8"
        onClick={addSelection}
        disabled={!inStock}
      >
        <ShoppingBag /> Add to cart
      </Button>
    </div>
  );
}
