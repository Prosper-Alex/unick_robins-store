import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard } from "@/components/product/product-card";
import { ReviewForm } from "@/components/product/review-form";
import { getProductById, getProducts } from "@/src/services/products";
import { getProductReviews } from "@/src/services/reviews";
import { formatCurrency, formatDate } from "@/src/utils/format";
import {
  getCountryFromHeaders,
  getDisplayCurrencyForCountry,
  getProductPrice,
} from "@/src/utils/pricing";
import {
  getBenefits,
  getHairCompatibility,
  getHydrationLevel,
  getIngredients,
  getProductGallery,
  getProductSummary,
  getUsageInstructions,
  hasComplimentaryShipping,
  isTransferReady,
} from "@/src/utils/product-details";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const country = getCountryFromHeaders(await headers());
  const currency = getDisplayCurrencyForCountry(country);
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const products = await getProducts();
  const reviews = await getProductReviews(product.id);
  const related = products.filter((item) => item.id !== product.id).slice(0, 4);
  const bundle = products.filter((item) => item.id !== product.id).slice(0, 2);
  const reviewCount = reviews.length;
  const rating = reviewCount > 0
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviewCount
    : 0;

  return (
    <>
      <Navbar />
      <main className="bg-background">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10 lg:px-8">
          <div className="min-w-0">
            <Button asChild variant="ghost" className="mb-5">
              <Link href="/products">
                <ArrowLeft /> Back to shop
              </Link>
            </Button>
            <ProductGallery
              images={getProductGallery(product)}
              title={product.title}
            />
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">
              {product.category}
            </p>
            <h1 className="mt-4 text-[2.35rem] font-normal leading-[1.04] tracking-tight text-[#fff8df] sm:text-5xl">
              {product.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-violet-100">
              <span className="flex text-[#f6d87f]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-4 ${index < Math.round(rating) ? "fill-current" : ""}`}
                  />
                ))}
              </span>
              <span>{reviewCount > 0 ? `${rating.toFixed(1)} rating` : "No ratings yet"}</span>
              <span>{reviewCount} reviews</span>
            </div>
            <p className="mt-5 text-lg leading-8 text-violet-100">
              {getProductSummary(product)}
            </p>
            <p className="mt-8 text-2xl font-medium leading-[1.12] text-[#fff8df]">
              {formatCurrency(getProductPrice(product, currency), currency)}
            </p>
            <div className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-white/10 p-4 text-sm text-violet-50">
              <p className="flex items-center justify-between gap-4">
                <span>Hydration level</span>
                <span className="font-semibold text-[#f6d87f]">
                  {getHydrationLevel(product)}/5
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Check className="size-4 text-[#f6d87f]" /> {product.stock}{" "}
                units available
              </p>
              {hasComplimentaryShipping(product) && (
                <p className="flex items-center gap-2">
                  <Truck className="mt-0.5 size-4 shrink-0 text-[#f6d87f]" /> Complimentary
                  shipping available
                </p>
              )}
              {isTransferReady(product) && (
                <p className="flex items-center gap-2">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-[#f6d87f]" /> Transfer ready
                  finish
                </p>
              )}
            </div>
            <div className="mt-8">
              <AddToCartButton product={product} country={country} />
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full px-8">
                <Link href="/cart">View cart</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-violet-100 sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#f6d87f]" /> Delivery
                estimate: 2-4 business days
              </p>
              <p className="flex items-center gap-2">
                <PackageCheck className="mt-0.5 size-4 shrink-0 text-[#f6d87f]" /> Secure
                checkout architecture ready
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
          <ProductInfo title="Benefits" items={getBenefits(product)} />
          <ProductInfo
            title="How to use"
            items={getUsageInstructions(product)}
          />
          <ProductInfo title="Ingredients" items={getIngredients(product)} />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/96 p-6 text-[#24102f] shadow-xl shadow-black/10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b5a00]">
                  Frequently bought together
                </p>
                <h2 className="mt-3 text-2xl font-normal leading-[1.1] tracking-tight sm:text-3xl">
                  Build the complete crown ritual.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#65526d]">
                  Pair compatible formulas for cleanse-day polish, daily
                  hydration, and a finished style that still feels touchable.
                </p>
              </div>
              <div className="grid gap-3">
                {[product, ...bundle].map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3">
                    <span className="min-w-0 font-medium">{item.title}</span>
                    <span className="whitespace-nowrap">{formatCurrency(getProductPrice(item, currency), currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">
              Reviews
            </p>
            <h2 className="mt-3 text-2xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-3xl">
              Customer ratings
            </h2>
            <p className="mt-4 text-violet-100">
              {reviewCount > 0
                ? `${rating.toFixed(1)} average from ${reviewCount} customer review${reviewCount === 1 ? "" : "s"}.`
                : "Be the first to rate this product."}
            </p>
          </div>
          <div className="grid min-w-0 gap-4">
            <ReviewForm productId={product.id} />
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-white/10 bg-white/10 p-5 text-violet-50">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex text-[#f6d87f]">
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star key={star} className={`size-4 ${star < review.rating ? "fill-current" : ""}`} />
                      ))}
                    </div>
                    {review.verified_purchase && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-100">
                        <Check className="size-3.5" />
                        Verified purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h3 className="mb-2 text-lg font-semibold text-[#fff8df]">{review.title}</h3>
                  )}
                  <p className="leading-7">{review.body}</p>
                  <p className="mt-4 text-sm text-violet-200">
                    Customer review on {formatDate(review.created_at)}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-violet-100">
                No reviews have been posted for this product yet.
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-3 text-sm text-violet-100">
            <SpecRow
              label="Hair compatibility"
              value={getHairCompatibility(product).join(", ")}
            />
            <SpecRow
              label="Shipping"
              value="Complimentary threshold, tracked delivery, and payment-ready checkout flow."
            />
            <SpecRow
              label="Returns"
              value="Unopened products eligible for return within 14 days."
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <h2 className="mb-8 text-2xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-3xl">
            Complete the ritual
          </h2>
          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10 xl:gap-x-8">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} country={country} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ProductInfo({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 text-violet-50">
      <h2 className="text-xl font-normal leading-[1.12] tracking-tight text-[#fff8df] sm:text-2xl">
        {title}
      </h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <p key={item} className="flex gap-3 text-sm leading-6">
            <Check className="mt-1 size-4 shrink-0 text-[#f6d87f]" />
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <details className="rounded-2xl border border-white/10 bg-white/10 p-5">
      <summary className="cursor-pointer font-semibold text-[#fff8df]">
        {label}
      </summary>
      <p className="mt-3 leading-7">{value}</p>
    </details>
  );
}
