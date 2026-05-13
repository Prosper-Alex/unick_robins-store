"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/src/store/cart-store";
import { createOrderAction } from "@/src/actions/checkout";
import { formatCurrency } from "@/src/utils/format";
import {
  getClientCountryFallback,
  getDisplayCurrencyForCountry,
  getProductPrice,
  getShippingFee,
} from "@/src/utils/pricing";

export function CheckoutForm({ initialCountry }: { initialCountry?: string | null }) {
  const router = useRouter();
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [country, setCountry] = useState(initialCountry === "NG" ? "Nigeria" : initialCountry ?? "");
  const currency = getDisplayCurrencyForCountry(country);

  useEffect(() => {
    queueMicrotask(() => {
      if (!initialCountry) {
        const fallbackCountry = getClientCountryFallback();
        if (fallbackCountry === "NG") {
          setCountry("Nigeria");
        }
      }
      setMounted(true);
    });
  }, [initialCountry]);

  const subtotal = items.reduce(
    (sum, item) => sum + getProductPrice(item, currency) * item.quantity,
    0,
  );
  const shippingFee = getShippingFee(currency, deliveryMethod);
  const total = subtotal + shippingFee;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await createOrderAction(items, {
        email: String(formData.get("email") ?? ""),
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? ""),
        city: String(formData.get("city") ?? ""),
        state: String(formData.get("state") ?? ""),
        country: String(formData.get("country") ?? ""),
        postalCode: String(formData.get("postalCode") ?? ""),
        deliveryMethod,
      });

      window.location.href = result.authorizationUrl;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Checkout failed. Please try again.",
      );
      setLoading(false);
    }
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl text-stone-500">Your cart is empty</h2>
        <Button
          onClick={() => router.push("/products")}
          variant="outline"
          className="mt-4 rounded-full">
          Return to store
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/97 p-4 shadow-xl shadow-black/10 sm:p-6">
          <h2 className="mb-4 text-xl font-medium text-[#24102f]">Shipping Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">First name</label>
              <Input
                name="firstName"
                autoComplete="given-name"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Last name</label>
              <Input
                name="lastName"
                autoComplete="family-name"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                name="address"
                autoComplete="street-address"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">City</label>
              <Input
                name="city"
                autoComplete="address-level2"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">State</label>
              <Input
                name="state"
                autoComplete="address-level1"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Country</label>
              <Input
                name="country"
                autoComplete="country-name"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Postal code</label>
              <Input
                name="postalCode"
                autoComplete="postal-code"
                required
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/97 p-4 shadow-xl shadow-black/10 sm:p-6">
          <h2 className="mb-4 text-xl font-medium text-[#24102f]">Delivery & Payment</h2>
          <div className="grid gap-4">
            <label className="grid cursor-pointer gap-2 rounded-2xl border border-stone-200 bg-white p-4 has-checked:border-[#d6b25e] has-checked:bg-[#fff8df]">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">Standard delivery</span>
                <span className="text-sm text-stone-500">Free</span>
              </span>
              <span className="flex items-start gap-3 text-sm leading-6 text-stone-500">
                <input
                  type="radio"
                  name="delivery"
                  value="standard"
                  checked={deliveryMethod === "standard"}
                  onChange={() => setDeliveryMethod("standard")}
                />
                3-5 business days after payment confirmation.
              </span>
            </label>
            <label className="grid cursor-pointer gap-2 rounded-2xl border border-stone-200 bg-white p-4 has-checked:border-[#d6b25e] has-checked:bg-[#fff8df]">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">Express delivery</span>
                <span className="text-sm text-stone-500">
                  {formatCurrency(getShippingFee(currency, "express"), currency)}
                </span>
              </span>
              <span className="flex items-start gap-3 text-sm leading-6 text-stone-500">
                <input
                  type="radio"
                  name="delivery"
                  value="express"
                  checked={deliveryMethod === "express"}
                  onChange={() => setDeliveryMethod("express")}
                />
                Priority dispatch for urgent orders.
              </span>
            </label>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-950">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <p className="font-medium">Secured by Paystack</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    You will be redirected to Paystack to complete payment. The
                    order is marked paid only after Paystack verifies the
                    transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-xl shadow-black/10 sm:p-6 lg:sticky lg:top-28">
          <h2 className="mb-4 text-lg font-medium">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
                <span className="min-w-0 text-stone-600">
                  {item.quantity}x {item.title}
                </span>
                <span className="whitespace-nowrap font-medium">
                  {formatCurrency(getProductPrice(item, currency) * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-stone-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Shipping</span>
              <span className="font-medium">
                {shippingFee > 0 ? formatCurrency(shippingFee, currency) : "Free"}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg font-medium">
            <span>Total</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full rounded-full text-base sm:text-lg">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <CreditCard className="size-5" /> Pay {formatCurrency(total, currency)}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
