"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      className="relative overflow-hidden px-4 py-16 text-white sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(135deg, #1a0824 0%, #2d143a 45%, #1e0d2e 100%)",
      }}
    >
      {/* Decorative gold blur orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 size-72 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #f6d87f, transparent 70%)" }}
      />
      <div className="relative mx-auto grid max-w-5xl gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">
            <Sparkles className="size-3.5" />
            Crown notes
          </p>
          <h2 className="mt-3 text-2xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-3xl">
            Private drops, salon rituals, and early product access.
          </h2>
          <p className="mt-3 text-sm leading-6 text-violet-200">
            Join thousands of ritual-obsessed subscribers.
          </p>
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          {submitted ? (
            <p className="flex items-center gap-2 rounded-full border border-[#f6d87f]/30 bg-[#f6d87f]/10 px-5 py-3 text-sm font-medium text-[#f6d87f]">
              <Sparkles className="size-4" /> You&apos;re on the list.
            </p>
          ) : (
            <>
              <Input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="h-12 rounded-full border-white/20 bg-white/10 px-5 text-white placeholder:text-violet-300 focus:bg-white/15"
              />
              <Button className="h-12 shrink-0 rounded-full px-6">
                Join <ArrowRight />
              </Button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
