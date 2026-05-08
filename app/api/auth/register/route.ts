import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authCookieNames, getSupabaseServerClient } from "@/src/lib/supabase-server";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Use a valid email and a password with at least 8 characters." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Registration failed." }, { status: 400 });
  }

  await supabase.from("users").upsert({
    id: data.user.id,
    email: data.user.email,
    role: "customer",
  });

  if (data.session) {
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
  }

  return NextResponse.json({ user: data.user });
}
