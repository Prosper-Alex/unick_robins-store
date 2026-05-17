import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/src/lib/supabase-server";
import { isRateLimited } from "@/src/lib/rate-limit";

const schema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
});

export async function POST(request: Request) {
  // Rate limiting: 3 requests per 5 minutes
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`forgot:${ip}`, 3, 5 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many password reset attempts. Try again later." }, { status: 429 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    message: "Check your email for the one-time password reset code.",
  });
}
