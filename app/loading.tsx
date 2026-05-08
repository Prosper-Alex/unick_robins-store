import { ProductSkeleton } from "@/components/product/product-skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductSkeleton />
      </section>
    </main>
  );
}
