"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-[#2d143a] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">
            Crown notes
          </p>
          <h2 className="mt-3 text-2xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-3xl">
            Private drops, salon rituals, and early product access.
          </h2>
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <Input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="h-12 rounded-full bg-white px-5 text-[#24102f]"
          />
          <Button className="h-12 rounded-full px-6">
            Join <ArrowRight />
          </Button>
          {submitted && <p className="text-sm text-violet-100 sm:hidden">You are on the list.</p>}
        </form>
      </div>
    </section>
  );
}
