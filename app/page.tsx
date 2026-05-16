import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Newsletter } from "@/components/shared/newsletter";
import { ProductCard } from "@/components/product/product-card";
import { getProducts } from "@/src/services/products";

export default async function Home() {
  const products = await getProducts();
  const featured = products.slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="bg-background">
        <section className="relative isolate flex min-h-[calc(100svh-4rem)] overflow-hidden bg-[#1a0824] text-white">
          <div className="pointer-events-none absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&q=85"
              alt="Luxury beauty products"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a0824] via-[#24102f]/88 to-[#1a0824]/35" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
          </div>
          <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="max-w-3xl pb-8 sm:pb-12">
              <div className="animate-fade-up mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs backdrop-blur sm:px-4 sm:text-sm">
                <Sparkles className="size-4 text-[#f6d87f]" />
                <span className="truncate">Premium hair rituals for a polished crown</span>
              </div>
              <h1 className="animate-fade-up-delay-1 max-w-4xl text-[2.65rem] font-normal leading-[1.05] tracking-tight text-[#fff8df] sm:text-6xl sm:leading-[1.03] lg:text-7xl">
                Luxury care for every strand, edge, and finish.
              </h1>
              <p className="animate-fade-up-delay-2 mt-5 max-w-2xl text-base leading-7 text-violet-100 sm:mt-6 sm:text-lg sm:leading-8">
                High-performance hair essentials designed with clean textures, luminous shine, and salon-level polish.
              </p>
              <div className="animate-fade-up-delay-2 mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row">
                <Button asChild className="gold-glow h-12 rounded-full px-6 sm:px-7">
                  <Link href="/products">
                    Shop the collection <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full border-white/30 bg-white/10 px-6 text-white hover:bg-white hover:text-[#24102f] sm:px-7">
                  <Link href="/products?category=Hair%20Oil">Explore hair oils</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 sm:py-10 lg:gap-5 lg:px-8">
          {[
            ["Clean finish", "No heavy residue, no dull cast."],
            ["Salon polish", "Rituals built for shine and control."],
            ["Texture first", "Made for curls, coils, waves, and silk press care."],
          ].map(([title, copy]) => (
            <div key={title} className="card-lift rounded-2xl border border-white/10 bg-white/[0.96] p-5 shadow-sm shadow-black/10">
              <ShieldCheck className="mb-4 size-5 text-[#8b5a00]" />
              <h2 className="font-heading text-base font-semibold text-[#24102f]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#65526d]">{copy}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">Featured</p>
              <h2 className="mt-3 text-3xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-4xl">Best-selling rituals</h2>
            </div>
            <Button asChild variant="outline" className="w-fit rounded-full">
              <Link href="/products">View all products</Link>
            </Button>
          </div>
          <div className="grid w-full grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="bg-[#fff8f0] px-4 py-14 sm:px-6 sm:py-16 lg:px-8" style={{background: "linear-gradient(135deg, #fff8f0 0%, #fdf0f8 50%, #f9f0ff 100%)"}}>
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
            <div className="relative isolate aspect-[4/5] max-h-[720px] overflow-hidden rounded-[1.5rem] bg-violet-100 shadow-2xl shadow-[#1a0824]/20 sm:rounded-[2rem]">
              <Image
                src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=85"
                alt="Premium salon ritual"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="max-w-2xl">
              <div className="mb-5 flex gap-1 text-[#8b5a00]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-5 fill-current" />
                ))}
              </div>
              <h2 className="text-3xl font-normal leading-[1.1] tracking-tight text-[#24102f] sm:text-4xl">
                Built like skincare. Finished like luxury hair.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#65526d] sm:text-lg sm:leading-8">
                Every formula is designed around touch, shine, and consistency, so your routine feels considered from wash day to final detail.
              </p>
            </div>
          </div>
        </section>

        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
