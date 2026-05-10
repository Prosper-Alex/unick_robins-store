import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = {
  title: "Secure Checkout | Unick Robins",
  description: "Complete your Unick Robins order securely.",
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-24">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9a7734]">
          Checkout
        </p>
        <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
          Secure payment
        </h1>
      </div>
      <CheckoutForm />
    </div>
  );
}
