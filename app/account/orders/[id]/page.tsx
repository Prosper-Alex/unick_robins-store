import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { OrderStatus } from "@/components/account/order-list";
import { Button } from "@/components/ui/button";
import { getAccountOrder } from "@/src/lib/account-server";
import { formatCurrency, formatDate } from "@/src/utils/format";

const accountLinkButton = "text-[#9a7734] hover:text-[#5f4312]";

export const metadata = {
  title: "Order Details | Unick Robins",
};

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { order } = await getAccountOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <AccountShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Button asChild variant="link" className={`mb-6 h-auto px-0 ${accountLinkButton}`}>
          <Link href="/account/orders">
            <ArrowLeft className="size-4" />
            Back to orders
          </Link>
        </Button>

        <section className="rounded-3xl border border-stone-200 bg-white p-5 text-[#24102f] sm:p-7">
          <div className="flex flex-col gap-5 border-b border-stone-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-[#fff8df] text-[#7b5a18]">
                <ReceiptText className="size-5" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9a7734]">
                Receipt
              </p>
              <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="mt-2 text-sm text-stone-500">{formatDate(order.created_at)}</p>
            </div>
            <div className="grid gap-2 text-left sm:text-right">
              <OrderStatus status={order.status} />
              <p className="text-2xl font-medium text-[#24102f]">{formatCurrency(order.total)}</p>
            </div>
          </div>

          <div className="grid gap-4 py-6">
            {order.items.length === 0 ? (
              <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">
                This order has no item details attached.
              </p>
            ) : (
              order.items.map((item, index) => (
                <div
                  key={`${item.id ?? "item"}-${index}`}
                  className="grid gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-4 sm:grid-cols-[64px_1fr_auto] sm:items-center"
                >
                  <div className="relative size-16 overflow-hidden rounded-xl bg-white">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title ?? "Product"}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium text-[#24102f]">{item.title ?? "Product"}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      Qty {item.quantity ?? 1} · {formatCurrency(item.price ?? 0)} each
                    </p>
                  </div>
                  <p className="font-medium text-[#24102f]">
                    {formatCurrency((item.price ?? 0) * (item.quantity ?? 1))}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between border-t border-stone-100 pt-5 text-lg font-medium">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </section>
      </div>
    </AccountShell>
  );
}
