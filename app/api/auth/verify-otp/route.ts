import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUserProfile } from "@/src/lib/auth-profile";
import { authCookieNames, getSupabaseServerClient } from "@/src/lib/supabase-server";

const schema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  token: z.string().trim().min(6, "Enter the verification code."),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid verification code." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid verification code." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "signup",
  });

  if (error || !data.session || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Verification failed." }, { status: 400 });
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
