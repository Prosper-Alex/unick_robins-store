"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/src/store/cart-store";
import { formatCurrency } from "@/src/utils/format";
import {
  getClientCountryFallback,
  getDisplayCurrencyForCountry,
  getProductPrice,
} from "@/src/utils/pricing";

export function CartView({ initialCountry }: { initialCountry?: string | null }) {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [country, setCountry] = useState(initialCountry);
  const currency = getDisplayCurrencyForCountry(country);
  const subtotal = items.reduce(
    (total, item) => total + getProductPrice(item, currency) * item.quantity,
    0,
  );

  useEffect(() => {
    if (!initialCountry) {
      const frame = window.requestAnimationFrame(() => {
        setCountry(getClientCountryFallback());
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [initialCountry]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/10">
          <ShoppingBag className="size-7 text-[#f6d87f]" />
        </div>
        <h1 className="mt-6 text-3xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-violet-100">Add a ritual or two before checkout.</p>
        <Button asChild className="mt-8 rounded-full">
          <Link href="/products">Shop products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
      <section>
        <h1 className="text-3xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-4xl">Shopping cart</h1>
        <div className="mt-8 grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-white/10 bg-white/[0.97] p-4 text-[#24102f] sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-violet-100">
                <Image src={item.image} alt={item.title} fill sizes="120px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#8b5a00]">{item.category}</p>
                <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-tight text-[#24102f] sm:text-lg">{item.title}</h2>
                <p className="mt-1 text-sm text-[#65526d]">{formatCurrency(getProductPrice(item, currency), currency)}</p>
              </div>
              <div className="col-span-2 flex items-center justify-between gap-2 rounded-2xl bg-stone-50 p-2 sm:col-span-1 sm:justify-end sm:bg-transparent sm:p-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  aria-label="Increase quantity"
                >
                  <Plus />
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeItem(item.id)} aria-label="Remove item">
                  <Trash2 />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.97] p-5 text-[#24102f] shadow-xl shadow-black/20 sm:p-6 lg:sticky lg:top-28">
        <h2 className="text-xl font-semibold text-[#24102f]">Order summary</h2>
        <div className="mt-6 grid gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[#65526d]">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#65526d]">Shipping</span>
            <span className="font-medium">Calculated later</span>
          </div>
          <div className="flex justify-between border-t pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
        </div>
        <Button asChild className="mt-6 w-full text-white" variant="secondary">
          <Link href="/checkout">Checkout</Link>
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={clearCart}>
          Clear cart
        </Button>
      </aside>
    </div>
  );
}
