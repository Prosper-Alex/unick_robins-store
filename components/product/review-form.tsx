"use client";

import { useState } from "react";
import { Loader2, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createReviewAction } from "@/src/actions/reviews";

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await createReviewAction({ productId, rating, body });
      setBody("");
      setRating(5);
      setMessage("Review posted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review could not be posted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/10 p-5 text-violet-50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#fff8df]">Rate this product</h3>
        <div className="flex gap-1 text-[#f6d87f]">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="rounded-md p-1 transition hover:bg-white/10"
                aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
              >
                <Star className={`size-5 ${value <= rating ? "fill-current" : ""}`} />
              </button>
            );
          })}
        </div>
      </div>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        required
        minLength={8}
        maxLength={600}
        className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-[#24102f] outline-none transition focus-visible:ring-2 focus-visible:ring-[#f6d87f]"
        placeholder="Share what changed after using it..."
      />
      {message && <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm">{message}</p>}
      <Button className="mt-4 rounded-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <Send />}
        Post review
      </Button>
    </form>
  );
}
