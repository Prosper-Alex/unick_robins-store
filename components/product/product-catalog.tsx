"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/src/types/product";

const PAGE_SIZE = 8;

export function ProductCatalog({
  products,
  initialCategory = "All",
  country,
}: {
  products: Product[];
  initialCategory?: string;
  country?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesQuery = [product.title, product.description, product.short_description, product.category]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <div className="grid min-w-0 gap-8 overflow-hidden sm:gap-10">
      <div className="grid min-w-0 gap-4 rounded-2xl border border-white/10 bg-white/[0.96] p-3 shadow-sm shadow-black/10 sm:p-4 lg:grid-cols-[minmax(260px,320px)_1fr] lg:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#65526d]" />
          <Input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search oils, creams, styling..."
            className="h-11 rounded-full pl-9"
          />
        </div>
        <div className="-mx-1 flex min-w-0 max-w-full gap-2 overflow-x-auto px-1 pb-1 lg:justify-end">
          {categories.map((item) => (
            <Button
              key={item}
              type="button"
              variant={category === item ? "default" : "outline"}
              className="shrink-0 rounded-full"
              onClick={() => updateCategory(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="flex flex-col gap-3 text-sm text-violet-100 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
            </p>
            {pageCount > 1 && (
              <p className="text-violet-200">Page {page} of {pageCount}</p>
            )}
          </div>

          <div className="grid w-full min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10 xl:gap-x-8">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} country={country} />
            ))}
          </div>

          {pageCount > 1 && (
            <nav className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/10 p-3 text-violet-50 sm:flex-row" aria-label="Product pagination">
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-full text-violet-50 hover:bg-white/10 sm:w-auto"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
              >
                <ChevronLeft /> Previous
              </Button>
              <div className="flex max-w-full gap-2 overflow-x-auto">
                {Array.from({ length: pageCount }).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <Button
                      key={pageNumber}
                      type="button"
                      variant={page === pageNumber ? "default" : "outline"}
                      size="icon"
                      className="rounded-full"
                      onClick={() => setPage(pageNumber)}
                      aria-current={page === pageNumber ? "page" : undefined}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-full text-violet-50 hover:bg-white/10 sm:w-auto"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={page === pageCount}
              >
                Next <ChevronRight />
              </Button>
            </nav>
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-violet-200 bg-white/[0.96] px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-[#24102f]">No products found</h2>
          <p className="mt-2 text-sm text-[#65526d]">Try another category or search term.</p>
        </div>
      )}
    </div>
  );
}
