"use client";

import { useState, useTransition } from "react";
import { Copy, CreditCard, Loader2, RefreshCw, XCircle } from "lucide-react";
import {
  cancelPendingPaymentAction,
  resumePendingPaymentAction,
} from "@/src/actions/account-orders";
import { rememberPendingPayment } from "@/components/checkout/payment-cart-reconciler";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type OrderActionsProps = {
  orderId: string;
  displayId: string;
  canManagePendingPayment: boolean;
};

const actionButtonClass = "h-10 rounded-full px-4 account-btn-lift";

export function OrderActions({
  orderId,
  displayId,
  canManagePendingPayment,
}: OrderActionsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingIntent, setPendingIntent] = useState<
    "continue" | "change" | "cancel" | null
  >(null);
  const [isPending, startTransition] = useTransition();

  async function copyOrderId() {
    try {
      await navigator.clipboard.writeText(displayId);
      setError(null);
      setMessage("Order ID copied.");
    } catch {
      setError("Copy failed. You can still select the order ID manually.");
    }
  }

  function resumePayment(intent: "continue" | "change") {
    setPendingIntent(intent);
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await resumePendingPaymentAction(orderId);

        if (result.reference) {
          rememberPendingPayment(result.reference);
        }

        window.location.href = result.authorizationUrl;
      } catch (err) {
        setPendingIntent(null);
        setError(
          err instanceof Error ? err.message : "Unable to open payment.",
        );
      }
    });
  }

  function cancelPayment() {
    setPendingIntent("cancel");
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await cancelPendingPaymentAction(orderId);
        setMessage(result.message);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to cancel pending payment.",
        );
      } finally {
        setPendingIntent(null);
      }
    });
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          Order ID
        </span>
        <code className="min-w-0 flex-1 break-all font-mono text-sm font-semibold account-text-ink">
          {displayId}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full account-btn-copy account-btn-lift hover:shadow-sm"
          onClick={copyOrderId}>
          <Copy className="size-3.5" />
          Copy
        </Button>
      </div>

      {canManagePendingPayment && (
        <div className="grid gap-3 rounded-2xl border account-border-gold account-bg-gold-soft p-4 account-text-ink">
          <div>
            <p className="font-medium">Payment is still pending</p>
            <p className="mt-1 text-sm leading-6 account-text-gold-muted">
              Your order is saved, but it will not be processed until payment is
              confirmed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className={`${actionButtonClass} account-btn-primary hover:shadow-lg hover:shadow-purple-950/15`}
              disabled={isPending}
              onClick={() => resumePayment("continue")}>
              {isPending && pendingIntent === "continue" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CreditCard />
              )}
              Continue payment
            </Button>
            <Button
              type="button"
              variant="outline"
              className={`${actionButtonClass} account-btn-outline hover:shadow-md hover:shadow-amber-900/10`}
              disabled={isPending}
              onClick={() => resumePayment("change")}>
              {isPending && pendingIntent === "change" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
              Change payment method
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className={`${actionButtonClass} account-btn-danger`}
                  disabled={isPending}>
                  <XCircle />
                  Cancel pending payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cancel this pending payment?</DialogTitle>
                  <DialogDescription>
                    This only cancels the unpaid order in your account. If your
                    bank later confirms a debit, we will move it to payment
                    review instead of processing it automatically.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Keep order
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    variant="destructive"
                    className={`${actionButtonClass} account-btn-danger`}
                    disabled={isPending}
                    onClick={cancelPayment}>
                    {isPending && pendingIntent === "cancel" ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <XCircle />
                    )}
                    Cancel pending payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {message && (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
