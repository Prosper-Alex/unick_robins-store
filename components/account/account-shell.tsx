import type { ReactNode } from "react";
import Link from "next/link";
import { History, UserRound } from "lucide-react";
import { AccountSignOutButton } from "@/components/account/account-sign-out-button";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";

export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white">
        <div className="border-b border-white/10 bg-[#1a0824]/55">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="ghost" className="rounded-full text-violet-100 hover:bg-white/10 hover:text-[#fff8df]">
                <Link href="/account/dashboard">
                  <UserRound className="size-4" />
                  Account
                </Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full text-violet-100 hover:bg-white/10 hover:text-[#fff8df]">
                <Link href="/account/orders">
                  <History className="size-4" />
                  Orders
                </Link>
              </Button>
            </div>
            <AccountSignOutButton className="rounded-full border-white/15 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white" />
          </div>
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
