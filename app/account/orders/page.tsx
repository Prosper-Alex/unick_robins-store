import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { OrderList } from "@/components/account/order-list";
import { Button } from "@/components/ui/button";
import { getAccountOrders } from "@/src/lib/account-server";

const accountLinkButton = "text-[#9a7734] hover:text-[#5f4312]";

export const metadata = {
  title: "Order History | Unick Robins",
};

export default async function OrdersPage() {
  const { orders } = await getAccountOrders();

  return (
    <AccountShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Button asChild variant="link" className={`mb-6 h-auto px-0 ${accountLinkButton}`}>
          <Link href="/account/dashboard">
            <ArrowLeft className="size-4" />
            Back to account
          </Link>
        </Button>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9a7734]">
            Transactions
          </p>
          <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-4xl">
            Order history
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">
            View each order tied to your signed-in account.
          </p>
        </div>

        <OrderList orders={orders} />
      </div>
    </AccountShell>
  );
}
