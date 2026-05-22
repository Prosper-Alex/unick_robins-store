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
import { OdometerValue } from "@/components/shared/odometer-value";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard } from "@/components/product/product-card";
import { ReviewForm } from "@/components/product/review-form";
import { getProductById, getProducts } from "@/src/services/products";
import { getProductReviews } from "@/src/services/reviews";
import type { ProductReview } from "@/src/types/review";
import { formatCurrency, formatDate } from "@/src/utils/format";
import {
  getDisplayCurrencyForCountry,
  getProductPrice,
} from "@/src/utils/pricing";
import {
  getHairCompatibility,
  getHydrationLevel,
  getProductDetailSections,
  getProductGallery,
  getProductSummary,
  hasComplimentaryShipping,
  isTransferReady,
} from "@/src/utils/product-details";

export async function generateStaticParams() {
  const products = await getProducts();

  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currency = getDisplayCurrencyForCountry();
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const products = await getProducts();
  const reviews = await getProductReviews(product.id);
  const related = products.filter((item) => item.id !== product.id).slice(0, 4);
  const bundle = products.filter((item) => item.id !== product.id).slice(0, 2);
  const ratingSummary = getRatingSummary(reviews);
  const { reviewCount, rating } = ratingSummary;

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
              <OdometerValue value={getProductPrice(product, currency)} currency={currency} />
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
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <AddToCartButton product={product} />
              <Button
                asChild
                variant="outline"
                className="h-12 min-w-[9.25rem] rounded-full border-white/25 bg-white/10 px-8 text-[#fff8df] hover:bg-[#fff8df] hover:text-[#24102f] active:bg-[#f6e7b7] disabled:bg-white/10 disabled:text-[#fff8df]">
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
          {getProductDetailSections(product).map((section) => (
            <ProductInfo
              key={section.title}
              title={section.title}
              items={section.items}
            />
          ))}
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
                <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">
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
            <RatingSummary summary={ratingSummary} />
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
              <ProductCard key={item.id} product={item} />
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

type RatingSummaryData = {
  rating: number;
  reviewCount: number;
  distribution: Array<{
    stars: number;
    count: number;
    percentage: number;
  }>;
};

function getRatingSummary(reviews: ProductReview[]): RatingSummaryData {
  const reviewCount = reviews.length;
  const counts = new Map<number, number>(
    [5, 4, 3, 2, 1].map((stars) => [stars, 0]),
  );

  for (const review of reviews) {
    const stars = Math.min(5, Math.max(1, Math.round(review.rating)));
    counts.set(stars, (counts.get(stars) ?? 0) + 1);
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  const rating = reviewCount > 0 ? total / reviewCount : 0;

  return {
    rating,
    reviewCount,
    distribution: [5, 4, 3, 2, 1].map((stars) => {
      const count = counts.get(stars) ?? 0;

      return {
        stars,
        count,
        percentage: reviewCount > 0 ? (count / reviewCount) * 100 : 0,
      };
    }),
  };
}

function RatingSummary({ summary }: { summary: RatingSummaryData }) {
  const { rating, reviewCount, distribution } = summary;

  return (
    <div className="mt-5 rounded-3xl border border-white/10 bg-white/10 p-5 text-violet-50 shadow-xl shadow-black/10">
      <div className="grid gap-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center">
        <div>
          <p className="text-5xl font-semibold leading-none text-[#fff8df]">
            {reviewCount > 0 ? rating.toFixed(1) : "0.0"}
          </p>
          <div className="mt-3 flex text-[#f6d87f]" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`size-4 ${index < Math.round(rating) ? "fill-current" : "text-violet-100/35"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-violet-100/70">
            {reviewCount} rating{reviewCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="grid gap-2">
          {distribution.map((item) => (
            <div key={item.stars} className="grid grid-cols-[1.8rem_minmax(0,1fr)_2rem] items-center gap-2 text-xs text-violet-100/75">
              <span className="font-mono">{item.stars}</span>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#f6d87f] transition-[width] duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-right font-mono">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-violet-100/70">
        Ratings are averaged from published customer reviews. New reviews count as soon as they are saved.
      </p>
    </div>
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
