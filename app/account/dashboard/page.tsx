import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { CreditCard, Package, ShieldCheck, User } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { OrderList } from "@/components/account/order-list";
import { Button } from "@/components/ui/button";
import { getAccountOrders } from "@/src/lib/account-server";
import { formatCurrency } from "@/src/utils/format";

const accountOutlineButton =
  "border-stone-300 bg-white text-[#24102f] hover:bg-[#fff8df] hover:text-[#24102f]";
const accountLinkButton = "text-[#9a7734] hover:text-[#5f4312]";

export const metadata = {
  title: "My Account | Unick Robins",
};

export default async function DashboardPage() {
  const { user, role, orders } = await getAccountOrders(3);

  if (role === "admin") {
    redirect("/admin");
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const latestOrder = orders[0];

  return (
    <AccountShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9a7734]">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-4xl">
              Your profile
            </h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-6">
            <section className="grid gap-4 sm:grid-cols-3">
              <AccountMetric
                icon={<Package className="size-5" />}
                label="Orders"
                value={orders.length.toString()}
              />
              <AccountMetric
                icon={<CreditCard className="size-5" />}
                label="Recent spend"
                value={formatCurrency(totalSpent)}
              />
              <AccountMetric
                icon={<ShieldCheck className="size-5" />}
                label="Account"
                value="Protected"
              />
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-5 text-[#24102f] sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-medium">Recent transactions</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    A quiet record of orders placed from this account.
                  </p>
                </div>
                <Button asChild variant="outline" className={`w-fit rounded-full ${accountOutlineButton}`}>
                  <Link href="/account/orders">View all</Link>
                </Button>
              </div>
              <OrderList orders={orders} compact />
            </section>
          </div>

          <aside className="grid h-fit gap-6">
            <section className="rounded-3xl border border-stone-200 bg-white p-5 text-[#24102f] sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#fff8df] text-[#7b5a18]">
                  <User className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-medium">Profile</h2>
                  <p className="text-sm text-stone-500">Signed in customer</p>
                </div>
              </div>
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-stone-500">Email</p>
                  <p className="break-all font-medium text-[#24102f]">{user.email}</p>
                </div>
                <div className="border-t border-stone-100 pt-4">
                  <Button asChild variant="outline" className={`w-full rounded-full ${accountOutlineButton}`}>
                    <Link href="/account/update-password">Change password</Link>
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5 text-[#24102f] sm:p-6">
              <h2 className="text-lg font-medium">Latest order</h2>
              {latestOrder ? (
                <div className="mt-4 text-sm">
                  <p className="font-medium">#{latestOrder.id.slice(0, 8)}</p>
                  <p className="mt-1 text-stone-500">{formatCurrency(latestOrder.total)}</p>
                  <Button asChild variant="link" className={`mt-2 h-auto px-0 ${accountLinkButton}`}>
                    <Link href={`/account/orders/${latestOrder.id}`}>Open details</Link>
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-stone-500">
                  Your first order will appear here after checkout.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </AccountShell>
  );
}

function AccountMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5 text-[#24102f]">
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-[#fff8df] text-[#7b5a18]">
        {icon}
      </div>
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-medium text-[#24102f]">{value}</p>
    </div>
  );
}
