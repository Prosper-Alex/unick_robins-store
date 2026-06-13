import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="grid gap-8" aria-live="polite" aria-busy="true">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_56px_-34px_rgba(0,0,0,0.75)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="h-3 w-36 rounded-full bg-[#d6b25e]/35" />
            <div className="mt-4 h-9 w-full max-w-sm rounded-full bg-white/12" />
            <div className="mt-4 grid max-w-2xl gap-2">
              <div className="h-3 rounded-full bg-violet-100/12" />
              <div className="h-3 w-3/4 rounded-full bg-violet-100/10" />
            </div>
          </div>
          <div className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-[#d6b25e] text-[#24102f] sm:flex">
            <Loader2 className="size-5 animate-spin" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-[0_14px_34px_-28px_rgba(0,0,0,0.72)]"
          >
            <div className="h-3 w-24 rounded-full bg-violet-100/15" />
            <div className="mt-4 h-7 w-20 rounded-full bg-[#f6e7b7]/25" />
            <div className="mt-3 h-3 w-32 rounded-full bg-violet-100/10" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-6 shadow-[0_22px_60px_-36px_rgba(0,0,0,0.78)]">
          <div className="h-5 w-40 rounded-full bg-white/15" />
          <div className="mt-6 grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#1a0824]/65 px-4 py-3"
              >
                <div className="grid flex-1 gap-2">
                  <div className="h-4 w-28 rounded-full bg-violet-100/14" />
                  <div className="h-3 w-20 rounded-full bg-violet-100/10" />
                </div>
                <div className="h-4 w-16 rounded-full bg-[#f6e7b7]/22" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-6 shadow-[0_18px_46px_-34px_rgba(0,0,0,0.72)]">
          <div className="h-5 w-32 rounded-full bg-white/15" />
          <div className="mt-6 grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 rounded-xl bg-[#24102f] ring-1 ring-white/10"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
