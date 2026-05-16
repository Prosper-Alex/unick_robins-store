"use client";

import { useEffect } from "react";
import { useCartStore } from "@/src/store/cart-store";

const PENDING_PAYMENT_REFERENCE_KEY = "unick-robins-pending-payment-reference";

export function rememberPendingPayment(reference: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PENDING_PAYMENT_REFERENCE_KEY, reference);
}

export function forgetPendingPayment() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PENDING_PAYMENT_REFERENCE_KEY);
}

export function PaymentCartReconciler() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const reference = window.localStorage.getItem(PENDING_PAYMENT_REFERENCE_KEY);

    if (!reference) {
      return;
    }

    let cancelled = false;

    async function reconcilePayment() {
      try {
        const response = await fetch(`/api/payment-status?reference=${encodeURIComponent(reference!)}`);

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as {
          paid?: boolean;
          missing?: boolean;
          paymentStatus?: string;
        };

        if (cancelled) {
          return;
        }

        if (result.paid) {
          clearCart();
          forgetPendingPayment();
          return;
        }

        if (result.missing || result.paymentStatus === "payment_failed") {
          forgetPendingPayment();
        }
      } catch {
        // Keep the pending reference so a later visit can reconcile again.
      }
    }

    void reconcilePayment();

    return () => {
      cancelled = true;
    };
  }, [clearCart]);

  return null;
}
