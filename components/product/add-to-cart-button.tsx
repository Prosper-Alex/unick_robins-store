"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { throwProductToCart } from "@/components/product/cart-throw-animation";
import { useCartStore } from "@/src/store/cart-store";
import type { Product } from "@/src/types/product";
import { getDisplayCurrencyForCountry, localizeProduct } from "@/src/utils/pricing";

export function AddToCartButton({
  product,
  country,
}: {
  product: Product;
  country?: string | null;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const inStock = product.stock > 0;
  const currency = getDisplayCurrencyForCountry(country);

  function addSelection(event: MouseEvent<HTMLButtonElement>) {
    const localizedProduct = localizeProduct(product, currency);
    Array.from({ length: quantity }).forEach(() => addItem(localizedProduct));
    throwProductToCart({ product, source: event.currentTarget, quantity });
  }

  return (
    <div className="grid gap-3 sm:inline-grid sm:grid-cols-[auto_auto]">
      <div className="flex h-12 w-full items-center justify-between rounded-full border border-white/15 bg-white/10 px-2 text-white sm:w-fit">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-white hover:bg-white/10"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          disabled={!inStock || quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus />
        </Button>
        <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-white hover:bg-white/10"
          onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
          disabled={!inStock || quantity >= product.stock}
          aria-label="Increase quantity"
        >
          <Plus />
        </Button>
      </div>
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
