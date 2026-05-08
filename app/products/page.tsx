import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { ProductCatalog } from "@/components/product/product-catalog";
import { getProducts } from "@/src/services/products";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">
              Shop rituals
            </p>
            <h1 className="mt-3 text-4xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-5xl">
              Hair care with a premium finish.
            </h1>
            <p className="mt-4 text-lg leading-8 text-violet-100">
              Search, filter, and build the ritual that matches your crown care routine.
            </p>
          </div>
          <ProductCatalog products={products} initialCategory={params.category ?? "All"} />
        </section>
      </main>
      <Footer />
    </>
  );
}
