import { AuthContainer } from "@/components/auth/auth-container";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-16 text-white sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">Private client profile</p>
            <h1 className="mt-4 text-4xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-5xl">Your beauty ritual, unified.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-violet-100">
              Sign in or create an account to save favorites, preserve cart intent, and prepare for secure checkout.
            </p>
          </div>
          <AuthContainer />
        </section>
      </main>
      <Footer />
    </>
  );
}
