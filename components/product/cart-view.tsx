"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/src/store/cart-store";
import { formatCurrency } from "@/src/utils/format";

export function CartView() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

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
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <section>
        <h1 className="text-3xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-4xl">Shopping cart</h1>
        <div className="mt-8 grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="grid gap-4 border-white/10 bg-white/[0.97] p-4 text-[#24102f] sm:grid-cols-[120px_1fr_auto] sm:items-center">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-violet-100">
                <Image src={item.image} alt={item.title} fill sizes="120px" className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#8b5a00]">{item.category}</p>
                <h2 className="mt-1 text-lg font-semibold text-[#24102f]">{item.title}</h2>
                <p className="mt-1 text-sm text-[#65526d]">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
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
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  aria-label="Increase quantity"
                >
                  <Plus />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label="Remove item">
                  <Trash2 />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.97] p-6 text-[#24102f] shadow-xl shadow-black/20">
        <h2 className="text-xl font-semibold text-[#24102f]">Order summary</h2>
        <div className="mt-6 grid gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[#65526d]">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#65526d]">Shipping</span>
            <span className="font-medium">Calculated later</span>
          </div>
          <div className="flex justify-between border-t pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
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
