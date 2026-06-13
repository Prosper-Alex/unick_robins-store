export function ProductSkeleton() {
  return (
    <div className="grid w-full gap-6 sm:gap-8 lg:gap-10">
      <div className="grid w-full gap-3 rounded-2xl border border-white/10 bg-[#181818] p-3 shadow-lg shadow-black/15 sm:p-4 md:grid-cols-[minmax(0,20rem)_1fr] md:items-center">
        <div className="skeleton-shimmer h-10 w-full rounded-full bg-[#2a2a2a] sm:h-11" />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end sm:overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="skeleton-shimmer h-8 w-full shrink-0 rounded-full bg-[#2a2a2a] sm:h-9 sm:w-24"
            />
          ))}
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={`h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-[0_18px_44px_-30px_rgba(0,0,0,0.65)] ${
              index >= 4 ? "hidden sm:block" : ""
            }`}>
            <div className="skeleton-shimmer aspect-[16/11] bg-[#2a2a2a] sm:aspect-4/5" />
            <div className="grid gap-3 p-4 sm:gap-4 sm:p-5">
              <div className="grid gap-2">
                <div className="skeleton-shimmer h-5 w-4/5 rounded bg-[#303030]" />
                <div className="skeleton-shimmer h-4 w-full rounded bg-[#2a2a2a]" />
                <div className="skeleton-shimmer h-4 w-2/3 rounded bg-[#2a2a2a]" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="skeleton-shimmer h-7 w-20 rounded bg-[#303030]" />
                <div className="skeleton-shimmer h-8 w-24 rounded-full bg-[#3a3a3a]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
