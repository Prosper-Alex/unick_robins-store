export function ProductSkeleton() {
  return (
    <div className="grid w-full gap-10">
      <div className="flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/96 p-4 shadow-sm shadow-black/10 md:flex-row md:items-center md:justify-between">
        <div className="skeleton-shimmer h-11 w-full rounded-full bg-violet-100 md:w-80" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="skeleton-shimmer h-9 w-24 shrink-0 rounded-full bg-violet-100"
            />
          ))}
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/97 shadow-sm shadow-black/10">
            <div className="skeleton-shimmer aspect-4/5 bg-violet-100" />
            <div className="grid gap-4 p-5">
              <div className="grid gap-2">
                <div className="skeleton-shimmer h-5 w-4/5 rounded bg-violet-100" />
                <div className="skeleton-shimmer h-4 w-full rounded bg-violet-100" />
                <div className="skeleton-shimmer h-4 w-2/3 rounded bg-violet-100" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="skeleton-shimmer h-7 w-20 rounded bg-violet-100" />
                <div className="skeleton-shimmer h-8 w-24 rounded-full bg-[#efe0ad]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
