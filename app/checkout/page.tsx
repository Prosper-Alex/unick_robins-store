import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export const metadata = {
  title: "Secure Checkout | Unick Robins",
  description: "Complete your Unick Robins order securely.",
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-[#24102f]">
        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">
              Checkout
            </p>
            <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-4xl md:text-5xl">
              Secure payment
            </h1>
          </div>
          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
