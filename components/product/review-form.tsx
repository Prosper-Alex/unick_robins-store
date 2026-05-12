"use client";

import { useState } from "react";
import { Loader2, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createReviewAction } from "@/src/actions/reviews";

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await createReviewAction({ productId, title, rating, body });
      setTitle("");
      setBody("");
      setRating(5);
      setMessage("Review saved. It is now visible on this product.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review could not be posted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/10 p-4 text-violet-50 shadow-xl shadow-black/10 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#fff8df]">Rate this product</h3>
          <p className="mt-1 text-sm text-violet-100/70">Signed-in customers can post one review per product.</p>
        </div>
        <div className="flex shrink-0 gap-1 text-[#f6d87f]">
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
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={80}
        className="mt-4 h-12 w-full rounded-2xl border border-white/10 bg-white px-4 text-sm text-[#24102f] outline-none transition placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-[#f6d87f]"
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
      {message && <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm">{message}</p>}
      <Button className="mt-4 w-full rounded-full sm:w-auto" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <Send />}
        Save review
      </Button>
    </form>
  );
}
