import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-16 text-white sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">Member access</p>
            <h1 className="mt-4 text-4xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-5xl">Return to your crown ritual.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-violet-100">
              Sign in to save wishlist products, preserve cart intent, and prepare for secure checkout.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20">
            <div className="mb-7 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#f6e7b7] text-[#31133f]">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-normal text-[#fff8df]">Sign in</h2>
                <p className="text-sm text-violet-100">New here? <Link href="/account/register" className="text-[#f6d87f]">Create an account</Link></p>
              </div>
            </div>
            <AuthForm mode="login" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
