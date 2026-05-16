import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUserProfile } from "@/src/lib/auth-profile";
import { authCookieNames, getSupabaseServerClient } from "@/src/lib/supabase-server";

const schema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(8)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[\d\W_]/),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Use a valid email and a stronger password." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Use a valid email and a stronger password." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const emailRedirectTo = `${origin}/account/login`;

  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo,
    },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Registration failed." }, { status: 400 });
  }

  if (!data.session) {
    return NextResponse.json({
      user: data.user,
      role: "customer",
      requiresEmailConfirmation: true,
      message: "Account created. Check your email inbox and confirm your address before signing in.",
    });
  }

  const { role } = await ensureUserProfile(data.user, data.session.access_token);

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

  return NextResponse.json({ user: data.user, role });
}
