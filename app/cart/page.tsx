import { headers } from "next/headers";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { CartView } from "@/components/product/cart-view";
import { getCountryFromHeaders } from "@/src/utils/pricing";

export default async function CartPage() {
  const country = getCountryFromHeaders(await headers());

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <CartView initialCountry={country} />
      </main>
      <Footer />
    </>
  );
}
