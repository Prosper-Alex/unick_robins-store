"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OdometerValue } from "@/components/shared/odometer-value";
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">Cart</p>
            <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-4xl">Shopping cart</h1>
          </div>
          <p className="text-sm text-violet-100/70">
            {items.length} item{items.length === 1 ? "" : "s"} selected
          </p>
        </div>
        <div className="mt-8 grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-white/10 bg-white/[0.97] p-4 text-[#24102f] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/20 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:p-5">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-violet-100 ring-1 ring-[#24102f]/5">
                <Image src={item.image} alt={item.title} fill sizes="120px" className="object-cover" />
              </div>
              <div className="min-w-0 self-center">
                <p className="text-sm font-medium text-[#8b5a00]">{item.category}</p>
                <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-tight text-[#24102f] sm:text-lg">{item.title}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="font-medium text-[#24102f]">{formatCurrency(getProductPrice(item, currency), currency)}</span>
                  <span className="text-[#65526d]">Line total {formatCurrency(getProductPrice(item, currency) * item.quantity, currency)}</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between gap-3 rounded-2xl border border-[#24102f]/8 bg-[#fbf8fb] p-2 sm:col-span-1 sm:min-w-[190px]">
                <div className="flex items-center gap-1.5 rounded-full bg-white p-1 shadow-sm ring-1 ring-[#24102f]/8">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-full text-[#4b1f61] hover:bg-[#f6e7b7] hover:text-[#24102f] disabled:bg-transparent"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus />
                  </Button>
                  <span className="min-w-9 text-center font-mono text-sm font-semibold">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-full text-[#4b1f61] hover:bg-[#f6e7b7] hover:text-[#24102f] disabled:bg-transparent"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="size-9 shrink-0 rounded-full text-[#9f1239] hover:bg-rose-50 hover:text-[#7f1d1d]" onClick={() => removeItem(item.id)} aria-label="Remove item">
                  <Trash2 />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.97] p-5 text-[#24102f] shadow-2xl shadow-black/20 ring-1 ring-white/30 sm:p-6 lg:sticky lg:top-28">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b5a00]">Summary</p>
            <h2 className="mt-2 text-xl font-semibold text-[#24102f]">Order total</h2>
          </div>
          <span className="rounded-full bg-[#f6e7b7] px-3 py-1 text-xs font-semibold text-[#24102f]">
            {currency}
          </span>
        </div>
        <div className="mt-6 grid gap-4 rounded-2xl bg-[#fbf8fb] p-4 text-sm ring-1 ring-[#24102f]/8">
          <div className="flex justify-between">
            <span className="text-[#65526d]">Subtotal</span>
            <OdometerValue value={subtotal} currency={currency} className="font-medium" />
          </div>
          <div className="flex justify-between">
            <span className="text-[#65526d]">Shipping</span>
            <span className="font-medium">Calculated later</span>
          </div>
          <div className="flex justify-between border-t border-[#24102f]/10 pt-4 text-lg font-semibold">
            <span>Total</span>
            <OdometerValue value={subtotal} currency={currency} />
          </div>
        </div>
        <Button asChild className="mt-6 h-11 w-full rounded-full bg-[#4b1f61] text-white hover:bg-[#371647]" variant="secondary">
          <Link href="/checkout">Checkout</Link>
        </Button>
        <Button variant="ghost" className="mt-2 h-10 w-full rounded-full text-[#65526d] hover:bg-[#f6e7b7]/60 hover:text-[#24102f]" onClick={clearCart}>
          Clear cart
        </Button>
      </aside>
    </div>
  );
}
