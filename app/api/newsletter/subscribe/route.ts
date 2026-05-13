import { NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/src/lib/rate-limit";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/src/lib/supabase-server";

const schema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  source: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`newsletter:${ip}`, 6, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many subscribe attempts. Try again later." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const adminSupabase = getSupabaseAdminClient();
  const supabase = adminSupabase ?? getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Newsletter signup is not configured." },
      { status: 500 },
    );
  }

  const payload = {
    email: parsed.data.email,
    status: "subscribed",
    source: parsed.data.source ?? "website",
    updated_at: new Date().toISOString(),
  };

  const query = adminSupabase
    ? supabase.from("newsletter_subscribers").upsert(payload, { onConflict: "email" })
    : supabase.from("newsletter_subscribers").insert(payload);

  const { error } = await query;

  if (error) {
    console.error("Newsletter subscribe failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    if (error.code === "23505") {
      return NextResponse.json({
        message: "You're already on the list.",
      });
    }

    return NextResponse.json(
      { error: "Could not add you to the list. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "You're on the list.",
  });
}
