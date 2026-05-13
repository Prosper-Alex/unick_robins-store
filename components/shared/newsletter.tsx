"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage-newsletter" }),
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setMessage(result.error ?? "subscription failed - try again later");
        return;
      }

      setSubscribed(true);
      setEmail("");
      setMessage(result.message ?? "You're on the list.");
    } catch {
      setMessage("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="relative overflow-hidden px-4 py-16 text-white sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(135deg, #1a0824 0%, #2d143a 45%, #1e0d2e 100%)",
      }}>
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
        <form className="grid gap-3" onSubmit={subscribe}>
          {subscribed ? (
            <p className="flex items-center gap-2 rounded-full border border-[#f6d87f]/30 bg-[#f6d87f]/10 px-5 py-3 text-sm font-medium text-[#f6d87f]">
              <Sparkles className="size-4" /> {message ?? "You're on the list."}
            </p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                required
                type="email"
                disabled={loading}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="h-12 rounded-full border-white/20 bg-white/10 px-5 text-white placeholder:text-violet-300 focus:bg-white/15"
              />
              <Button
                className="h-12 shrink-0 rounded-full px-6"
                disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ArrowRight />
                )}
                Join
              </Button>
            </div>
          )}
          {message && !subscribed && (
            <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-violet-100">
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
