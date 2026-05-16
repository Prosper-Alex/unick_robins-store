import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUserProfile } from "@/src/lib/auth-profile";
import { authCookieNames, getSupabaseServerClient } from "@/src/lib/supabase-server";

const schema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.session) {
    return NextResponse.json({ error: getLoginErrorMessage(error?.message) }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(authCookieNames.access, data.session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: data.session.expires_in,
  });
  cookieStore.set(authCookieNames.refresh, data.session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  const { role } = await ensureUserProfile(data.user, data.session.access_token);

  return NextResponse.json({ user: data.user, role });
}

function getLoginErrorMessage(message?: string) {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("email not confirmed")) {
    return "Confirm your email address before signing in. Check your inbox for the confirmation link.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "We could not recognize that email and password combination.";
  }

  return message ?? "Login failed.";
}
