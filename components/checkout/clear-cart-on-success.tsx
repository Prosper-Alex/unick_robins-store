"use client";

import { useEffect } from "react";
import { forgetPendingPayment } from "@/components/checkout/payment-cart-reconciler";
import { useCartStore } from "@/src/store/cart-store";

export function ClearCartOnSuccess() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
    forgetPendingPayment();
  }, [clearCart]);

  return null;
}
