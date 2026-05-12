import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payment Not Completed | Unick Robins",
};

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4 py-16 text-center">
      <div className="rounded-3xl border border-white/10 bg-white/[0.96] p-8 text-[#24102f] shadow-xl shadow-black/20">
        <AlertCircle className="mx-auto size-14 text-[#9a7734]" />
        <h1 className="mt-5 text-3xl font-semibold">Payment not completed</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Your order has not been paid yet. You can return to checkout and try again.
        </p>
        {reason && <p className="mt-3 rounded-2xl bg-stone-100 px-4 py-3 text-xs text-stone-500">{reason}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-full">
            <Link href="/checkout">Return to checkout</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
