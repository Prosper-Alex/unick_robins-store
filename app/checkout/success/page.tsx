import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payment Successful | Unick Robins",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4 py-16 text-center">
      <ClearCartOnSuccess />
      <div className="rounded-3xl border border-white/10 bg-white/[0.96] p-8 text-[#24102f] shadow-xl shadow-black/20">
        <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
        <h1 className="mt-5 text-3xl font-semibold">Payment confirmed</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Your Paystack payment was verified and your order is now in processing.
        </p>
        {order && <p className="mt-3 font-mono text-sm text-stone-500">Order #{order.slice(0, 8)}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-full">
            <Link href={order ? `/account/orders/${order}` : "/account/orders"}>View order</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
