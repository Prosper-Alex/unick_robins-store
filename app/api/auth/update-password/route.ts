import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authCookieNames,
  getAuthenticatedSupabaseServerClient,
  getSupabaseAdminClient,
  getSupabaseServerClient,
} from "@/src/lib/supabase-server";

const schema = z.object({
  password: z
    .string()
    .min(8)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[\d\W_]/),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Use a stronger password." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { password, access_token, refresh_token } = parsed.data;
  const cookieStore = await cookies();
  let userId: string | null = null;
  let sessionAccessToken = access_token ?? cookieStore.get(authCookieNames.access)?.value ?? null;
  let sessionExpiresIn: number | undefined;
  let sessionRefreshToken: string | undefined;

  if (access_token) {
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || "",
    });

    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: "The reset link has expired or is invalid. Please request a new one." }, { status: 401 });
    }

    userId = sessionData.user?.id ?? null;
    sessionAccessToken = sessionData.session.access_token;
    sessionRefreshToken = sessionData.session.refresh_token;
    sessionExpiresIn = sessionData.session.expires_in;
  }

  if (!sessionAccessToken) {
    return NextResponse.json({ error: "Please sign in or use a valid password reset link." }, { status: 401 });
  }

  const authenticatedSupabase = getAuthenticatedSupabaseServerClient(sessionAccessToken);

  if (!authenticatedSupabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const {
    data: { user },
    error: userError,
  } = await authenticatedSupabase.auth.getUser(sessionAccessToken);

  if (userError || !user) {
    return NextResponse.json({ error: "Your session has expired. Please verify your reset code again." }, { status: 401 });
  }

  const adminSupabase = getSupabaseAdminClient();

  if (!adminSupabase) {
    return NextResponse.json({ error: "Supabase admin access is not configured." }, { status: 500 });
  }

  const { data, error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
    password,
  });

  if (updateError || !data.user) {
    return NextResponse.json({ error: updateError?.message ?? "Failed to update password." }, { status: 400 });
  }

  let role = "customer";
  userId = userId ?? data.user.id;

  if (access_token && sessionAccessToken && sessionExpiresIn) {
    cookieStore.set(authCookieNames.access, sessionAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: sessionExpiresIn,
    });
    
    if (sessionRefreshToken) {
      cookieStore.set(authCookieNames.refresh, sessionRefreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  }

  const { data: userData } = await authenticatedSupabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  role = userData?.role ?? role;

  return NextResponse.json({ success: true, role });
}
