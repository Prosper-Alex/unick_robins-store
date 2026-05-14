import Link from "next/link";
import { LogOut, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export const metadata = {
  title: "Signed Out | Unick Robins",
};

export default function LogoutPage() {
  return (
    <>
      <Navbar />
      <main className="grid min-h-[70vh] place-items-center bg-background px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f6e7b7] text-[#24102f]">
            <LogOut className="size-6" />
          </span>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">
            Logged out
          </p>
          <h1 className="mt-3 text-3xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-4xl">
            Your account session has ended.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-violet-100/75">
            You can keep browsing the store or sign in again when you need your orders and saved account details.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button asChild className="h-11 rounded-full">
              <Link href="/products">
                <ShoppingBag className="size-4" />
                Continue shopping
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full border-white/20 bg-white/8 text-white hover:bg-white/12 hover:text-white">
              <Link href="/account/login">
                <UserRound className="size-4" />
                Sign in again
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
