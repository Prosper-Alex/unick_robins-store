"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createReviewAction } from "@/src/actions/reviews";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (rating === 0) {
      setMessage("Choose a star rating before saving your review.");
      setSubmitting(false);
      return;
    }

    try {
      await createReviewAction({ productId, title, rating, body });
      setTitle("");
      setBody("");
      setRating(0);
      setHoverRating(0);
      setMessage("Review saved. It is now visible on this product.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Review could not be posted.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-white/10 bg-white/9 p-5 text-violet-50 shadow-xl shadow-black/10 sm:p-6">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div>
          <h3 className="text-lg font-semibold text-[#fff8df]">
            Rate this product
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-violet-100/70">
            Choose a star rating, then share what changed after using it.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#1a0824]/45 p-3">
          <div className="flex justify-center gap-1.5 text-[#f6d87f]">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              const activeRating = hoverRating || rating;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="rounded-lg p-1.5 transition hover:bg-white/10 focus-visible:bg-white/10"
                  aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}>
                  <Star
                    className={`size-6 transition ${value <= activeRating ? "fill-current text-[#f6d87f]" : "text-violet-100/35"}`}
                  />
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs font-medium text-violet-100/65">
            {rating > 0 ? `${rating} of 5 selected` : "No rating selected"}
          </p>
        </div>
      </div>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={80}
        className="mt-6 h-12 w-full rounded-2xl border border-white/10 bg-white px-4 text-sm text-[#24102f] outline-none transition placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-[#f6d87f]"
        placeholder="Short title, e.g. Perfect for dry ends"
      />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        required
        minLength={8}
        maxLength={600}
        className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-[#24102f] outline-none transition focus-visible:ring-2 focus-visible:ring-[#f6d87f]"
        placeholder="Share what changed after using it..."
      />
      <div className="mt-2 flex justify-between gap-3 text-xs text-violet-100/60">
        <span>Minimum 8 characters</span>
        <span>{body.length}/600</span>
      </div>
      {message && (
        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm">
          {message}
        </p>
      )}
      <Button
        className="mt-5 h-11 w-full rounded-full px-6 sm:w-auto"
        disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <Send />}
        Save review
      </Button>
    </form>
  );
}
