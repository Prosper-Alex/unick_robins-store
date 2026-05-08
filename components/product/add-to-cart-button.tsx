"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/src/store/cart-store";
import type { Product } from "@/src/types/product";

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const inStock = product.stock > 0;

  function addSelection() {
    Array.from({ length: quantity }).forEach(() => addItem(product));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex h-12 w-fit items-center rounded-full border border-white/15 bg-white/10 px-2 text-white">
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
