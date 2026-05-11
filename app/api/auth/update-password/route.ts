import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authCookieNames, getAuthenticatedSupabaseServerClient, getSupabaseServerClient } from "@/src/lib/supabase-server";

const schema = z.object({
  password: z
    .string()
    .min(8)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[\d\W_]/),
  access_token: z.string(),
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

  // First, we need to set the session using the tokens provided in the URL hash
  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token || "",
  });

  if (sessionError) {
    return NextResponse.json({ error: "The reset link has expired or is invalid. Please request a new one." }, { status: 401 });
  }

  // Now that we have a valid session, we can update the user's password
  const { data, error: updateError } = await supabase.auth.updateUser({
    password,
  });

  if (updateError || !data.user) {
    return NextResponse.json({ error: updateError?.message ?? "Failed to update password." }, { status: 400 });
  }

  let role = "customer";

  // Set the new secure cookies so they are immediately logged in
  if (sessionData.session) {
    const cookieStore = await cookies();
    cookieStore.set(authCookieNames.access, sessionData.session.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: sessionData.session.expires_in,
    });
    
    if (sessionData.session.refresh_token) {
      cookieStore.set(authCookieNames.refresh, sessionData.session.refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    const authenticatedSupabase = getAuthenticatedSupabaseServerClient(sessionData.session.access_token);

    if (authenticatedSupabase) {
      const { data: userData } = await authenticatedSupabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      role = userData?.role ?? role;
    }
  }

  return NextResponse.json({ success: true, role });
}
