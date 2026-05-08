import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authCookieNames, getSupabaseServerClient } from "@/src/lib/supabase-server";

const schema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message ?? "Login failed." }, { status: 401 });
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

  return NextResponse.json({ user: data.user });
}
