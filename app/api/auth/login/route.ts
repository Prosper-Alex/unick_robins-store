import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUserProfile } from "@/src/lib/auth-profile";
import { setAuthCookies } from "@/src/lib/auth-session";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/src/lib/supabase-server";

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
    return NextResponse.json(
      { error: await getLoginErrorMessage(error?.message, parsed.data.email) },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, data.session);

  const { role } = await ensureUserProfile(data.user, data.session.access_token);

  return NextResponse.json({ user: data.user, role });
}

async function getLoginErrorMessage(message?: string, email?: string) {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("email not confirmed")) {
    return "Verify your email before signing in. Check your inbox for the one-time code.";
  }

  if (normalized.includes("invalid login credentials")) {
    if (email && (await isUnconfirmedUser(email))) {
      return "Verify your email before signing in. Check your inbox for the one-time code.";
    }

    return "We could not recognize that email and password combination.";
  }

  return message ?? "Login failed.";
}

async function isUnconfirmedUser(email: string) {
  const adminSupabase = getSupabaseAdminClient();

  if (!adminSupabase) {
    return false;
  }

  const { data, error } = await adminSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = data.users.find((candidate) => candidate.email?.trim().toLowerCase() === normalizedEmail);

  return Boolean(user && !user.email_confirmed_at);
}
