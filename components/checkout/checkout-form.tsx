"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/src/store/cart-store";
import { createOrderAction } from "@/src/actions/checkout";
import { formatCurrency } from "@/src/utils/format";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const orderId = await createOrderAction(items, total);
      clearCart();
      setSuccessId(orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
      setLoading(false);
    }
  }

  if (!mounted) return null;

  if (successId) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <CheckCircle2 className="size-16 text-green-500" />
        <h2 className="text-3xl font-normal text-[#24102f]">Order Confirmed!</h2>
        <p className="text-stone-500">Your order #{successId.split("-")[0]} has been securely placed.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => router.push("/account/orders")} variant="outline" className="rounded-full px-8">
            View transactions
          </Button>
          <Button onClick={() => router.push("/products")} className="rounded-full px-8">
            Continue shopping
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl text-stone-500">Your cart is empty</h2>
        <Button onClick={() => router.push("/products")} variant="outline" className="mt-4 rounded-full">
          Return to store
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-8 md:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium mb-4">Shipping Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">First name</label>
              <Input required className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Last name</label>
              <Input required className="rounded-xl" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Input required className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">City</label>
              <Input required className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Postal code</label>
              <Input required className="rounded-xl" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4">Payment Details</h2>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm text-stone-500 mb-4">This is a secure mock checkout. No real card is needed.</p>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Card number</label>
                <Input placeholder="0000 0000 0000 0000" required className="rounded-xl bg-white" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Expiry date</label>
                  <Input placeholder="MM/YY" required className="rounded-xl bg-white" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">CVC</label>
                  <Input placeholder="123" required className="rounded-xl bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="sticky top-24 rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-stone-600">{item.quantity}x {item.title}</span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-200 pt-4 flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full mt-6 rounded-full h-12 text-lg">
            {loading ? <Loader2 className="animate-spin" /> : `Pay ${formatCurrency(total)}`}
          </Button>
        </div>
      </div>
    </form>
  );
}
