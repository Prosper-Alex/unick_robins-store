import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authCookieNames, getAuthenticatedSupabaseServerClient, getSupabaseServerClient } from "@/src/lib/supabase-server";
import { isRateLimited } from "@/src/lib/rate-limit";

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
  // Rate limiting: 3 requests per minute
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`register:${ip}`, 3, 60 * 1000)) {
    return NextResponse.json({ error: "Too many registration attempts. Try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Use a valid email and a stronger password." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Registration failed." }, { status: 400 });
  }

  let role = "customer";

  if (data.session) {
    const authenticatedSupabase = getAuthenticatedSupabaseServerClient(data.session.access_token);
    const { data: userData } = authenticatedSupabase
      ? await authenticatedSupabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single()
      : { data: null };

    role = userData?.role || "customer";

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

  return NextResponse.json({ user: data.user, role });
}
