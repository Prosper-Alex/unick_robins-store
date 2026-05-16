import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { CartView } from "@/components/product/cart-view";

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <CartView />
      </main>
      <Footer />
    </>
  );
}
